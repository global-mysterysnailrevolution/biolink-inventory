# Manual Railway Variable Upload Guide

If you prefer to upload variables manually or the script doesn't work, here's how:

## Method 1: Railway Dashboard (Easiest)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your project
3. Click on your **API service**
4. Go to **Variables** tab
5. Click **"New Variable"** for each variable
6. Copy-paste from your `.env.railway` file

## Method 2: Railway CLI (Command Line)

### Setup Railway CLI:
```powershell
npm install -g @railway/cli
railway login
railway link  # Link to your project
```

### Upload Variables:

**For API Service:**
```powershell
# Set each variable individually
railway variables set "DATABASE_URL=${{ Postgres.DATABASE_URL }}" --service your-api-service-name
railway variables set "JWT_SECRET=your-secret-here" --service your-api-service-name
railway variables set "SESSION_SECRET=your-secret-here" --service your-api-service-name
railway variables set "NODE_ENV=production" --service your-api-service-name
```

**For Web Service:**
```powershell
railway variables set "NEXT_PUBLIC_API_URL=https://your-api.railway.app" --service your-web-service-name
railway variables set "NODE_ENV=production" --service your-web-service-name
```

### Bulk Upload from File:

You can also use the PowerShell script:
```powershell
.\scripts\upload-env-to-railway.ps1 -EnvFile .env.railway -ServiceName "your-service-name"
```

## Method 3: Copy-Paste Format

Here's a format you can copy-paste into Railway's dashboard:

### API Service Variables:
```
DATABASE_URL=${{ Postgres.DATABASE_URL }}
JWT_SECRET=your-generated-secret-here
SESSION_SECRET=your-different-secret-here
NODE_ENV=production
STORAGE_TYPE=filesystem
```

### Web Service Variables:
```
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
NODE_ENV=production
```

## Finding Your Service Names

1. Go to Railway Dashboard
2. Your services are listed in the left sidebar
3. Service names are usually like:
   - `biolink-api` or `api-production`
   - `biolink-web` or `web-production`

## Tips

- Railway variable references like `${{ Postgres.DATABASE_URL }}` work automatically
- After adding variables, Railway will redeploy automatically
- Check logs to verify variables are being read correctly
