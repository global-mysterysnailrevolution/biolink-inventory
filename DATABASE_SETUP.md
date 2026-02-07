# Database Setup Guide

## What Database?

The Bio-Link Depot Inventory System uses **PostgreSQL** (Postgres) as its database.

## Local Development

For local development, we use **Docker Compose** to run Postgres in a container:

```powershell
# Start Postgres (from repo root)
docker-compose up -d postgres
```

This starts a Postgres container with:
- **Database name**: `biolink`
- **Username**: `postgres`
- **Password**: `postgres`
- **Port**: `5432`
- **Connection string**: `postgresql://postgres:postgres@localhost:5432/biolink`

## Production (Railway)

For production deployment on Railway, you have **two options**:

### Option 1: Railway's Managed Postgres (Recommended)

Railway provides a managed Postgres service:

1. **In Railway Dashboard**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically creates a Postgres database
   - Railway provides a `DATABASE_URL` automatically

2. **The `DATABASE_URL` looks like**:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

3. **Railway automatically**:
   - Sets up the database
   - Provides connection credentials
   - Handles backups
   - Manages scaling

4. **You just need to**:
   - Copy the `DATABASE_URL` from Railway's Postgres service
   - Add it to your API service's environment variables
   - The migrations will run automatically on deploy

### Option 2: External Postgres (Supabase, Neon, etc.)

If you prefer to use an external Postgres provider:

1. **Supabase**:
   - Create project at [supabase.com](https://supabase.com)
   - Get connection string from Settings → Database
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

2. **Neon**:
   - Create project at [neon.tech](https://neon.tech)
   - Get connection string from dashboard
   - Similar format to Supabase

3. **Add to Railway**:
   - In your API service → Variables
   - Add `DATABASE_URL` with your external connection string

## Database Schema

The database schema is defined in migration files:
- `apps/api/src/migrations/001_initial_schema.sql`

**Tables created**:
- `items` - Product catalog
- `physical_units` - Physical inventory items
- `containments` - Parent-child relationships (nesting)
- `events` - Immutable audit log
- `organizations` - Organizations/programs
- `users` - System users
- `schema_migrations` - Tracks which migrations have run

## Running Migrations

Migrations run automatically when the API starts (via `Procfile`):
```
web: npm run migrate && npm start
```

Or manually:
```bash
cd apps/api
npm run migrate
```

## Seeding Data

To add initial test data:
```bash
cd apps/api
npm run seed
```

This creates:
- Admin user: `admin@biolink.local` / `admin123`
- Warehouse user: `warehouse@biolink.local` / `warehouse123`
- Test organizations

## Connection String Format

Postgres connection strings follow this format:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

Examples:
- **Local**: `postgresql://postgres:postgres@localhost:5432/biolink`
- **Railway**: `postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway`
- **Supabase**: `postgresql://postgres.xxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`

## Troubleshooting

### Can't connect to database
- Check `DATABASE_URL` is set correctly
- Verify Postgres service is running (Railway dashboard)
- Check firewall/network settings
- Ensure password doesn't contain special characters (URL encode if needed)

### Migrations fail
- Check database exists
- Verify user has CREATE TABLE permissions
- Check migration logs in Railway

### "Database does not exist"
- Railway Postgres creates database automatically
- For external providers, create database manually first

## Summary

**For Railway deployment:**
1. Add Postgres service in Railway (one click)
2. Copy `DATABASE_URL` from Postgres service
3. Add to API service environment variables
4. Deploy - migrations run automatically

That's it! Railway handles everything else.
