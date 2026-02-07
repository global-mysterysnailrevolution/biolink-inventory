/**
 * Zoho Inventory Sync Service
 * Syncs items from Zoho Inventory to Bio-Link database
 */

import pg from 'pg';

const { Pool } = pg;

export class ZohoSyncService {
  constructor(dbPool) {
    this.db = dbPool;
    this.syncStats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Map Zoho item to Bio-Link item format
   */
  mapZohoItemToBioLink(zohoItem) {
    return {
      name: zohoItem.name || zohoItem.item_name || 'Unnamed Item',
      description: zohoItem.description || zohoItem.item_desc || null,
      category: zohoItem.category || zohoItem.item_category || null,
      unit: zohoItem.unit || zohoItem.stock_unit || 'unit',
      default_quantity: zohoItem.quantity || zohoItem.stock_on_hand || null,
      photo_url: zohoItem.image || zohoItem.image_url || null,
      external_product_id: zohoItem.item_id?.toString() || zohoItem.id?.toString() || null,
      external_variant_id: zohoItem.sku || zohoItem.item_code || null
    };
  }

  /**
   * Sync a single Zoho item to Bio-Link database
   */
  async syncItem(zohoItem) {
    try {
      const mappedItem = this.mapZohoItemToBioLink(zohoItem);
      
      // Check if item already exists by external_product_id
      if (mappedItem.external_product_id) {
        const existing = await this.db.query(
          'SELECT id FROM items WHERE external_product_id = $1',
          [mappedItem.external_product_id]
        );

        if (existing.rows.length > 0) {
          // Update existing item
          await this.db.query(`
            UPDATE items 
            SET 
              name = $1,
              description = $2,
              category = $3,
              unit = $4,
              default_quantity = $5,
              photo_url = $6,
              external_variant_id = $7,
              updated_at = NOW()
            WHERE external_product_id = $8
          `, [
            mappedItem.name,
            mappedItem.description,
            mappedItem.category,
            mappedItem.unit,
            mappedItem.default_quantity,
            mappedItem.photo_url,
            mappedItem.external_variant_id,
            mappedItem.external_product_id
          ]);
          this.syncStats.updated++;
          return { action: 'updated', item: mappedItem };
        }
      }

      // Create new item
      const result = await this.db.query(`
        INSERT INTO items (
          name, description, category, unit, default_quantity,
          photo_url, external_product_id, external_variant_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name
      `, [
        mappedItem.name,
        mappedItem.description,
        mappedItem.category,
        mappedItem.unit,
        mappedItem.default_quantity,
        mappedItem.photo_url,
        mappedItem.external_product_id,
        mappedItem.external_variant_id
      ]);

      this.syncStats.created++;
      return { action: 'created', item: result.rows[0] };
    } catch (error) {
      console.error(`Error syncing item ${zohoItem.name || zohoItem.item_name}:`, error);
      this.syncStats.errors.push({
        item: zohoItem.name || zohoItem.item_name || 'Unknown',
        error: error.message
      });
      this.syncStats.skipped++;
      return { action: 'error', error: error.message };
    }
  }

  /**
   * Sync multiple items from Zoho
   */
  async syncItems(zohoItems) {
    this.syncStats = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    console.log(`Syncing ${zohoItems.length} items from Zoho...`);

    for (const zohoItem of zohoItems) {
      await this.syncItem(zohoItem);
    }

    return this.syncStats;
  }

  /**
   * Get sync statistics
   */
  getStats() {
    return this.syncStats;
  }
}
