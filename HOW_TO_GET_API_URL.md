# How to Get Your API URL for NEXT_PUBLIC_API_URL

## Step-by-Step Process

### Step 1: Deploy Your API Service to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Create a new project (or use existing)
3. Click **"New"** → **"GitHub Repo"**
4. Select your `biolink-inventory` repository
5. Railway will detect your monorepo

### Step 2: Create API Service

1. Click **"New Service"** or **"Add Service"**
2. Select **"GitHub Repo"** again (or **"Empty Service"**)
3. In the service settings:
   - **Name**: `biolink-api` (or any name you prefer)
   - **Root Directory**: Set to `apps/api`
   - **Build Command**: Railway will auto-detect (or leave default)
   - **Start Command**: Railway will auto-detect (or leave default)

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creates the database automatically
3. Copy the `DATABASE_URL` from the Postgres service variables

### Step 4: Set API Service Environment Variables

In your **API service**, go to **Variables** tab and add:

```
DATABASE_URL=${{ Postgres.DATABASE_URL }}
JWT_SECRET=your-generated-secret-here
SESSION_SECRET=your-different-secret-here
NODE_ENV=production
```

### Step 5: Deploy and Get the URL

1. Railway will automatically start deploying
2. Wait for deployment to complete (check logs)
3. Go to your **API service** → **Settings** → **Networking**
4. Click **"Generate Domain"** (if not already generated)
5. Your API URL will be something like:
   ```
   https://biolink-api-production.up.railway.app
   ```
   or
   ```
   https://biolink-api-production.railway.app
   ```

### Step 6: Use the URL in Web Service

1. Go to your **Web service** (create it if needed)
2. Set **Root Directory** to `apps/web`
3. In **Variables** tab, add:
   ```
   NEXT_PUBLIC_API_URL=https://your-actual-api-url.railway.app
   ```
   (Replace with the URL from Step 5)

## Alternative: Custom Domain

If you want a custom domain:
1. Go to API service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. Use that custom domain in `NEXT_PUBLIC_API_URL`

## Quick Checklist

- [ ] API service deployed to Railway
- [ ] Root Directory set to `apps/api`
- [ ] Database connected (DATABASE_URL set)
- [ ] API service has a public domain/URL
- [ ] Copy the API URL
- [ ] Set `NEXT_PUBLIC_API_URL` in Web service with that URL

## Testing Your API URL

Once you have the URL, test it:
```bash
# Health check
curl https://your-api-url.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Troubleshooting

- **No domain generated?** → Go to Settings → Networking → Generate Domain
- **API not responding?** → Check logs, verify DATABASE_URL is set
- **Can't find the URL?** → Look in Settings → Networking or Domains section
