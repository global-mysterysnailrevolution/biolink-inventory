# Quick Token Setup Guide

## 🚂 Railway Token

1. **Go to:** https://railway.app/account/tokens
2. **Click:** "New Token"
3. **Name it:** "Monitoring" (or any name)
4. **Copy the token** (you'll need this)

## 🐙 GitHub Token

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Name:** "Railway Monitoring"
4. **Expiration:** 90 days (or No expiration)
5. **Select scopes:**
   - ✅ `repo` (Full control of private repositories)
6. **Click:** "Generate token"
7. **Copy the token** (you won't see it again!)

## 📋 Add to GitHub Secrets

1. **Go to:** https://github.com/global-mysterysnailrevolution/biolink-inventory/settings/secrets/actions
2. **Click:** "New repository secret"
3. **Add these secrets:**

   | Name | Value |
   |------|-------|
   | `RAILWAY_TOKEN` | Your Railway token from above |
   | `RAILWAY_API_SERVICE_NAME` | Your API service name (e.g., "biolink-api") |
   | `RAILWAY_API_URL` | Your API URL (e.g., "https://biolink-inventory-production.up.railway.app") |

## 🔧 Or Use GitHub CLI

If you have GitHub CLI installed:

```powershell
gh secret set RAILWAY_TOKEN --body "your-railway-token"
gh secret set RAILWAY_API_SERVICE_NAME --body "your-service-name"
gh secret set RAILWAY_API_URL --body "https://your-api-url.railway.app"
```

## ✅ Verify

After adding secrets, the GitHub Actions workflow will automatically:
- Run on every push
- Check every 5 minutes
- Create issues on failures
