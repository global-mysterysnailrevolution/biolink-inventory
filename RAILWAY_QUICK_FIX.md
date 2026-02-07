# Railway Deployment Quick Fix Guide

## Common Issues and Solutions

### Issue 1: Railway Can't Find the Service

**Problem**: Railway doesn't know which directory to deploy from a monorepo.

**Solution**: 
1. In Railway dashboard, when creating a service, set the **Root Directory**:
   - For API: `apps/api`
   - For Web: `apps/web`

### Issue 2: Build Fails - Missing Dependencies

**Problem**: Dependencies not installing correctly.

**Solution**: 
- Railway should auto-detect `package.json` in each service root
- If it doesn't, manually set **Build Command**: `npm install`

### Issue 3: API Won't Start - Database Connection

**Problem**: `DATABASE_URL` not set or incorrect.

**Solution**:
1. Add Postgres service in Railway
2. Copy `DATABASE_URL` from Postgres service variables
3. Add to API service environment variables
4. Format: `postgresql://user:pass@host:port/dbname`

### Issue 4: Migrations Don't Run

**Problem**: Database tables don't exist.

**Solution**:
- The `Procfile` in `apps/api/` runs migrations on start: `npm run migrate && npm start`
- If that fails, manually run migrations:
  1. Go to Railway API service → Settings → Deployments
  2. Click "Deploy" → "Run Command"
  3. Enter: `npm run migrate`

### Issue 5: Web Can't Connect to API

**Problem**: Frontend gets CORS errors or 404s.

**Solution**:
1. Get your API service public URL from Railway (e.g., `https://api-production-xxxx.up.railway.app`)
2. Set in Web service environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
   ```
3. The `next.config.js` will proxy `/api/*` requests to this URL

### Issue 6: Port Already in Use

**Problem**: Railway assigns PORT automatically, but code uses hardcoded port.

**Solution**: 
- ✅ Already fixed! The API uses `process.env.PORT || 3001`
- Railway automatically sets `PORT` env var

## Step-by-Step Railway Setup

1. **Create Project**
   - New Project → Deploy from GitHub → Select `biolink-inventory`

2. **Add Postgres Database**
   - New → Database → PostgreSQL
   - Copy `DATABASE_URL` from variables

3. **Create API Service**
   - New → GitHub Repo → Select `biolink-inventory`
   - **Root Directory**: `apps/api`
   - **Build Command**: (leave empty, auto-detects)
   - **Start Command**: `npm run migrate && npm start`
   - **Environment Variables**:
     ```
     DATABASE_URL=<from-postgres>
     JWT_SECRET=<random-32-chars>
     SESSION_SECRET=<random-32-chars>
     NODE_ENV=production
     ```

4. **Create Web Service**
   - New → GitHub Repo → Select `biolink-inventory`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
     NODE_ENV=production
     ```

5. **Deploy**
   - Railway auto-deploys on push to `main`
   - Or click "Deploy" in dashboard

## Verify Deployment

- **API Health**: `https://your-api.railway.app/health`
- **Web**: `https://your-web.railway.app`
- **Check Logs**: Railway dashboard → Service → Logs

## If Still Failing

Check Railway logs for specific errors:
1. Go to service → "Deployments" tab
2. Click on latest deployment
3. Check "Build Logs" and "Deploy Logs"
4. Look for error messages and fix accordingly
