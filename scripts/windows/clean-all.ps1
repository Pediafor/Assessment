$ErrorActionPreference = 'Stop'

# Stop everything first
if (Test-Path "scripts/windows/stop-all-services.ps1") { & scripts/windows/stop-all-services.ps1 }

function Clean-Compose($path, $file = 'docker-compose.yml') {
  if (Test-Path $path) {
    Push-Location $path
    try {
      docker compose -f $file down -v --remove-orphans
    } finally { Pop-Location }
  }
}

Write-Host "Removing frontend containers/volumes..." -ForegroundColor Cyan
Clean-Compose "frontend"

Write-Host "Removing notification-service..." -ForegroundColor Cyan
Clean-Compose "services/notification-service"

Write-Host "Removing grading-service..." -ForegroundColor Cyan
Clean-Compose "services/grading-service"

Write-Host "Removing submission-service..." -ForegroundColor Cyan
Clean-Compose "services/submission-service"

Write-Host "Removing assessment-service..." -ForegroundColor Cyan
Clean-Compose "services/assessment-service"

Write-Host "Removing user-service..." -ForegroundColor Cyan
Clean-Compose "services/user-service"

Write-Host "Removing realtime-service..." -ForegroundColor Cyan
if (Test-Path "services/gateway-service/docker-compose.realtime.yml") {
  Push-Location "services/gateway-service"
  try { docker compose -f docker-compose.realtime.yml down -v --remove-orphans } finally { Pop-Location }
}

Write-Host "Removing gateway-service and redis..." -ForegroundColor Cyan
Clean-Compose "services/gateway-service"

Write-Host "Removing infra (RabbitMQ, etc.)..." -ForegroundColor Cyan
if (Test-Path "infra/rabbitmq/docker-compose.yml") { Clean-Compose "infra/rabbitmq" }

Write-Host "Cleanup complete." -ForegroundColor Green
