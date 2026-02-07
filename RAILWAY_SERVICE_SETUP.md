# Railway Service Configuration

## Important: Set Root Directory for Each Service

Railway needs to know which directory each service should build from. **You must configure this in the Railway dashboard** for each service.

### For API Service:

1. Go to your Railway project dashboard
2. Select the **API service** (or create it if it doesn't exist)
3. Go to **Settings** → **Service**
4. Set **Root Directory** to: `apps/api`
5. Railway will now build and run from `apps/api` directory

### For Web Service:

1. Go to your Railway project dashboard
2. Select the **Web service** (or create it if it doesn't exist)
3. Go to **Settings** → **Service**
4. Set **Root Directory** to: `apps/web`
5. Railway will now build and run from `apps/web` directory

## Why This Matters

Without setting the Root Directory, Railway will:
- Build from the repository root
- Try to run `npm run build` from root, which may fail
- Not use the service-specific `railway.json` files

With Root Directory set correctly:
- Each service builds from its own directory
- Uses the correct `package.json` and `railway.json`
- Builds and deploys independently

## Current Service Configuration

### API Service (`apps/api`)
- **Root Directory**: `apps/api` (set in Railway dashboard)
- **Build**: No build step needed (just installs dependencies)
- **Start**: Runs migrations then starts server
- **Config**: `apps/api/railway.json`

### Web Service (`apps/web`)
- **Root Directory**: `apps/web` (set in Railway dashboard)
- **Build**: `npm install && npm run build` (builds Next.js app)
- **Start**: `npm start` (runs Next.js production server)
- **Config**: `apps/web/railway.json`

## Troubleshooting

If builds are failing:
1. ✅ Check Root Directory is set correctly in Railway dashboard
2. ✅ Verify `apps/api/railway.json` and `apps/web/railway.json` exist
3. ✅ Check that `DATABASE_URL` is set in API service variables
4. ✅ Verify Node.js version (should be 18+)
