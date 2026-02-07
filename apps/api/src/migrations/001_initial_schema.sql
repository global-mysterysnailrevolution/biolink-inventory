-- Initial Schema for Bio-Link Depot Inventory System
-- Migration: 001_initial_schema

-- Items (catalog)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(50) NOT NULL,
  default_quantity INTEGER,
  photo_url TEXT,
  external_product_id VARCHAR(255),
  external_variant_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Physical Units
CREATE TABLE IF NOT EXISTS physical_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode VARCHAR(255) UNIQUE NOT NULL,
  qr_code TEXT NOT NULL,
  item_id UUID REFERENCES items(id),
  lot_number VARCHAR(100),
  expiration_date DATE,
  photo_url TEXT,
  location VARCHAR(100),
  status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users (must be created before events table)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'ADMIN' or 'WAREHOUSE'
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organizations/Programs
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'org' or 'program'
  parent_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Containment relationships
CREATE TABLE IF NOT EXISTS containments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_unit_id UUID REFERENCES physical_units(id),
  child_unit_id UUID REFERENCES physical_units(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  effective_from TIMESTAMP DEFAULT NOW(),
  effective_to TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_unit_id, child_unit_id, effective_from)
);

-- Events (immutable audit log) - must be after users table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  unit_id UUID REFERENCES physical_units(id),
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_physical_units_barcode ON physical_units(barcode);
CREATE INDEX IF NOT EXISTS idx_containments_parent ON containments(parent_unit_id);
CREATE INDEX IF NOT EXISTS idx_containments_child ON containments(child_unit_id);
CREATE INDEX IF NOT EXISTS idx_events_unit ON events(unit_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_physical_units_status ON physical_units(status);
