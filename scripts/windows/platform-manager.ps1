# Pediafor Assessment Platform - System Management Script
# Easily manage the entire platform with a single command

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "test", "logs", "clean")]
    [string]$Action,
    
    [string]$Service = "all",
    [switch]$Follow,
    [switch]$Verbose,
    [switch]$Quick
)

$ErrorActionPreference = "Continue"

function Write-Header {
    param($Message)
    Write-Host "`n🚀 $Message" -ForegroundColor Cyan
    Write-Host "=" * ($Message.Length + 3) -ForegroundColor Cyan
}

function Write-Step {
    param($Message, $Status = "INFO")
    $icon = switch ($Status) {
        "SUCCESS" { "✅" }
        "ERROR" { "❌" }
        "WARNING" { "⚠️" }
        default { "ℹ️" }
    }
    Write-Host "$icon $Message" -ForegroundColor $(if ($Status -eq "ERROR") { "Red" } elseif ($Status -eq "SUCCESS") { "Green" } elseif ($Status -eq "WARNING") { "Yellow" } else { "Cyan" })
}

function Start-Platform {
    Write-Header "Starting Pediafor Assessment Platform"
    
    if ($Quick) {
        Write-Step "Starting with existing containers..." "INFO"
        docker-compose up -d
    } else {
        Write-Step "Building and starting all services..." "INFO"
        docker-compose up -d --build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Step "Platform started successfully!" "SUCCESS"
        Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Quick health check
        .\scripts\system-health.ps1
        
        Write-Host "`n🌐 Platform URLs:" -ForegroundColor Magenta
        Write-Host "   Gateway:       http://localhost:3000" -ForegroundColor Green
        Write-Host "   User Service:  http://localhost:4000" -ForegroundColor Green
        Write-Host "   Assessment:    http://localhost:4001" -ForegroundColor Green
        Write-Host "   Submission:    http://localhost:4002" -ForegroundColor Green
        Write-Host "   Grading:       http://localhost:4003" -ForegroundColor Green
        Write-Host "   RabbitMQ UI:   http://localhost:15672 (admin/pediafor2024)" -ForegroundColor Green
        
    } else {
        Write-Step "Failed to start platform" "ERROR"
    }
}

function Stop-Platform {
    Write-Header "Stopping Pediafor Assessment Platform"
    
    if ($Service -eq "all") {
        Write-Step "Stopping all services..." "INFO"
        docker-compose down
    } else {
        Write-Step "Stopping $Service..." "INFO"
        docker-compose stop $Service
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Step "Platform stopped successfully!" "SUCCESS"
    } else {
        Write-Step "Failed to stop platform" "ERROR"
    }
}

function Restart-Platform {
    Write-Header "Restarting Pediafor Assessment Platform"
    
    Stop-Platform
    Start-Sleep -Seconds 5
    Start-Platform
}

function Show-Status {
    Write-Header "Platform Status"
    
    # Show container status
    Write-Host "🐳 Container Status:" -ForegroundColor Magenta
    docker-compose ps
    
    # Show system health
    Write-Host "`n🏥 System Health:" -ForegroundColor Magenta
    .\scripts\system-health.ps1 -ShowDetails
}

function Run-Tests {
    Write-Header "Running Platform Tests"
    
    Write-Step "Checking if platform is running..." "INFO"
    $gatewayHealth = try { 
        Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
        $true 
    } catch { 
        $false 
    }
    
    if (-not $gatewayHealth) {
        Write-Step "Platform not running. Starting services first..." "WARNING"
        Start-Platform
        Start-Sleep -Seconds 30
    }
    
    Write-Step "Running integration tests..." "INFO"
    .\scripts\integration-test.ps1 -Verbose:$Verbose
    
    Write-Step "Running API workflow tests..." "INFO"
    .\scripts\api-workflow-test.ps1 -Verbose:$Verbose
}

function Show-Logs {
    Write-Header "Platform Logs"
    
    if ($Service -eq "all") {
        if ($Follow) {
            docker-compose logs -f
        } else {
            docker-compose logs --tail=50
        }
    } else {
        if ($Follow) {
            docker-compose logs -f $Service
        } else {
            docker-compose logs --tail=50 $Service
        }
    }
}

function Clean-Platform {
    Write-Header "Cleaning Platform"
    
    Write-Step "Stopping all services..." "INFO"
    docker-compose down
    
    Write-Step "Removing volumes and networks..." "WARNING"
    docker-compose down -v --remove-orphans
    
    Write-Step "Pruning Docker system..." "INFO"
    docker system prune -f
    
    Write-Step "Platform cleaned successfully!" "SUCCESS"
    Write-Host "Note: All data has been removed. Next start will be fresh." -ForegroundColor Yellow
}

# Main execution
Write-Host "🏗️  Pediafor Assessment Platform Manager" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

switch ($Action) {
    "start" { Start-Platform }
    "stop" { Stop-Platform }
    "restart" { Restart-Platform }
    "status" { Show-Status }
    "test" { Run-Tests }
    "logs" { Show-Logs }
    "clean" { Clean-Platform }
}

Write-Host "`nOperation completed at: $(Get-Date)" -ForegroundColor Gray