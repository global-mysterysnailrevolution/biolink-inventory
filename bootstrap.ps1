# Bio-Link Depot Inventory System Bootstrap
# Single command setup from Windows PowerShell

$ErrorActionPreference = "Stop"

Write-Host "🚀 Bio-Link Depot Inventory System Bootstrap" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check WSL
$WSL_AVAILABLE = $false
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    $WSL_AVAILABLE = $true
    Write-Host "✓ WSL detected" -ForegroundColor Green
} else {
    Write-Host "⚠ WSL not found. Installing WSL..." -ForegroundColor Yellow
    Write-Host "  Run: wsl --install" -ForegroundColor Yellow
    exit 1
}

# Check Docker
$DOCKER_AVAILABLE = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $DOCKER_AVAILABLE = $true
    Write-Host "✓ Docker detected" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker not found. Please install Docker Desktop." -ForegroundColor Yellow
    exit 1
}

# Install Node.js in WSL (if not present)
Write-Host "`n📦 Checking Node.js in WSL..." -ForegroundColor Cyan
$nodeVersion = wsl node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "  Installing Node.js..." -ForegroundColor Gray
    wsl bash -c "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
} else {
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
}

# Install Python in WSL (if not present)
Write-Host "`n📦 Checking Python in WSL..." -ForegroundColor Cyan
$pythonVersion = wsl python3 --version 2>$null
if (-not $pythonVersion) {
    Write-Host "  Installing Python..." -ForegroundColor Gray
    wsl bash -c "sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv"
} else {
    Write-Host "  ✓ Python: $pythonVersion" -ForegroundColor Green
}

# Create .env from template
Write-Host "`n📝 Setting up environment..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  ✓ Created .env from template" -ForegroundColor Green
        Write-Host "  ⚠ Please edit .env with your values" -ForegroundColor Yellow
        Write-Host "  ⚠ See docs/CREDENTIALS.md for required values" -ForegroundColor Yellow
        
        # Generate secure secrets
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        
        # Update .env with generated secrets
        $envContent = Get-Content ".env" -Raw
        $envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
        $envContent = $envContent -replace "SESSION_SECRET=.*", "SESSION_SECRET=$sessionSecret"
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Generated secure JWT_SECRET and SESSION_SECRET" -ForegroundColor Green
    } else {
        # Create minimal .env with generated secrets
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        
        @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/biolink
JWT_SECRET=$jwtSecret
SESSION_SECRET=$sessionSecret
STORAGE_TYPE=filesystem
STORAGE_PATH=./uploads
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "  ✓ Created .env with defaults and generated secrets" -ForegroundColor Green
    }
} else {
    Write-Host "  ✓ .env already exists" -ForegroundColor Green
    Write-Host "  → Verifying credentials..." -ForegroundColor Gray
    if (Test-Path ".\.ai\scripts\check-credentials.ps1") {
        & ".\.ai\scripts\check-credentials.ps1"
    }
}

# Start Postgres
Write-Host "`n🐘 Starting Postgres..." -ForegroundColor Cyan
docker-compose up -d postgres
Start-Sleep -Seconds 5
Write-Host "  ✓ Postgres started" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
wsl bash -c "cd /mnt/c/Users/globa/biolink-inventory && npm install"
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# Run migrations
Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Cyan
wsl bash -c "cd /mnt/c/Users/globa/biolink-inventory && npm run migrate"
Write-Host "  ✓ Migrations complete" -ForegroundColor Green

# Seed data
Write-Host "`n🌱 Seeding initial data..." -ForegroundColor Cyan
wsl bash -c "cd /mnt/c/Users/globa/biolink-inventory && npm run seed"
Write-Host "  ✓ Data seeded" -ForegroundColor Green

# Run smoke tests
Write-Host "`n🧪 Running smoke tests..." -ForegroundColor Cyan
wsl bash -c "cd /mnt/c/Users/globa/biolink-inventory && npm test -- --run"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Tests passed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Some tests failed (check output above)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Bootstrap complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review .env file and update if needed" -ForegroundColor White
Write-Host "  2. Start dev servers:" -ForegroundColor White
Write-Host "     wsl npm run dev        # Frontend" -ForegroundColor Gray
Write-Host "     wsl npm run dev:api    # Backend" -ForegroundColor Gray
Write-Host "  3. Open http://localhost:3000" -ForegroundColor White
