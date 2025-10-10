# Pediafor Assessment Platform - Complete Integration Test
# This script tests the entire system end-to-end including all services and event flows

param(
    [string]$BaseUrl = "http://localhost",
    [switch]$Verbose,
    [switch]$SkipEventTests
)

Write-Host "🚀 Pediafor Assessment Platform - Integration Test Suite" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "Testing complete system integration..." -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = "Continue"
$testResults = @()
$testsPassed = 0
$testsFailed = 0

# Test configuration
$services = @{
    "Gateway" = @{ Port = 3000; Path = "/health" }
    "User" = @{ Port = 4000; Path = "/health" }
    "Assessment" = @{ Port = 4001; Path = "/health" }
    "Submission" = @{ Port = 4002; Path = "/health" }
    "Grading" = @{ Port = 4003; Path = "/health" }
    "RabbitMQ" = @{ Port = 15672; Path = "/" }
}

$databases = @{
    "User-DB" = 5432
    "Assessment-DB" = 5433
    "Submission-DB" = 5434
    "Grading-DB" = 5435
    "Redis" = 6379
}

function Write-TestResult {
    param($TestName, $Status, $Details = "")
    
    if ($Status -eq "PASS") {
        Write-Host "✅ $TestName" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "   $Details" -ForegroundColor Gray }
        $script:testsFailed++
    }
    
    $script:testResults += @{
        Test = $TestName
        Status = $Status
        Details = $Details
        Timestamp = Get-Date
    }
}

