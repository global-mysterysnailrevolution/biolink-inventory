# Upload Variables to Railway - Step by Step

Your environment variables are ready! Here's how to upload them.

## Option 1: Railway Dashboard (Easiest)

### For API Service:

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **API service** (the one with Root Directory = `apps/api`)
3. Click **"Variables"** tab
4. Add each variable one by one:

```
DATABASE_URL = ${{ Postgres.DATABASE_URL }}
JWT_SECRET = dkehfneislflek348skenfkelsensm32
SESSION_SECRET = skenfmsje5n385irkej32hrn3w9to4lk
NODE_ENV = production
PORT = 3001
STORAGE_TYPE = filesystem
STORAGE_PATH = ./uploads
```

**Important:** For `DATABASE_URL`, you can either:
- Use the variable reference: `${{ Postgres.DATABASE_URL }}` (recommended)
- OR copy the actual connection string from your Postgres service

### For Web Service:

1. Select your **Web service** (the one with Root Directory = `apps/web`)
2. Click **"Variables"** tab
3. Add:

```
NEXT_PUBLIC_API_URL = https://biolink-inventory-production.up.railway.app
NODE_ENV = production
PORT = 3000
```

## Option 2: Railway CLI (Faster)

### Setup Railway CLI:

```powershell
npm install -g @railway/cli
railway login
railway link  # Select your project when prompted
```

### Upload API Variables:

```powershell
# Navigate to your project
cd C:\Users\globa\biolink-inventory

# Upload to API service (replace 'your-api-service-name' with actual name)
railway variables set "DATABASE_URL=${{ Postgres.DATABASE_URL }}" --service your-api-service-name
railway variables set "JWT_SECRET=dkehfneislflek348skenfkelsensm32" --service your-api-service-name
railway variables set "SESSION_SECRET=skenfmsje5n385irkej32hrn3w9to4lk" --service your-api-service-name
railway variables set "NODE_ENV=production" --service your-api-service-name
railway variables set "STORAGE_TYPE=filesystem" --service your-api-service-name
```

### Upload Web Variables:

```powershell
# Upload to Web service (replace 'your-web-service-name' with actual name)
railway variables set "NEXT_PUBLIC_API_URL=https://biolink-inventory-production.up.railway.app" --service your-web-service-name
railway variables set "NODE_ENV=production" --service your-web-service-name
```

## Option 3: Use the PowerShell Script

```powershell
# For API service
.\scripts\upload-env-to-railway.ps1 -EnvFile .env.railway.api -ServiceName "your-api-service-name"

# For Web service  
.\scripts\upload-env-to-railway.ps1 -EnvFile .env.railway.web -ServiceName "your-web-service-name"
```

## After Uploading

1. ✅ Railway will automatically redeploy your services
2. ✅ Check the logs to verify everything starts correctly
3. ✅ Test your API: `https://biolink-inventory-production.up.railway.app/health`
4. ✅ Test your Web app: Visit your web service URL

## Finding Your Service Names

1. Go to Railway Dashboard
2. Your services are listed in the left sidebar
3. Service names are usually like:
   - `biolink-api` or `api-production` or `biolink-inventory-api`
   - `biolink-web` or `web-production` or `biolink-inventory-web`

## Troubleshooting

- **Variables not showing?** → Refresh the page, check you're in the right service
- **Deployment failing?** → Check logs, verify DATABASE_URL is correct
- **Can't connect?** → Verify NEXT_PUBLIC_API_URL has `https://` prefix
