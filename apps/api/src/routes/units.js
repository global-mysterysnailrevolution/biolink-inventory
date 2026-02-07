/**
 * Units API Routes
 */

import express from 'express';
import { UnitService } from '../services/unit-service.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import pg from 'pg';

const router = express.Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const unitService = new UnitService(pool);

// Get unit by barcode (public for scanning)
router.get('/:barcode', authenticate, async (req, res) => {
  try {
    const unit = await unitService.getUnitByBarcode(req.params.barcode);
    
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    
    res.json(unit);
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create unit (intake) - requires WAREHOUSE role
router.post('/', authenticate, requireRole('WAREHOUSE', 'ADMIN'), async (req, res) => {
  try {
    const {
      itemId,
      barcode,
      lotNumber,
      expirationDate,
      photoUrl,
      location,
      userId
    } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }

    const unit = await unitService.createUnit({
      itemId,
      barcode,
      lotNumber,
      expirationDate,
      photoUrl,
      location,
      userId: userId || req.user?.id
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add containment
router.post('/:id/contain', async (req, res) => {
  try {
    const { parentId, childId, quantity, unit } = req.body;
    
    if (!parentId || !childId || !quantity) {
      return res.status(400).json({ 
        error: 'parentId, childId, and quantity are required' 
      });
    }

    const containment = await unitService.addContainment(
      parentId,
      childId,
      quantity,
      unit || 'each',
      req.user?.id
    );

    res.json(containment);
  } catch (error) {
    console.error('Error adding containment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Split unit
router.post('/:id/split', async (req, res) => {
  try {
    const { splits } = req.body; // [{ quantity, unit, newBarcode? }]
    
    if (!splits || !Array.isArray(splits)) {
      return res.status(400).json({ error: 'splits array is required' });
    }

    const newUnits = await unitService.splitUnit(
      req.params.id,
      splits,
      req.user?.id
    );

    res.json({ newUnits });
  } catch (error) {
    console.error('Error splitting unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Combine units
router.post('/:id/combine', async (req, res) => {
  try {
    const { unitIds } = req.body;
    
    if (!unitIds || !Array.isArray(unitIds)) {
      return res.status(400).json({ error: 'unitIds array is required' });
    }

    const result = await unitService.combineUnits(
      unitIds,
      req.params.id,
      req.user?.id
    );

    res.json(result);
  } catch (error) {
    console.error('Error combining units:', error);
    res.status(500).json({ error: error.message });
  }
});

// Move unit
router.post('/:id/move', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'location is required' });
    }

    const result = await unitService.moveUnit(
      req.params.id,
      location,
      req.user?.id
    );

    res.json(result);
  } catch (error) {
    console.error('Error moving unit:', error);
    res.status(500).json({ error: error.message });
  }
});

// Checkout unit
router.post('/:id/checkout', async (req, res) => {
  try {
    const { orgId, programId, donationValue, notes } = req.body;
    
    if (!orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    const result = await unitService.checkoutUnit(
      req.params.id,
      orgId,
      programId,
      donationValue,
      notes,
      req.user?.id
    );

    res.json(result);
  } catch (error) {
    console.error('Error checking out unit:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
