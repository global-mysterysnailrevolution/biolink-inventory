# Railway Deployment Guide

## Setup Instructions

### 1. Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `biolink-inventory` repository

### 2. Add Services

Railway will auto-detect the monorepo structure. You need to create **TWO services**:

#### Service 1: API Backend
- **Root Directory**: `apps/api`
- **Build Command**: `npm install`
- **Start Command**: `npm run migrate && npm start`
- **Port**: Railway will assign automatically (use `PORT` env var)

#### Service 2: Web Frontend
- **Root Directory**: `apps/web`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: Railway will assign automatically

### 3. Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway will create a Postgres service
3. Copy the `DATABASE_URL` from the Postgres service variables

### 4. Configure Environment Variables

For **API Service**, add these variables:

```env
DATABASE_URL=<from-postgres-service>
JWT_SECRET=<generate-random-32-char-string>
SESSION_SECRET=<generate-random-32-char-string>
PORT=3001
NODE_ENV=production
```

For **Web Service**, add these variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
NODE_ENV=production
PORT=3000
```

### 5. Deploy

Railway will automatically deploy on push to `main` branch, or you can trigger manually from the dashboard.

## Troubleshooting

### API won't start
- Check that `DATABASE_URL` is set correctly
- Verify migrations run: Check logs for migration errors
- Ensure `PORT` env var is set (Railway provides this automatically)

### Web can't connect to API
- Set `NEXT_PUBLIC_API_URL` to your API service's public URL
- Check that API service is running and healthy
- Verify CORS is enabled in API (it is by default)

### Database connection errors
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Check that Postgres service is running
- Ensure migrations have run (check API startup logs)

### Build failures
- Check that all dependencies are in `package.json`
- Verify Node.js version (Railway uses Node 18 by default)
- Check build logs for specific errors

## Manual Deployment Commands

If auto-deploy fails, you can deploy manually:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy API
cd apps/api
railway up

# Deploy Web (in separate terminal)
cd apps/web
railway up
```

## Service URLs

After deployment:
- **API**: `https://your-api-service.railway.app`
- **Web**: `https://your-web-service.railway.app`
- **Database**: Internal connection only (via `DATABASE_URL`)

## Health Checks

- API health: `https://your-api-service.railway.app/health`
- Web: Just visit the root URL
