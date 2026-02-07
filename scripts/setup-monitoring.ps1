# Automated Monitoring Setup Script
# This will guide you through setting up all monitoring

Write-Host "🚀 Railway & GitHub Monitoring Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Railway CLI
Write-Host "📦 Checking Railway CLI..." -ForegroundColor Yellow
if (Get-Command railway -ErrorAction SilentlyContinue) {
    $version = railway --version 2>&1
    Write-Host "✅ Railway CLI installed: $version" -ForegroundColor Green
} else {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Step 1: Login to Railway" -ForegroundColor Cyan
Write-Host "Run this command and follow the browser prompt:" -ForegroundColor Yellow
Write-Host "  railway login" -ForegroundColor White
Write-Host ""
$login = Read-Host "Press Enter after you've logged in, or type 'skip' to continue"

if ($login -ne 'skip') {
    Write-Host "Checking Railway login..." -ForegroundColor Yellow
    $whoami = railway whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logged in to Railway: $whoami" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not logged in. Run 'railway login' manually" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔗 Step 2: Link to Railway Project" -ForegroundColor Cyan
Write-Host "Run this command and select your project:" -ForegroundColor Yellow
Write-Host "  railway link" -ForegroundColor White
Write-Host ""
$link = Read-Host "Press Enter after you've linked, or type 'skip' to continue"

Write-Host ""
Write-Host "📋 Step 3: Get Your Service Names" -ForegroundColor Cyan
Write-Host "Getting Railway services..." -ForegroundColor Yellow
railway services list 2>&1 | Out-String | Write-Host

Write-Host ""
Write-Host "🔑 Step 4: Get Railway Token" -ForegroundColor Cyan
Write-Host "1. Go to: https://railway.app/account/tokens" -ForegroundColor Yellow
Write-Host "2. Click 'New Token'" -ForegroundColor Yellow
Write-Host "3. Copy the token" -ForegroundColor Yellow
Write-Host ""
$railwayToken = Read-Host "Paste your Railway token here (or press Enter to skip)"

if ($railwayToken) {
    Write-Host "✅ Railway token saved (will be added to GitHub secrets)" -ForegroundColor Green
    $env:RAILWAY_TOKEN = $railwayToken
}

Write-Host ""
Write-Host "🐙 Step 5: Get GitHub Token" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "2. Click 'Generate new token' → 'Generate new token (classic)'" -ForegroundColor Yellow
Write-Host "3. Name it: 'Railway Monitoring'" -ForegroundColor Yellow
Write-Host "4. Select scopes: 'repo' (full control)" -ForegroundColor Yellow
Write-Host "5. Click 'Generate token'" -ForegroundColor Yellow
Write-Host "6. Copy the token (you won't see it again!)" -ForegroundColor Yellow
Write-Host ""
$githubToken = Read-Host "Paste your GitHub token here (or press Enter to skip)"

if ($githubToken) {
    Write-Host "✅ GitHub token received" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Step 6: Get Service Information" -ForegroundColor Cyan
$apiServiceName = Read-Host "Enter your API service name (e.g., 'biolink-api')"
$apiUrl = Read-Host "Enter your API URL (e.g., 'https://biolink-inventory-production.up.railway.app')"

Write-Host ""
Write-Host "🔧 Step 7: Setting Up GitHub Secrets" -ForegroundColor Cyan
Write-Host "I'll create a script to add secrets to GitHub..." -ForegroundColor Yellow

# Create GitHub secrets setup script
$secretsScript = @"
# Add these secrets to GitHub:
# Go to: https://github.com/$env:USERNAME/biolink-inventory/settings/secrets/actions

# Or use GitHub CLI:
gh secret set RAILWAY_TOKEN --body "$railwayToken"
gh secret set RAILWAY_API_SERVICE_NAME --body "$apiServiceName"
gh secret set RAILWAY_API_URL --body "$apiUrl"
"@

$secretsScript | Out-File -FilePath "setup-github-secrets.txt" -Encoding UTF8
Write-Host "✅ Created setup-github-secrets.txt with commands" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add GitHub secrets (see setup-github-secrets.txt)" -ForegroundColor White
Write-Host "2. Run monitoring: .\scripts\monitor-railway.ps1 -ServiceName '$apiServiceName' -WatchDeployments" -ForegroundColor White
Write-Host ""
