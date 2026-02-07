# Troubleshooting Railway "Application failed to respond"

## Step 1: Check Deploy Logs

1. Go to Railway Dashboard
2. Click on your **API service**
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Check the **"Build Logs"** and **"Deploy Logs"**

Look for errors like:
- ❌ "Missing environment variable"
- ❌ "Database connection failed"
- ❌ "Migration failed"
- ❌ "Port already in use"
- ❌ "Module not found"

## Common Issues & Fixes

### Issue 1: Missing DATABASE_URL

**Error:** `DATABASE_URL is not defined` or connection errors

**Fix:**
1. Go to API service → Variables
2. Add: `DATABASE_URL = ${{ Postgres.DATABASE_URL }}`
3. Make sure Postgres service exists and is running

### Issue 2: Migrations Failing

**Error:** `relation "items" does not exist` or migration errors

**Fix:**
1. Check that migrations run on startup
2. Verify `apps/api/src/migrations/001_initial_schema.sql` exists
3. Check migration script path is correct

### Issue 3: Port Configuration

**Error:** Port binding issues

**Fix:**
1. API should use `process.env.PORT` (Railway provides this)
2. Don't hardcode port numbers
3. Remove `PORT=3001` from variables if causing issues

### Issue 4: Build Failures

**Error:** Build step failed

**Fix:**
1. Verify Root Directory is set to `apps/api` for API service
2. Check that `package.json` exists in `apps/api`
3. Ensure all dependencies are listed

### Issue 5: Missing Environment Variables

**Error:** `JWT_SECRET is not defined`

**Fix:**
1. Add all required variables to API service:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

## Quick Diagnostic Commands

### Check if service is running:
```bash
# In Railway logs, you should see:
# "🚀 API server running on http://localhost:PORT"
```

### Test database connection:
```bash
# Check logs for:
# "Connected to database" or database errors
```

### Verify migrations:
```bash
# Check logs for:
# "Migrations completed" or migration errors
```

## Step-by-Step Debugging

1. **Check Build Logs**
   - Did the build complete?
   - Any npm install errors?
   - Any TypeScript/build errors?

2. **Check Deploy Logs**
   - Does the service start?
   - Any runtime errors?
   - Database connection successful?

3. **Check Environment Variables**
   - All required vars present?
   - DATABASE_URL correct?
   - No typos in variable names?

4. **Check Service Configuration**
   - Root Directory = `apps/api`?
   - Start command correct?
   - Health check path = `/health`?

## Getting Help

If still stuck:
1. Copy the error from logs
2. Check Railway's [Common Errors docs](https://docs.railway.app/troubleshooting)
3. Railway Help Station for support
