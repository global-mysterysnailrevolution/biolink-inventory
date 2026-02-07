/**
 * Startup script that runs migrations then starts the server
 * Handles migration failures gracefully
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Running database migrations...');

// Run migrations
const migrateProcess = spawn('node', [join(__dirname, 'migrate.js')], {
  stdio: 'inherit',
  cwd: join(__dirname, '..', '..')
});

migrateProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`⚠️  Migrations exited with code ${code}`);
    console.error('⚠️  Continuing anyway - server will start but database may not be ready');
  } else {
    console.log('✅ Migrations completed successfully');
  }
  
  console.log('🚀 Starting API server...');
  
  // Start the server
  const serverProcess = spawn('node', [join(__dirname, '..', 'index.js')], {
    stdio: 'inherit',
    cwd: join(__dirname, '..', '..')
  });
  
  serverProcess.on('close', (code) => {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  });
});

migrateProcess.on('error', (err) => {
  console.error('❌ Failed to run migrations:', err);
  console.error('⚠️  Starting server anyway...');
  
  // Start server even if migrations fail
  const serverProcess = spawn('node', [join(__dirname, '..', 'index.js')], {
    stdio: 'inherit',
    cwd: join(__dirname, '..', '..')
  });
  
  serverProcess.on('close', (code) => {
    process.exit(code);
  });
});
