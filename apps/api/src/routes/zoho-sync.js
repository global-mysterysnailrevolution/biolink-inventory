/**
 * Zoho Sync API Routes
 * Endpoints for syncing items from Zoho Inventory
 */

import express from 'express';
import pg from 'pg';
import { ZohoSyncService } from '../services/zoho-sync.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const syncService = new ZohoSyncService(pool);

/**
 * POST /api/zoho-sync/items
 * Sync items from Zoho Inventory
 * 
 * Body: { items: [...] } - Array of Zoho items
 * Or: { syncAll: true } - Will use MCP tools to fetch from Zoho
 */
router.post('/items', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { items, syncAll } = req.body;

    let zohoItems = [];

    if (syncAll) {
      // Use MCP tools to fetch from Zoho
      // Note: This would need to be called from a script that has MCP access
      // For now, we'll expect items to be passed in the request
      return res.status(400).json({ 
        error: 'syncAll requires MCP integration. Use the sync script instead.' 
      });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        error: 'items array is required' 
      });
    }

    zohoItems = items;

    // Sync items
    const stats = await syncService.syncItems(zohoItems);

    res.json({
      success: true,
      stats: {
        total: zohoItems.length,
        created: stats.created,
        updated: stats.updated,
        skipped: stats.skipped,
        errors: stats.errors.length
      },
      errors: stats.errors
    });
  } catch (error) {
    console.error('Error syncing Zoho items:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/zoho-sync/stats
 * Get sync statistics
 */
router.get('/stats', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const stats = syncService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting sync stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
