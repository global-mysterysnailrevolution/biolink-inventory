/**
 * Physical Unit Service
 * Handles unit operations: create, scan, contain, split, combine
 */

import { randomUUID } from 'crypto';
import pg from 'pg';
import QRCode from 'qrcode';

const { Client } = pg;

export class UnitService {
  constructor(dbClient) {
    this.db = dbClient;
  }

  /**
   * Create a new physical unit
   */
  async createUnit(data) {
    const {
      itemId,
      barcode,
      lotNumber,
      expirationDate,
      photoUrl,
      location,
      userId
    } = data;

    // Generate barcode if not provided
    const finalBarcode = barcode || `UNIT-${randomUUID()}`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(finalBarcode);

    const result = await this.db.query(`
      INSERT INTO physical_units (
        barcode, qr_code, item_id, lot_number, 
        expiration_date, photo_url, location, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      finalBarcode, qrCode, itemId, lotNumber,
      expirationDate, photoUrl, location, 'available'
    ]);

    // Log intake event
    await this.logEvent({
      type: 'intake',
      unitId: result.rows[0].id,
      userId,
      metadata: {
        location,
        lotNumber,
        expirationDate,
        photoUrl
      }
    });

    return result.rows[0];
  }

  /**
   * Get unit by barcode
   */
  async getUnitByBarcode(barcode) {
    const result = await this.db.query(`
      SELECT 
        pu.*,
        i.name as item_name,
        i.category,
        i.unit as item_unit
      FROM physical_units pu
      LEFT JOIN items i ON pu.item_id = i.id
      WHERE pu.barcode = $1
    `, [barcode]);

    if (result.rows.length === 0) {
      return null;
    }

    const unit = result.rows[0];
    
    // Get containment relationships
    unit.contains = await this.getContainments(unit.id);
    unit.contained_in = await this.getParentContainments(unit.id);

    return unit;
  }

  /**
   * Get containments (what this unit contains)
   */
  async getContainments(unitId) {
    const result = await this.db.query(`
      SELECT 
        c.*,
        pu.barcode as child_barcode,
        pu.status as child_status,
        i.name as child_item_name
      FROM containments c
      JOIN physical_units pu ON c.child_unit_id = pu.id
      LEFT JOIN items i ON pu.item_id = i.id
      WHERE c.parent_unit_id = $1
        AND c.effective_to IS NULL
    `, [unitId]);

    return result.rows;
  }

  /**
   * Get parent containments (what contains this unit)
   */
  async getParentContainments(unitId) {
    const result = await this.db.query(`
      SELECT 
        c.*,
        pu.barcode as parent_barcode,
        pu.status as parent_status
      FROM containments c
      JOIN physical_units pu ON c.parent_unit_id = pu.id
      WHERE c.child_unit_id = $1
        AND c.effective_to IS NULL
    `, [unitId]);

    return result.rows;
  }

  /**
   * Add containment (parent contains child)
   */
  async addContainment(parentId, childId, quantity, unit, userId) {
    const result = await this.db.query(`
      INSERT INTO containments (parent_unit_id, child_unit_id, quantity, unit)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [parentId, childId, quantity, unit]);

    await this.logEvent({
      type: 'move',
      unitId: childId,
      userId,
      metadata: {
        parentUnitId: parentId,
        childUnitId: childId,
        quantity,
        unit
      }
    });

    return result.rows[0];
  }

  /**
   * Split a unit into multiple units
   */
  async splitUnit(unitId, splits, userId) {
    // splits: [{ quantity, unit, newBarcode? }]
    
    await this.db.query('BEGIN');
    
    try {
      // Get original unit
      const original = await this.db.query(
        'SELECT * FROM physical_units WHERE id = $1',
        [unitId]
      );

      if (original.rows.length === 0) {
        throw new Error('Unit not found');
      }

      const newUnits = [];
      
      // Create new units for each split
      for (const split of splits) {
        const newUnit = await this.createUnit({
          itemId: original.rows[0].item_id,
          barcode: split.newBarcode,
          lotNumber: original.rows[0].lot_number,
          expirationDate: original.rows[0].expiration_date,
          location: original.rows[0].location,
          userId
        });
        newUnits.push(newUnit);
      }

      // End current containments if this unit was a child
      await this.db.query(`
        UPDATE containments
        SET effective_to = NOW()
        WHERE child_unit_id = $1 AND effective_to IS NULL
      `, [unitId]);

      // Log split event
      await this.logEvent({
        type: 'split',
        unitId,
        userId,
        metadata: {
          sourceUnits: [unitId],
          targetUnits: newUnits.map(u => u.id),
          quantities: splits.map(s => s.quantity)
        }
      });

      await this.db.query('COMMIT');
      return newUnits;
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Combine multiple units into one
   */
  async combineUnits(unitIds, targetUnitId, userId) {
    await this.db.query('BEGIN');
    
    try {
      // End containments for source units
      for (const unitId of unitIds) {
        await this.db.query(`
          UPDATE containments
          SET effective_to = NOW()
          WHERE (parent_unit_id = $1 OR child_unit_id = $1)
            AND effective_to IS NULL
        `, [unitId]);

        // Mark source units as adjusted
        await this.db.query(`
          UPDATE physical_units
          SET status = 'adjusted'
          WHERE id = $1
        `, [unitId]);
      }

      // Log combine event
      await this.logEvent({
        type: 'combine',
        unitId: targetUnitId,
        userId,
        metadata: {
          sourceUnits: unitIds,
          targetUnits: [targetUnitId]
        }
      });

      await this.db.query('COMMIT');
      return { success: true };
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  /**
   * Move unit to new location
   */
  async moveUnit(unitId, newLocation, userId) {
    await this.db.query(`
      UPDATE physical_units
      SET location = $1, updated_at = NOW()
      WHERE id = $2
    `, [newLocation, unitId]);

    await this.logEvent({
      type: 'move',
      unitId,
      userId,
      metadata: { location: newLocation }
    });

    return { success: true };
  }

  /**
   * Checkout unit (distribution)
   */
  async checkoutUnit(unitId, orgId, programId, donationValue, notes, userId) {
    await this.db.query(`
      UPDATE physical_units
      SET status = 'checked-out', updated_at = NOW()
      WHERE id = $1
    `, [unitId]);

    await this.logEvent({
      type: 'checkout',
      unitId,
      userId,
      metadata: {
        orgId,
        programId,
        donationValue,
        notes
      }
    });

    return { success: true };
  }

  /**
   * Log event to audit ledger
   */
  async logEvent({ type, unitId, userId, metadata }) {
    await this.db.query(`
      INSERT INTO events (type, unit_id, user_id, metadata)
      VALUES ($1, $2, $3, $4)
    `, [type, unitId, userId, JSON.stringify(metadata)]);
  }
}
