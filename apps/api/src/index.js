/**
 * Bio-Link Depot Inventory API Server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import authRouter from './routes/auth.js';
import itemsRouter from './routes/items.js';
import unitsRouter from './routes/units.js';
import reportsRouter from './routes/reports.js';
import zohoSyncRouter from './routes/zoho-sync.js';

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/units', unitsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/zoho-sync', zohoSyncRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bio-Link Depot Inventory API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      items: '/api/items',
      units: '/api/units',
      reports: '/api/reports',
      zohoSync: '/api/zoho-sync'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      health: '/health',
      auth: '/api/auth',
      items: '/api/items',
      units: '/api/units',
      reports: '/api/reports'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/items`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/units/:barcode`);
});