function Test-ServiceHealth {
    param($ServiceName, $Port, $Path)
    
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl`:$Port$Path" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-TestResult "$ServiceName Service Health" "PASS"
            return $true
        } else {
            Write-TestResult "$ServiceName Service Health" "FAIL" "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-TestResult "$ServiceName Service Health" "FAIL" "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-DatabaseConnection {
    param($DatabaseName, $Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-TestResult "$DatabaseName Connection" "PASS"
            return $true
        } else {
            Write-TestResult "$DatabaseName Connection" "FAIL" "Port $Port not accessible"
            return $false
        }
    } catch {
        Write-TestResult "$DatabaseName Connection" "FAIL" "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-UserWorkflow {
    Write-Host "`n🔐 Testing Complete User Authentication Workflow..." -ForegroundColor Cyan
    
    # Test data
    $testUser = @{
        email = "integration-test-$(Get-Random)@example.com"
        password = "TestPassword123!"
        firstName = "Integration"
        lastName = "Test"
        role = "STUDENT"
    }
    
    try {
        # 1. User Registration through Gateway
        $registerBody = $testUser | ConvertTo-Json
        $registerResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/register" -Method POST -ContentType "application/json" -Body $registerBody -UseBasicParsing
        
        if ($registerResponse.StatusCode -eq 201) {
            Write-TestResult "User Registration via Gateway" "PASS"
            $userInfo = $registerResponse.Content | ConvertFrom-Json
            $userId = $userInfo.user.id
        } else {
            Write-TestResult "User Registration via Gateway" "FAIL" "Status: $($registerResponse.StatusCode)"
            return $false
        }
        
        # 2. User Login through Gateway
        $loginBody = @{
            email = $testUser.email
            password = $testUser.password
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -SessionVariable session
        
        if ($loginResponse.StatusCode -eq 200) {
            Write-TestResult "User Login via Gateway" "PASS"
            $loginInfo = $loginResponse.Content | ConvertFrom-Json
            $accessToken = $loginInfo.accessToken
        } else {
            Write-TestResult "User Login via Gateway" "FAIL" "Status: $($loginResponse.StatusCode)"
            return $false
        }
        
        # 3. Access Protected Resource
        $headers = @{ "Authorization" = "Bearer $accessToken" }
        $profileResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/$userId" -Headers $headers -UseBasicParsing
        
        if ($profileResponse.StatusCode -eq 200) {
            Write-TestResult "Access Protected Resource" "PASS"
        } else {
            Write-TestResult "Access Protected Resource" "FAIL" "Status: $($profileResponse.StatusCode)"
        }
        
        # 4. Update User Profile
        $updateBody = @{
            firstName = "Updated"
            lastName = "User"
            metadata = @{ testRun = $true }
        } | ConvertTo-Json
        
        $updateResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/$userId" -Method PUT -Headers $headers -ContentType "application/json" -Body $updateBody -UseBasicParsing
        
        if ($updateResponse.StatusCode -eq 200) {
            Write-TestResult "User Profile Update" "PASS"
        } else {
            Write-TestResult "User Profile Update" "FAIL" "Status: $($updateResponse.StatusCode)"
        }
        
        # 5. Logout
        $logoutResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/logout" -Method POST -WebSession $session -UseBasicParsing
        
        if ($logoutResponse.StatusCode -eq 200) {
            Write-TestResult "User Logout" "PASS"
        } else {
            Write-TestResult "User Logout" "FAIL" "Status: $($logoutResponse.StatusCode)"
        }
        
        return $true
        
    } catch {
        Write-TestResult "User Workflow" "FAIL" "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-AssessmentWorkflow {
    Write-Host "`n📝 Testing Assessment Management Workflow..." -ForegroundColor Cyan
    
    try {
        # First login to get token
        $loginBody = @{
            email = "admin@example.com"
            password = "AdminPassword123!"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-WebRequest -Uri "$BaseUrl`:4000/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing -ErrorAction SilentlyContinue
        
        if ($loginResponse.StatusCode -eq 200) {
            $loginInfo = $loginResponse.Content | ConvertFrom-Json
            $accessToken = $loginInfo.accessToken
            
            # Test Assessment Service
            $headers = @{ "Authorization" = "Bearer $accessToken" }
            $assessmentResponse = Invoke-WebRequest -Uri "$BaseUrl`:4001/assessments" -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
            
            if ($assessmentResponse.StatusCode -eq 200) {
                Write-TestResult "Assessment Service Access" "PASS"
            } else {
                Write-TestResult "Assessment Service Access" "FAIL" "Status: $($assessmentResponse.StatusCode)"
            }
        } else {
            Write-TestResult "Assessment Workflow Setup" "FAIL" "Could not authenticate"
        }
        
    } catch {
        Write-TestResult "Assessment Workflow" "FAIL" "Error: $($_.Exception.Message)"
    }
}

function Test-EventFlow {
    if ($SkipEventTests) {
        Write-Host "`n⏭️  Skipping Event Flow Tests (as requested)" -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n📡 Testing Cross-Service Event Flow..." -ForegroundColor Cyan
    
    try {
        # Check RabbitMQ Management API
        $rabbitResponse = Invoke-WebRequest -Uri "$BaseUrl`:15672/api/overview" -UseBasicParsing -ErrorAction SilentlyContinue
        
        if ($rabbitResponse.StatusCode -eq 200) {
            Write-TestResult "RabbitMQ Management API" "PASS"
            
            # Check for exchanges
            $exchangesResponse = Invoke-WebRequest -Uri "$BaseUrl`:15672/api/exchanges" -UseBasicParsing -ErrorAction SilentlyContinue
            
            if ($exchangesResponse.StatusCode -eq 200) {
                Write-TestResult "RabbitMQ Exchanges Available" "PASS"
            } else {
                Write-TestResult "RabbitMQ Exchanges Available" "FAIL"
            }
            
        } else {
            Write-TestResult "RabbitMQ Management API" "FAIL" "Requires authentication"
        }
        
    } catch {
        Write-TestResult "Event Flow Test" "FAIL" "Error: $($_.Exception.Message)"
    }
}

function Test-InterServiceCommunication {
    Write-Host "`n🔗 Testing Inter-Service Communication..." -ForegroundColor Cyan
    
    try {
        # Test Gateway to User Service routing
        $gatewayHealthResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/api/users/health" -UseBasicParsing -ErrorAction SilentlyContinue
        
        if ($gatewayHealthResponse.StatusCode -eq 200) {
            Write-TestResult "Gateway → User Service Routing" "PASS"
        } else {
            Write-TestResult "Gateway → User Service Routing" "FAIL" "Status: $($gatewayHealthResponse.StatusCode)"
        }
        
        # Test direct service communication
        $directResponse = Invoke-WebRequest -Uri "$BaseUrl`:4000/health" -UseBasicParsing
        $gatewayResponse = Invoke-WebRequest -Uri "$BaseUrl`:3000/health" -UseBasicParsing
        
        if ($directResponse.StatusCode -eq 200 -and $gatewayResponse.StatusCode -eq 200) {
            Write-TestResult "Direct Service Access" "PASS"
        } else {
            Write-TestResult "Direct Service Access" "FAIL"
        }
        
    } catch {
        Write-TestResult "Inter-Service Communication" "FAIL" "Error: $($_.Exception.Message)"
    }
}

# Main Test Execution
Write-Host "🔍 Phase 1: Infrastructure Health Checks" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray

# Test all services
foreach ($service in $services.GetEnumerator()) {
    Test-ServiceHealth -ServiceName $service.Key -Port $service.Value.Port -Path $service.Value.Path
    Start-Sleep -Milliseconds 100
}

# Test all databases
foreach ($db in $databases.GetEnumerator()) {
    Test-DatabaseConnection -DatabaseName $db.Key -Port $db.Value
    Start-Sleep -Milliseconds 100
}

Write-Host "`n🔍 Phase 2: End-to-End Workflow Tests" -ForegroundColor Magenta
Write-Host "------------------------------------" -ForegroundColor Gray

# Test complete workflows
Test-UserWorkflow
Test-AssessmentWorkflow
Test-InterServiceCommunication
Test-EventFlow

# Summary
Write-Host "`n📊 Integration Test Results" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -eq 0) { "Green" } else { "Red" })
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor Blue

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 All Integration Tests Passed! Platform is fully operational." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some tests failed. Please check the issues above." -ForegroundColor Red
    
    if ($Verbose) {
        Write-Host "`nDetailed Results:" -ForegroundColor Yellow
        $testResults | ForEach-Object {
            $status = if ($_.Status -eq "PASS") { "✅" } else { "❌" }
            Write-Host "$status $($_.Test)" -ForegroundColor $(if ($_.Status -eq "PASS") { "Green" } else { "Red" })
            if ($_.Details) { Write-Host "   $($_.Details)" -ForegroundColor Gray }
        }
    }
    
    exit 1
}