# Railway Monitoring Setup Guide

Automated monitoring for Railway deployments, builds, and error logs.

## 🎯 Monitoring Options

### Option 1: Local PowerShell Monitor (Easiest)

**Watch deployments in real-time:**

```powershell
# Install Railway CLI first
npm install -g @railway/cli
railway login

# Monitor deployments
.\scripts\monitor-railway.ps1 -ServiceName "your-api-service-name" -WatchDeployments

# Watch live logs
.\scripts\monitor-railway.ps1 -ServiceName "your-api-service-name" -WatchLogs
```

**Features:**
- ✅ Detects new deployments automatically
- ✅ Shows deployment status changes
- ✅ Streams live logs
- ✅ Polls every 5 seconds (configurable)

### Option 2: GitHub Actions (Automated)

**Automatic health checks every 5 minutes:**

1. **Add GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add:
     - `RAILWAY_TOKEN` - Your Railway API token
     - `RAILWAY_API_SERVICE_NAME` - Your API service name (e.g., "biolink-api")
     - `RAILWAY_API_URL` - Your API URL (e.g., "https://biolink-inventory-production.up.railway.app")

2. **Workflow runs automatically:**
   - On every push to main
   - Every 5 minutes (scheduled)
   - On manual trigger

3. **What it does:**
   - ✅ Checks API health endpoint
   - ✅ Gets latest deployment status
   - ✅ Fetches recent logs on failure
   - ✅ Creates GitHub issue if health check fails

### Option 3: Railway Webhooks (Advanced)

**Real-time webhook notifications:**

1. **Deploy webhook handler:**
   ```bash
   # Create a new Railway service for webhooks
   cd scripts
   railway init
   railway up
   ```

2. **Configure Railway webhook:**
   - Go to Railway Dashboard → Your service → Settings
   - Add webhook URL: `https://your-webhook-service.railway.app/webhook/railway`
   - Set webhook secret in environment variables

3. **Webhook events:**
   - `deployment.created` - New deployment started
   - `deployment.updated` - Deployment status changed
   - `build.started` - Build process started
   - `build.completed` - Build finished

## 📋 Quick Start

### Local Monitoring (Recommended for Development)

```powershell
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to your project
railway link

# 4. Monitor deployments
.\scripts\monitor-railway.ps1 -ServiceName "biolink-api" -WatchDeployments

# 5. In another terminal, watch logs
.\scripts\monitor-railway.ps1 -ServiceName "biolink-api" -WatchLogs
```

### GitHub Actions (Recommended for Production)

1. Add secrets to GitHub (see above)
2. Push to main branch
3. Check Actions tab for monitoring results
4. Issues will be created automatically on failures

## 🔍 What Gets Monitored

### Deployment Status
- ✅ New deployments detected
- ✅ Build status (BUILDING, SUCCESS, FAILED)
- ✅ Deploy status (DEPLOYING, SUCCESS, FAILED)
- ✅ Timestamps and deployment IDs

### Health Checks
- ✅ API `/health` endpoint
- ✅ HTTP status codes
- ✅ Response times

### Error Logs
- ✅ Recent error logs on failure
- ✅ Build error messages
- ✅ Runtime errors

## 🚨 Alerts & Notifications

### GitHub Actions
- Creates GitHub issues on health check failures
- Adds labels: `bug`, `railway`, `deployment`
- Includes troubleshooting steps

### Webhooks
- Real-time notifications
- Can integrate with Slack, Discord, email, etc.
- Customizable alert logic

## 📊 Monitoring Dashboard

You can also use Railway's built-in dashboard:
- Railway Dashboard → Your service → Deployments
- Railway Dashboard → Your service → Logs
- Railway Dashboard → Your service → Metrics

## 🔧 Troubleshooting

### Monitor script not working?
```powershell
# Check Railway CLI is installed
railway --version

# Check you're logged in
railway whoami

# Check service name is correct
railway services list
```

### GitHub Actions failing?
- Verify all secrets are set correctly
- Check `RAILWAY_TOKEN` has proper permissions
- Verify service names match exactly

### Webhooks not receiving events?
- Check webhook URL is accessible
- Verify webhook secret matches
- Check Railway webhook configuration

## 💡 Tips

1. **Use local monitoring during development** - Faster feedback
2. **Use GitHub Actions for production** - Automated, always running
3. **Use webhooks for critical alerts** - Real-time notifications
4. **Combine all three** - Maximum visibility

## 📝 Example Output

### Deployment Monitor:
```
🆕 New deployment detected!
[2026-02-07T05:30:00Z] Deployment abc12345: BUILDING
[2026-02-07T05:31:00Z] Deployment abc12345: DEPLOYING
[2026-02-07T05:32:00Z] Deployment abc12345: SUCCESS
```

### Health Check:
```
✅ API is healthy (HTTP 200)
```

### Error Detection:
```
❌ API health check failed (HTTP 500)
📋 Recent logs from API service:
  Error: connect ECONNREFUSED ::1:5432
  at Client.connect...
```
