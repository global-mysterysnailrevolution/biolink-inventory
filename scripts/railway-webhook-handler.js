/**
 * Railway Webhook Handler
 * Receives webhooks from Railway and processes deployment events
 * 
 * Deploy this as a separate service or use Railway's webhook feature
 */

import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3002;
const WEBHOOK_SECRET = process.env.RAILWAY_WEBHOOK_SECRET || 'change-this-secret';

app.use(express.json());

// Verify webhook signature (if Railway provides it)
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Webhook endpoint
app.post('/webhook/railway', (req, res) => {
  const event = req.body;
  
  console.log(`📨 Received Railway webhook: ${event.type || 'unknown'}`);
  
  // Verify signature if provided
  const signature = req.headers['x-railway-signature'];
  if (signature && !verifySignature(req.body, signature)) {
    console.error('❌ Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process different event types
  switch (event.type) {
    case 'deployment.created':
      console.log(`🚀 Deployment created: ${event.deployment?.id}`);
      console.log(`   Service: ${event.service?.name}`);
      console.log(`   Status: ${event.deployment?.status}`);
      // Trigger notifications, logging, etc.
      break;
      
    case 'deployment.updated':
      console.log(`🔄 Deployment updated: ${event.deployment?.id}`);
      console.log(`   Status: ${event.deployment?.status}`);
      
      if (event.deployment?.status === 'FAILED') {
        console.error(`❌ Deployment failed!`);
        // Send alerts, create issues, etc.
      } else if (event.deployment?.status === 'SUCCESS') {
        console.log(`✅ Deployment successful!`);
      }
      break;
      
    case 'build.started':
      console.log(`🔨 Build started: ${event.build?.id}`);
      break;
      
    case 'build.completed':
      console.log(`✅ Build completed: ${event.build?.id}`);
      if (event.build?.status === 'FAILED') {
        console.error(`❌ Build failed!`);
      }
      break;
      
    default:
      console.log(`ℹ️  Unknown event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'railway-webhook-handler' });
});

app.listen(PORT, () => {
  console.log(`🔔 Railway webhook handler listening on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook/railway`);
});
