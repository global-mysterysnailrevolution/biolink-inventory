# Monitor Railway Deployments and Logs
# Usage: .\scripts\monitor-railway.ps1 -ServiceName "your-service-name" -PollInterval 5

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName,
    
    [int]$PollInterval = 5,
    
    [switch]$WatchLogs,
    
    [switch]$WatchDeployments
)

Write-Host "🔍 Railway Deployment Monitor" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Service: $ServiceName" -ForegroundColor Yellow
Write-Host "Poll Interval: $PollInterval seconds" -ForegroundColor Yellow
Write-Host ""

# Check if Railway CLI is installed
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found!" -ForegroundColor Red
    Write-Host "Install: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Then run: railway login" -ForegroundColor Yellow
    exit 1
}

# Check if logged in
$loginCheck = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Railway!" -ForegroundColor Red
    Write-Host "Run: railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connected to Railway" -ForegroundColor Green
Write-Host ""

$lastDeploymentId = $null
$lastLogLine = 0

function Get-LatestDeployment {
    $deployments = railway deployments list --service $ServiceName --json 2>&1 | ConvertFrom-Json
    if ($deployments -and $deployments.Count -gt 0) {
        return $deployments[0]
    }
    return $null
}

function Get-DeploymentStatus {
    param([string]$DeploymentId)
    
    $deployment = railway deployments show $DeploymentId --service $ServiceName --json 2>&1 | ConvertFrom-Json
    return $deployment
}

function Show-DeploymentInfo {
    param($Deployment)
    
    $status = $Deployment.status
    $createdAt = $Deployment.createdAt
    $color = switch ($status) {
        "BUILDING" { "Yellow" }
        "DEPLOYING" { "Cyan" }
        "SUCCESS" { "Green" }
        "FAILED" { "Red" }
        default { "Gray" }
    }
    
    Write-Host "[$createdAt] Deployment $($Deployment.id.Substring(0,8)): $status" -ForegroundColor $color
    
    if ($Deployment.status -eq "FAILED") {
        Write-Host "  ❌ Build/Deploy failed!" -ForegroundColor Red
        Write-Host "  Run: railway logs --deployment $($Deployment.id) --service $ServiceName" -ForegroundColor Yellow
    }
}

function Watch-Logs {
    Write-Host "📋 Watching logs (Ctrl+C to stop)..." -ForegroundColor Cyan
    Write-Host ""
    
    railway logs --service $ServiceName --follow
}

function Watch-Deployments {
    Write-Host "🚀 Watching deployments..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    
    while ($true) {
        $deployment = Get-LatestDeployment
        
        if ($deployment) {
            $currentId = $deployment.id
            
            if ($currentId -ne $lastDeploymentId) {
                Write-Host "`n🆕 New deployment detected!" -ForegroundColor Green
                Show-DeploymentInfo -Deployment $deployment
                $script:lastDeploymentId = $currentId
            } else {
                # Check status updates
                $currentStatus = Get-DeploymentStatus -DeploymentId $currentId
                if ($currentStatus.status -ne $deployment.status) {
                    Write-Host "`n🔄 Status changed!" -ForegroundColor Cyan
                    Show-DeploymentInfo -Deployment $currentStatus
                }
            }
        }
        
        Start-Sleep -Seconds $PollInterval
    }
}

# Main monitoring loop
if ($WatchLogs) {
    Watch-Logs
} elseif ($WatchDeployments) {
    Watch-Deployments
} else {
    # Watch both
    Write-Host "Starting deployment monitor..." -ForegroundColor Cyan
    Write-Host "Run with -WatchLogs to see live logs" -ForegroundColor Gray
    Write-Host "Run with -WatchDeployments to watch deployment status" -ForegroundColor Gray
    Write-Host ""
    
    # Show current deployment
    $deployment = Get-LatestDeployment
    if ($deployment) {
        Write-Host "Current deployment:" -ForegroundColor Cyan
        Show-DeploymentInfo -Deployment $deployment
    }
    
    Write-Host "`n💡 Tips:" -ForegroundColor Yellow
    Write-Host "  -WatchLogs        : Stream live logs" -ForegroundColor Gray
    Write-Host "  -WatchDeployments : Monitor deployment status" -ForegroundColor Gray
    Write-Host "  railway logs --service $ServiceName : View recent logs" -ForegroundColor Gray
}
