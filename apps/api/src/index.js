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

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/units', unitsRouter);
app.use('/api/reports', reportsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
