/**
 * Database Seeder
 * Seeds initial data for development
 */

import pg from 'pg';
import bcrypt from 'bcrypt';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/biolink';

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['admin@biolink.local', adminPassword, 'ADMIN', 'Admin User']);
    
    if (adminResult.rows.length > 0) {
      console.log('✓ Created admin user: admin@biolink.local / admin123');
    } else {
      console.log('⏭  Admin user already exists');
    }
    
    // Create warehouse user
    const warehousePassword = await bcrypt.hash('warehouse123', 10);
    const warehouseResult = await client.query(`
      INSERT INTO users (email, password_hash, role, name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['warehouse@biolink.local', warehousePassword, 'WAREHOUSE', 'Warehouse User']);
    
    if (warehouseResult.rows.length > 0) {
      console.log('✓ Created warehouse user: warehouse@biolink.local / warehouse123');
    } else {
      console.log('⏭  Warehouse user already exists');
    }
    
    // Create test organization
    const orgResult = await client.query(`
      INSERT INTO organizations (name, type)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, ['Test Organization', 'org']);
    
    if (orgResult.rows.length > 0) {
      console.log('✓ Created test organization');
    }
    
    // Create test program
    if (orgResult.rows.length > 0) {
      await client.query(`
        INSERT INTO organizations (name, type, parent_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, ['Test Program', 'program', orgResult.rows[0].id]);
      console.log('✓ Created test program');
    }
    
    console.log('✅ Seeding complete');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
