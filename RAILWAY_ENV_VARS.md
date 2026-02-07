# Railway Environment Variables Guide

Complete list of all environment variables needed for Railway deployment.

## 🔴 REQUIRED Variables

### For API Service (`apps/api`)

| Variable | Value | How to Get |
|----------|-------|------------|
| `DATABASE_URL` | `${{ Postgres.DATABASE_URL }}` | Use Railway's variable reference from Postgres service (see below) |
| `JWT_SECRET` | Random 32+ character string | Generate using PowerShell: `[System.Web.Security.Membership]::GeneratePassword(32, 0)` |
| `SESSION_SECRET` | Random 32+ character string | Generate using PowerShell: `[System.Web.Security.Membership]::GeneratePassword(32, 0)` |

**How to set DATABASE_URL:**
1. In Railway, go to your **Postgres service**
2. Click **"Connect"** or **"Variables"** tab
3. Copy the `DATABASE_URL` value
4. In your **API service**, go to **Variables**
5. Add variable `DATABASE_URL` with value: `${{ Postgres.DATABASE_URL }}`
   - OR copy the actual connection string directly

### For Web Service (`apps/web`)

| Variable | Value | How to Get |
|----------|-------|------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api-service.railway.app` | Get from Railway dashboard → API service → Settings → Domains |

**Important:** Replace `your-api-service.railway.app` with your actual API service URL from Railway.

---

## 🟡 OPTIONAL (But Recommended)

### For API Service

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Tells Node.js this is production |
| `PORT` | `3001` | Railway auto-assigns, but you can set explicitly |
| `STORAGE_TYPE` | `filesystem` or `s3` | Default: `filesystem` |
| `STORAGE_PATH` | `./uploads` | Only if `STORAGE_TYPE=filesystem` |

### For Web Service

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Tells Next.js this is production |
| `PORT` | `3000` | Railway auto-assigns, but you can set explicitly |

---

## 🟢 OPTIONAL - Advanced Features

### S3 Storage (if using S3 instead of filesystem)

Add these to **API Service** if `STORAGE_TYPE=s3`:

| Variable | Value | Notes |
|----------|-------|-------|
| `S3_BUCKET` | Your S3 bucket name | e.g., `biolink-uploads` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | From AWS IAM |
| `AWS_REGION` | AWS region | e.g., `us-east-1` |

### Integrations (if using)

**Zoho Inventory** (add to API Service):
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`

**External Store API** (add to API Service):
- `EXTERNAL_STORE_API_URL`
- `EXTERNAL_STORE_API_KEY`

---

## 📋 Quick Setup Checklist

### API Service Variables:
- [ ] `DATABASE_URL` = `${{ Postgres.DATABASE_URL }}`
- [ ] `JWT_SECRET` = (generate random 32+ chars)
- [ ] `SESSION_SECRET` = (generate random 32+ chars)
- [ ] `NODE_ENV` = `production` (recommended)
- [ ] `STORAGE_TYPE` = `filesystem` (if using local storage)

### Web Service Variables:
- [ ] `NEXT_PUBLIC_API_URL` = `https://your-api-service.railway.app`
- [ ] `NODE_ENV` = `production` (recommended)

---

## 🔐 Generating Secure Secrets

### PowerShell (Windows):
```powershell
# Generate JWT_SECRET
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Generate SESSION_SECRET
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Or use GUID (less secure but quick)
New-Guid
```

### Bash/Linux/Mac:
```bash
# Generate random 32-character string
openssl rand -base64 32

# Or use /dev/urandom
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

### Online Tools:
- [Random.org String Generator](https://www.random.org/strings/)
- Generate at least 32 characters
- Use alphanumeric + special characters

---

## 🎯 Example Configuration

### API Service Variables:
```env
DATABASE_URL=${{ Postgres.DATABASE_URL }}
JWT_SECRET=K8mN2pQ5rS7tU9vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3tU5vW7xY9z
SESSION_SECRET=A2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC0dE2fG4hI6jK8
NODE_ENV=production
STORAGE_TYPE=filesystem
```

### Web Service Variables:
```env
NEXT_PUBLIC_API_URL=https://biolink-api-production.up.railway.app
NODE_ENV=production
```

---

## ⚠️ Important Notes

1. **Never commit secrets to Git** - Always use Railway's Variables tab
2. **DATABASE_URL** - Use Railway's variable reference `${{ Postgres.DATABASE_URL }}` for automatic updates
3. **NEXT_PUBLIC_API_URL** - Must be the full URL including `https://`
4. **JWT_SECRET & SESSION_SECRET** - Must be different values, both 32+ characters
5. **After adding variables** - Railway will automatically redeploy your services

---

## 🔍 Verifying Variables

After setting variables, check the logs:
- API service should connect to database successfully
- Web service should be able to reach API at `NEXT_PUBLIC_API_URL`
- No "undefined" or "missing" errors in startup logs
