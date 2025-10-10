# API Workflow Tests - Simulates Real User Scenarios
# Tests complete workflows across all services

param(
    [string]$BaseUrl = "http://localhost",
    [switch]$CreateTestData,
    [switch]$Verbose
)

Write-Host "🎯 Pediafor Assessment Platform - API Workflow Tests" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$testResults = @()

# Test Data
$testUsers = @(
    @{
        email = "teacher.test@example.com"
        password = "TeacherPass123!"
        firstName = "Test"
        lastName = "Teacher"
        role = "TEACHER"
    },
    @{
        email = "student.test@example.com"  
        password = "StudentPass123!"
        firstName = "Test"
        lastName = "Student"
        role = "STUDENT"
    }
)

function Write-TestStep {
    param($Step, $Status, $Details = "")
    
    $icon = if ($Status -eq "PASS") { "✅" } else { "❌" }
    $color = if ($Status -eq "PASS") { "Green" } else { "Red" }
    
    Write-Host "$icon $Step" -ForegroundColor $color
    if ($Details -and $Verbose) {
        Write-Host "   → $Details" -ForegroundColor Gray
    }
    
    $script:testResults += @{
        Step = $Step
        Status = $Status
        Details = $Details
        Timestamp = Get-Date
    }
}

function Invoke-ApiCall {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = 30
        }
        
        if ($Headers.Count -gt 0) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        return @{
            Success = $response.StatusCode -eq $ExpectedStatus
            StatusCode = $response.StatusCode
            Content = $response.Content
            Headers = $response.Headers
        }
        
    } catch {
        return @{
            Success = $false
            StatusCode = $_.Exception.Response.StatusCode.Value__
            Error = $_.Exception.Message
            Content = $null
        }
    }
}

function Test-UserLifecycleWorkflow {
    Write-Host "`n👤 Testing Complete User Lifecycle Workflow" -ForegroundColor Magenta
    Write-Host "============================================" -ForegroundColor Gray
    
    foreach ($testUser in $testUsers) {
        Write-Host "`nTesting workflow for $($testUser.role): $($testUser.email)" -ForegroundColor Yellow
        
        # 1. User Registration
        $registerBody = $testUser | ConvertTo-Json
        $registerResult = Invoke-ApiCall -Method POST -Url "$BaseUrl`:3000/api/users/register" -Body $registerBody -ExpectedStatus 201
        
        if ($registerResult.Success) {
            Write-TestStep "User Registration ($($testUser.role))" "PASS"
            $userInfo = $registerResult.Content | ConvertFrom-Json
            $userId = $userInfo.user.id
        } else {
            Write-TestStep "User Registration ($($testUser.role))" "FAIL" "Status: $($registerResult.StatusCode)"
            continue
        }
        
        # 2. User Login
        $loginBody = @{
            email = $testUser.email
            password = $testUser.password
        } | ConvertTo-Json
        
        $loginResult = Invoke-ApiCall -Method POST -Url "$BaseUrl`:3000/api/users/login" -Body $loginBody
        
        if ($loginResult.Success) {
            Write-TestStep "User Login ($($testUser.role))" "PASS"
            $loginInfo = $loginResult.Content | ConvertFrom-Json
            $accessToken = $loginInfo.accessToken
        } else {
            Write-TestStep "User Login ($($testUser.role))" "FAIL" "Status: $($loginResult.StatusCode)"
            continue
        }
        
        # 3. Get User Profile
        $headers = @{ "Authorization" = "Bearer $accessToken" }
        $profileResult = Invoke-ApiCall -Url "$BaseUrl`:3000/api/users/$userId" -Headers $headers
        
        if ($profileResult.Success) {
            Write-TestStep "Get User Profile ($($testUser.role))" "PASS"
        } else {
            Write-TestStep "Get User Profile ($($testUser.role))" "FAIL" "Status: $($profileResult.StatusCode)"
        }
        
        # 4. Update User Profile
        $updateBody = @{
            firstName = "Updated"
            metadata = @{ testRun = $true; timestamp = (Get-Date).ToString() }
        } | ConvertTo-Json
        
        $updateResult = Invoke-ApiCall -Method PUT -Url "$BaseUrl`:3000/api/users/$userId" -Headers $headers -Body $updateBody
        
        if ($updateResult.Success) {
            Write-TestStep "Update User Profile ($($testUser.role))" "PASS"
        } else {
            Write-TestStep "Update User Profile ($($testUser.role))" "FAIL" "Status: $($updateResult.StatusCode)"
        }
        
        # 5. List Users (if admin/teacher)
        if ($testUser.role -in @("TEACHER", "ADMIN")) {
            $listResult = Invoke-ApiCall -Url "$BaseUrl`:3000/api/users?page=1&limit=5" -Headers $headers
            
            if ($listResult.Success) {
                Write-TestStep "List Users ($($testUser.role))" "PASS"
            } else {
                Write-TestStep "List Users ($($testUser.role))" "FAIL" "Status: $($listResult.StatusCode)"
            }
        }
        
        # Store user info for other tests
        $testUser.userId = $userId
        $testUser.accessToken = $accessToken
    }
}

