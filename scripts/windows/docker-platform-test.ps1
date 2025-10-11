# Complete Platform Docker Testing Script
# Starts all services and runs comprehensive tests including WebSocket/WebTransport

param(
    [switch]$Clean,
    [switch]$SkipBuild,
    [switch]$Verbose,
    [int]$HealthCheckTimeout = 300,
    [switch]$SkipTests
)

Write-Host "🐳 Pediafor Assessment Platform - Docker Integration Test" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Complete platform testing with WebSocket/WebTransport..." -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = "Stop"

# Configuration
$dockerComposeFile = ".\docker-compose.yml"
$envFile = ".\.env"

function Write-Step {
    param($Message)
    Write-Host "`n🔄 $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-DockerCompose {
    try {
        docker-compose --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-EnvironmentFile {
    if (Test-Path $envFile) {
        Write-Success "Environment file found: $envFile"
        return $true
    } else {
        Write-Error "Environment file not found: $envFile"
        Write-Host "Please create .env file with required environment variables" -ForegroundColor Yellow
        return $false
    }
}

function Wait-ForService {
    param($ServiceName, $Url, $TimeoutSeconds = 60)
    
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    $isHealthy = $false
    
    Write-Host "   Waiting for $ServiceName to be healthy..." -ForegroundColor Gray
    
    while ((Get-Date) -lt $timeout -and -not $isHealthy) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $isHealthy = $true
                Write-Success "$ServiceName is healthy"
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $isHealthy) {
        Write-Error "$ServiceName failed to become healthy within $TimeoutSeconds seconds"
        return $false
    }
    
    return $true
}

# Main execution
try {
    # Prerequisites check
    Write-Step "Checking prerequisites"
    
    if (-not (Test-DockerCompose)) {
        Write-Error "Docker Compose not found. Please install Docker Desktop."
        exit 1
    }
    Write-Success "Docker Compose available"
    
    if (-not (Test-EnvironmentFile)) {
        exit 1
    }
    
    # Clean up if requested
    if ($Clean) {
        Write-Step "Cleaning up existing containers and volumes"
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Success "Cleanup completed"
    }
    
    # Build and start services
    if (-not $SkipBuild) {
        Write-Step "Building and starting all services"
        docker-compose up --build -d
    } else {
        Write-Step "Starting all services (skip build)"
        docker-compose up -d
    }
    
    Write-Success "All services started"
    
    # Wait for services to be healthy
    Write-Step "Waiting for services to be healthy"
    
    $services = @{
        "RabbitMQ Management" = "http://localhost:15672"
        "User Service" = "http://localhost:4000/health"
        "Assessment Service" = "http://localhost:4001/health"
        "Submission Service" = "http://localhost:4002/health"
        "Grading Service" = "http://localhost:4003/health"
        "Gateway Service" = "http://localhost:3000/health"
        "Realtime Service" = "http://localhost:8080/health"
    }
    
    $allHealthy = $true
    foreach ($service in $services.GetEnumerator()) {
        if (-not (Wait-ForService -ServiceName $service.Key -Url $service.Value -TimeoutSeconds 60)) {
            $allHealthy = $false
        }
    }
    
    if (-not $allHealthy) {
        Write-Error "Some services failed to start properly"
        Write-Host "`nContainer status:" -ForegroundColor Yellow
        docker-compose ps
        exit 1
    }
    
    Write-Success "All services are healthy"
    
    # Show service status
    Write-Step "Service Status"
    docker-compose ps
    
    # Run tests if not skipped
    if (-not $SkipTests) {
        Write-Step "Running integration tests"
        
        # Run main integration test
        Write-Host "`n📋 Running complete integration test suite..." -ForegroundColor Cyan
        if ($Verbose) {
            .\scripts\windows\integration-test.ps1 -Verbose
        } else {
            .\scripts\windows\integration-test.ps1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Integration tests passed"
        } else {
            Write-Error "Integration tests failed"
            exit 1
        }
        
        # Run WebSocket-specific tests
        Write-Host "`n🔌 Running WebSocket/WebTransport tests..." -ForegroundColor Cyan
        if ($Verbose) {
            .\scripts\windows\websocket-test.ps1 -Verbose
        } else {
            .\scripts\windows\websocket-test.ps1
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "WebSocket tests passed"
        } else {
            Write-Error "WebSocket tests failed"
            exit 1
        }
    }
    
    # Show connection information
    Write-Host "`n🌐 Platform Access Information" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host "Gateway API: http://localhost:3000" -ForegroundColor White
    Write-Host "WebSocket: ws://localhost:8080/realtime" -ForegroundColor White
    Write-Host "RabbitMQ Management: http://localhost:15672 (admin/pediafor2024)" -ForegroundColor White
    Write-Host "Health Endpoints:" -ForegroundColor White
    foreach ($service in $services.GetEnumerator()) {
        if ($service.Value -like "*health*") {
            Write-Host "  $($service.Key): $($service.Value)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n📋 Test Client Available:" -ForegroundColor Cyan
    Write-Host "  Open: services\gateway-service\websocket-test.html" -ForegroundColor White
    
    Write-Host "`n🎉 Platform is fully operational!" -ForegroundColor Green
    Write-Host "All services running, WebSocket active, WebTransport infrastructure ready." -ForegroundColor Green
    
    # Ask if user wants to stop services
    Write-Host "`n❓ Keep services running? (Y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "n" -or $response -eq "N") {
        Write-Step "Stopping all services"
        docker-compose down
        Write-Success "All services stopped"
    } else {
        Write-Host "`n🔄 Services will continue running. Use 'docker-compose down' to stop them." -ForegroundColor Blue
    }
    
} catch {
    Write-Error "Fatal error: $($_.Exception.Message)"
    Write-Host "`nContainer logs for debugging:" -ForegroundColor Yellow
    docker-compose logs --tail=50
    exit 1
}