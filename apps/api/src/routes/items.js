/**
 * Items API Routes
 */

import express from 'express';
import pg from 'pg';

const router = express.Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// List items
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = 'SELECT * FROM items WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Error listing items:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM items WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      defaultQuantity,
      photoUrl,
      externalProductId,
      externalVariantId
    } = req.body;

    if (!name || !unit) {
      return res.status(400).json({ error: 'name and unit are required' });
    }

    const result = await pool.query(`
      INSERT INTO items (
        name, description, category, unit, default_quantity,
        photo_url, external_product_id, external_variant_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      name, description, category, unit, defaultQuantity,
      photoUrl, externalProductId, externalVariantId
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