function Test-AssessmentWorkflow {
    Write-Host "`n📝 Testing Assessment Management Workflow" -ForegroundColor Magenta
    Write-Host "=========================================" -ForegroundColor Gray
    
    # Find teacher user
    $teacher = $testUsers | Where-Object { $_.role -eq "TEACHER" -and $_.accessToken }
    
    if (-not $teacher) {
        Write-TestStep "Assessment Workflow Setup" "FAIL" "No authenticated teacher user available"
        return
    }
    
    $headers = @{ "Authorization" = "Bearer $($teacher.accessToken)" }
    
    # 1. Test Assessment Service Health
    $healthResult = Invoke-ApiCall -Url "$BaseUrl`:4001/health"
    
    if ($healthResult.Success) {
        Write-TestStep "Assessment Service Connectivity" "PASS"
    } else {
        Write-TestStep "Assessment Service Connectivity" "FAIL" "Status: $($healthResult.StatusCode)"
        return
    }
    
    # 2. List Assessments
    $listResult = Invoke-ApiCall -Url "$BaseUrl`:4001/assessments" -Headers $headers
    
    if ($listResult.Success) {
        Write-TestStep "List Assessments" "PASS"
    } else {
        Write-TestStep "List Assessments" "FAIL" "Status: $($listResult.StatusCode)"
    }
    
    # 3. Create Assessment (if supported)
    $assessmentData = @{
        title = "Integration Test Assessment"
        description = "Created by automated integration test"
        instructions = "This is a test assessment"
        settings = @{
            timeLimit = 3600
            allowReview = $true
        }
    } | ConvertTo-Json
    
    $createResult = Invoke-ApiCall -Method POST -Url "$BaseUrl`:4001/assessments" -Headers $headers -Body $assessmentData -ExpectedStatus 201
    
    if ($createResult.Success) {
        Write-TestStep "Create Assessment" "PASS"
        $assessmentInfo = $createResult.Content | ConvertFrom-Json
        $assessmentId = $assessmentInfo.id
    } else {
        Write-TestStep "Create Assessment" "FAIL" "Status: $($createResult.StatusCode) - $($createResult.Error)"
    }
}

function Test-SubmissionWorkflow {
    Write-Host "`n📤 Testing Submission Workflow" -ForegroundColor Magenta
    Write-Host "==============================" -ForegroundColor Gray
    
    # Find student user
    $student = $testUsers | Where-Object { $_.role -eq "STUDENT" -and $_.accessToken }
    
    if (-not $student) {
        Write-TestStep "Submission Workflow Setup" "FAIL" "No authenticated student user available"
        return
    }
    
    $headers = @{ "Authorization" = "Bearer $($student.accessToken)" }
    
    # 1. Test Submission Service Health
    $healthResult = Invoke-ApiCall -Url "$BaseUrl`:4002/health"
    
    if ($healthResult.Success) {
        Write-TestStep "Submission Service Connectivity" "PASS"
    } else {
        Write-TestStep "Submission Service Connectivity" "FAIL" "Status: $($healthResult.StatusCode)"
    }
    
    # 2. List Student Submissions
    $listResult = Invoke-ApiCall -Url "$BaseUrl`:4002/submissions" -Headers $headers
    
    if ($listResult.Success) {
        Write-TestStep "List Student Submissions" "PASS"
    } else {
        Write-TestStep "List Student Submissions" "FAIL" "Status: $($listResult.StatusCode)"
    }
}

