/**
 * Reports API Routes
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import pg from 'pg';

const router = express.Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Inventory on hand - requires authentication
router.get('/inventory', authenticate, async (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT 
        i.category,
        i.name,
        COUNT(pu.id) as unit_count,
        SUM(CASE WHEN pu.status = 'available' THEN 1 ELSE 0 END) as available_count
      FROM items i
      LEFT JOIN physical_units pu ON i.id = pu.item_id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND i.category = $1';
      params.push(category);
    }

    query += ' GROUP BY i.category, i.name ORDER BY i.category, i.name';

    const result = await pool.query(query, params);
    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Distributions report - requires ADMIN role
router.get('/distributions', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { orgId, programId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        e.timestamp,
        e.metadata->>'orgId' as org_id,
        e.metadata->>'programId' as program_id,
        e.metadata->>'donationValue' as donation_value,
        e.metadata->>'notes' as notes,
        pu.barcode,
        i.name as item_name,
        o.name as org_name
      FROM events e
      JOIN physical_units pu ON e.unit_id = pu.id
      LEFT JOIN items i ON pu.item_id = i.id
      LEFT JOIN organizations o ON (e.metadata->>'orgId')::uuid = o.id
      WHERE e.type = 'checkout'
    `;
    const params = [];
    let paramIndex = 1;

    if (orgId) {
      query += ` AND e.metadata->>'orgId' = $${paramIndex++}`;
      params.push(orgId);
    }

    if (programId) {
      query += ` AND e.metadata->>'programId' = $${paramIndex++}`;
      params.push(programId);
    }

    if (startDate) {
      query += ` AND e.timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND e.timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ' ORDER BY e.timestamp DESC';

    const result = await pool.query(query, params);
    res.json({ distributions: result.rows });
  } catch (error) {
    console.error('Error generating distributions report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Audit trail export
router.get('/audit', async (req, res) => {
  try {
    const { unitId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        e.*,
        pu.barcode,
        i.name as item_name,
        u.name as user_name
      FROM events e
      JOIN physical_units pu ON e.unit_id = pu.id
      LEFT JOIN items i ON pu.item_id = i.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (unitId) {
      query += ` AND e.unit_id = $${paramIndex++}`;
      params.push(unitId);
    }

    if (startDate) {
      query += ` AND e.timestamp >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND e.timestamp <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ' ORDER BY e.timestamp DESC';

    const result = await pool.query(query, params);
    
    // Return as CSV-ready format
    res.json({ 
      events: result.rows,
      format: 'csv',
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error generating audit trail:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
