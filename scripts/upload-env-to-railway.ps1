# Upload Environment Variables to Railway
# Usage: .\scripts\upload-env-to-railway.ps1 -EnvFile .env.railway -ServiceName "your-service-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$EnvFile,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,
    
    [switch]$DryRun
)

Write-Host "🚀 Railway Environment Variable Uploader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Then run: railway login" -ForegroundColor Yellow
    exit 1
}

# Check if env file exists
if (-not (Test-Path $EnvFile)) {
    Write-Host "❌ Environment file not found: $EnvFile" -ForegroundColor Red
    Write-Host "Create it from .env.railway.template" -ForegroundColor Yellow
    exit 1
}

Write-Host "📄 Reading environment file: $EnvFile" -ForegroundColor Green
Write-Host "🎯 Target service: $ServiceName" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Read env file
$envVars = @{}
$lines = Get-Content $EnvFile

foreach ($line in $lines) {
    # Skip comments and empty lines
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    # Parse KEY=VALUE
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^["\'](.*)["\']$') {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    }
}

Write-Host "📋 Found $($envVars.Count) environment variables:" -ForegroundColor Cyan
Write-Host ""

foreach ($key in $envVars.Keys | Sort-Object) {
    $value = $envVars[$key]
    # Mask sensitive values
    if ($key -match 'SECRET|PASSWORD|KEY|TOKEN') {
        $displayValue = "***HIDDEN***"
    } else {
        $displayValue = $value
    }
    Write-Host "  $key = $displayValue" -ForegroundColor Gray
}

Write-Host ""

if ($DryRun) {
    Write-Host "✅ Dry run complete. Remove -DryRun to actually upload." -ForegroundColor Yellow
    exit 0
}

# Confirm before proceeding
$confirm = Read-Host "Upload these variables to Railway service '$ServiceName'? (y/N)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📤 Uploading to Railway..." -ForegroundColor Cyan

# Upload each variable
$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    try {
        # Use Railway CLI to set variable
        $result = railway variables set "$key=$value" --service $ServiceName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $key" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ $key - Error: $result" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "  ❌ $key - Error: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All variables uploaded successfully!" -ForegroundColor Green
    Write-Host "Railway will automatically redeploy your service." -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some variables failed to upload. Check the errors above." -ForegroundColor Yellow
}