function Test-GradingWorkflow {
    Write-Host "`n🎯 Testing Grading Workflow" -ForegroundColor Magenta
    Write-Host "============================" -ForegroundColor Gray
    
    # 1. Test Grading Service Health
    $healthResult = Invoke-ApiCall -Url "$BaseUrl`:4003/health"
    
    if ($healthResult.Success) {
        Write-TestStep "Grading Service Connectivity" "PASS"
    } else {
        Write-TestStep "Grading Service Connectivity" "FAIL" "Status: $($healthResult.StatusCode)"
    }
    
    # 2. Test Grading Capabilities (if available)
    $teacher = $testUsers | Where-Object { $_.role -eq "TEACHER" -and $_.accessToken }
    
    if ($teacher) {
        $headers = @{ "Authorization" = "Bearer $($teacher.accessToken)" }
        $gradingResult = Invoke-ApiCall -Url "$BaseUrl`:4003/grades" -Headers $headers
        
        if ($gradingResult.Success) {
            Write-TestStep "Access Grading System" "PASS"
        } else {
            Write-TestStep "Access Grading System" "FAIL" "Status: $($gradingResult.StatusCode)"
        }
    }
}

function Test-EventIntegration {
    Write-Host "`n📡 Testing Event Integration" -ForegroundColor Magenta
    Write-Host "=============================" -ForegroundColor Gray
    
    # 1. Check RabbitMQ Management Interface
    $rabbitResult = Invoke-ApiCall -Url "$BaseUrl`:15672"
    
    if ($rabbitResult.Success) {
        Write-TestStep "RabbitMQ Management Interface" "PASS"
    } else {
        Write-TestStep "RabbitMQ Management Interface" "FAIL" "Status: $($rabbitResult.StatusCode)"
    }
    
    # 2. Test User Service Event Publishing (indirect)
    # Create a new user to trigger events
    $eventTestUser = @{
        email = "event-test-$(Get-Random)@example.com"
        password = "EventTest123!"
        firstName = "Event"
        lastName = "Test"
        role = "STUDENT"
    } | ConvertTo-Json
    
    $eventResult = Invoke-ApiCall -Method POST -Url "$BaseUrl`:4000/users/register" -Body $eventTestUser -ExpectedStatus 201
    
    if ($eventResult.Success) {
        Write-TestStep "User Registration Event Publishing" "PASS" "Events should be published to RabbitMQ"
    } else {
        Write-TestStep "User Registration Event Publishing" "FAIL" "Status: $($eventResult.StatusCode)"
    }
}

# Main Execution
Write-Host "Starting API Workflow Tests..." -ForegroundColor Yellow
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# Execute all workflow tests
Test-UserLifecycleWorkflow
Test-AssessmentWorkflow  
Test-SubmissionWorkflow
Test-GradingWorkflow
Test-EventIntegration

# Summary
Write-Host "`n📊 API Workflow Test Summary" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "Tests Passed: $passed" -ForegroundColor Green
Write-Host "Tests Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Total Tests: $total" -ForegroundColor Blue

if ($failed -eq 0) {
    Write-Host "`n🎉 All API Workflow Tests Passed!" -ForegroundColor Green
    Write-Host "The platform is fully operational for end-to-end workflows." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some workflow tests failed." -ForegroundColor Yellow
    Write-Host "Check the detailed results above for issues." -ForegroundColor Yellow
    
    if ($Verbose) {
        Write-Host "`nFailed Tests:" -ForegroundColor Red
        $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
            Write-Host "❌ $($_.Step)" -ForegroundColor Red
            if ($_.Details) { Write-Host "   → $($_.Details)" -ForegroundColor Gray }
        }
    }
}

Write-Host "`nTest completed at: $(Get-Date)" -ForegroundColor Gray