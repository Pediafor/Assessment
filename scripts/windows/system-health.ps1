# System Health Monitor for Pediafor Assessment Platform
# Monitors all services, databases, and infrastructure components

param(
    [string]$BaseUrl = "http://localhost",
    [switch]$Continuous,
    [int]$IntervalSeconds = 30,
    [switch]$ShowDetails
)

$services = @{
    "Gateway Service" = @{ 
        Port = 3000; 
        HealthPath = "/health"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
    "User Service" = @{ 
        Port = 4000; 
        HealthPath = "/health"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
    "Assessment Service" = @{ 
        Port = 4001; 
        HealthPath = "/health"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
    "Submission Service" = @{ 
        Port = 4002; 
        HealthPath = "/health"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
    "Grading Service" = @{ 
        Port = 4003; 
        HealthPath = "/health"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
    "RabbitMQ Management" = @{ 
        Port = 15672; 
        HealthPath = "/"; 
        ExpectedStatus = 200;
        Critical = $true 
    }
}

$infrastructure = @{
    "User Database" = @{ Port = 5432; Type = "PostgreSQL" }
    "Assessment Database" = @{ Port = 5433; Type = "PostgreSQL" }
    "Submission Database" = @{ Port = 5434; Type = "PostgreSQL" }
    "Grading Database" = @{ Port = 5435; Type = "PostgreSQL" }
    "Redis Cache" = @{ Port = 6379; Type = "Redis" }
    "RabbitMQ AMQP" = @{ Port = 5672; Type = "RabbitMQ" }
}

function Get-ServiceHealth {
    param($ServiceName, $Config)
    
    try {
        $url = "$BaseUrl`:$($Config.Port)$($Config.HealthPath)"
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        $status = if ($response.StatusCode -eq $Config.ExpectedStatus) { "HEALTHY" } else { "DEGRADED" }
        
        if ($ShowDetails -and $response.Content) {
            try {
                $healthData = $response.Content | ConvertFrom-Json
                $uptime = if ($healthData.uptime) { " (Up: $([math]::Round($healthData.uptime))s)" } else { "" }
                return @{
                    Name = $ServiceName
                    Status = $status
                    Details = "Status: $($response.StatusCode)$uptime"
                    Healthy = $true
                }
            } catch {
                return @{
                    Name = $ServiceName
                    Status = $status
                    Details = "Status: $($response.StatusCode)"
                    Healthy = $true
                }
            }
        }
        
        return @{
            Name = $ServiceName
            Status = $status
            Details = "Status: $($response.StatusCode)"
            Healthy = $true
        }
        
    } catch {
        return @{
            Name = $ServiceName
            Status = "DOWN"
            Details = $_.Exception.Message.Split("`n")[0]
            Healthy = $false
        }
    }
}

function Get-InfrastructureHealth {
    param($ComponentName, $Config)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Config.Port -WarningAction SilentlyContinue -ErrorAction Stop
        
        if ($connection.TcpTestSucceeded) {
            return @{
                Name = $ComponentName
                Status = "HEALTHY"
                Details = "$($Config.Type) on port $($Config.Port)"
                Healthy = $true
            }
        } else {
            return @{
                Name = $ComponentName
                Status = "DOWN"
                Details = "Port $($Config.Port) not accessible"
                Healthy = $false
            }
        }
    } catch {
        return @{
            Name = $ComponentName
            Status = "DOWN"
            Details = "Connection failed: $($_.Exception.Message)"
            Healthy = $false
        }
    }
}

function Show-SystemStatus {
    Clear-Host
    Write-Host "Pediafor Assessment Platform - System Health Monitor" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    $allHealthy = $true
    $healthyServices = 0
    $totalServices = $services.Count
    $healthyInfra = 0
    $totalInfra = $infrastructure.Count
    
    # Check Services
    Write-Host "MICROSERVICES STATUS" -ForegroundColor Magenta
    Write-Host "--------------------" -ForegroundColor Gray
    
    foreach ($service in $services.GetEnumerator()) {
        $health = Get-ServiceHealth -ServiceName $service.Key -Config $service.Value
        
        $statusColor = switch ($health.Status) {
            "HEALTHY" { "Green"; $healthyServices++ }
            "DEGRADED" { "Yellow" }
            "DOWN" { "Red"; if ($service.Value.Critical) { $allHealthy = $false } }
        }
        
        Write-Host "$($health.Name): $($health.Status)" -ForegroundColor $statusColor
        if ($ShowDetails -and $health.Details) {
            Write-Host "  └─ $($health.Details)" -ForegroundColor Gray
        }
    }
    
    # Check Infrastructure
    Write-Host "`nINFRASTRUCTURE STATUS" -ForegroundColor Magenta
    Write-Host "---------------------" -ForegroundColor Gray
    
    foreach ($infra in $infrastructure.GetEnumerator()) {
        $health = Get-InfrastructureHealth -ComponentName $infra.Key -Config $infra.Value
        
        $statusColor = switch ($health.Status) {
            "HEALTHY" { "Green"; $healthyInfra++ }
            "DOWN" { "Red"; $allHealthy = $false }
        }
        
        Write-Host "$($health.Name): $($health.Status)" -ForegroundColor $statusColor
        if ($ShowDetails -and $health.Details) {
            Write-Host "  └─ $($health.Details)" -ForegroundColor Gray
        }
    }
    
    # Overall Status
    Write-Host "`nSYSTEM OVERVIEW" -ForegroundColor Magenta
    Write-Host "---------------" -ForegroundColor Gray
    Write-Host "Services: $healthyServices/$totalServices healthy" -ForegroundColor $(if ($healthyServices -eq $totalServices) { "Green" } else { "Yellow" })
    Write-Host "Infrastructure: $healthyInfra/$totalInfra healthy" -ForegroundColor $(if ($healthyInfra -eq $totalInfra) { "Green" } else { "Yellow" })
    
    $overallStatus = if ($allHealthy) { "SYSTEM OPERATIONAL" } else { "SYSTEM ISSUES DETECTED" }
    $overallColor = if ($allHealthy) { "Green" } else { "Red" }
    Write-Host "`nOverall Status: $overallStatus" -ForegroundColor $overallColor
    
    if ($Continuous) {
        Write-Host "`nRefreshing in $IntervalSeconds seconds... (Press Ctrl+C to stop)" -ForegroundColor Yellow
    }
}

function Test-QuickIntegration {
    Write-Host "`nQUICK INTEGRATION TEST" -ForegroundColor Magenta
    Write-Host "----------------------" -ForegroundColor Gray
    
    try {
        # Test Gateway Health
        $gatewayResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "[PASS] Gateway accessible" -ForegroundColor Green
        
        # Test User Service through Gateway
        $userResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($userResponse -and $userResponse.StatusCode -eq 200) {
            Write-Host "[PASS] Gateway -> User Service routing" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Gateway -> User Service routing issue" -ForegroundColor Yellow
        }
        
        # Test Event Infrastructure
        $rabbitResponse = Invoke-WebRequest -Uri "$BaseUrl`:15672" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($rabbitResponse -and $rabbitResponse.StatusCode -eq 200) {
            Write-Host "[PASS] Event infrastructure accessible" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Event infrastructure issue" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "[FAIL] Integration test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
if ($Continuous) {
    Write-Host "Starting continuous monitoring..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
    
    while ($true) {
        Show-SystemStatus
        if ($ShowDetails) {
            Test-QuickIntegration
        }
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Show-SystemStatus
    if ($ShowDetails) {
        Test-QuickIntegration
    }
}