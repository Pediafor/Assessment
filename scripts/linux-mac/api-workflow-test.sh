#!/bin/bash
# Pediafor Assessment Platform - API Workflow Test Suite (Linux/macOS)
# This script simulates real user scenarios and workflows across the platform

set -e

# Configuration
BASE_URL="http://localhost"
VERBOSE=false
CONCURRENT_USERS=1
TEST_DURATION=300  # 5 minutes default

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test statistics
WORKFLOW_PASSED=0
WORKFLOW_FAILED=0
TOTAL_REQUESTS=0
FAILED_REQUESTS=0

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --base-url URL       Base URL for services (default: http://localhost)"
    echo "  --verbose           Show detailed request/response information"
    echo "  --concurrent N      Number of concurrent users to simulate (default: 1)"
    echo "  --duration N        Test duration in seconds (default: 300)"
    echo "  --student-only      Run only student workflow tests"
    echo "  --teacher-only      Run only teacher workflow tests"
    echo "  --admin-only        Run only admin workflow tests"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all workflows once"
    echo "  $0 --student-only            # Test only student workflows"
    echo "  $0 --concurrent 5            # Simulate 5 concurrent users"
    echo "  $0 --duration 600 --verbose  # Run for 10 minutes with details"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --concurrent)
            CONCURRENT_USERS="$2"
            shift 2
            ;;
        --duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        --student-only)
            STUDENT_ONLY=true
            shift
            ;;
        --teacher-only)
            TEACHER_ONLY=true
            shift
            ;;
        --admin-only)
            ADMIN_ONLY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${NC}   $1${NC}"
    fi
}

make_api_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local auth_header="$4"
    local expected_status="$5"
    
    ((TOTAL_REQUESTS++))
    
    local curl_args=(-s -w "%{http_code}")
    
    if [ -n "$auth_header" ]; then
        curl_args+=(-H "Authorization: Bearer $auth_header")
    fi
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        curl_args+=(-H "Content-Type: application/json")
        if [ -n "$data" ]; then
            curl_args+=(-d "$data")
        fi
    fi
    
    curl_args+=(-X "$method" "$url")
    
    local response=$(curl "${curl_args[@]}" 2>/dev/null)
    local status_code="${response: -3}"
    local response_body="${response%???}"
    
    log_verbose "$method $url - Status: $status_code"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "$response_body"
        return 0
    else
        ((FAILED_REQUESTS++))
        log_verbose "Expected $expected_status, got $status_code"
        return 1
    fi
}

test_student_workflow() {
    local user_id="$1"
    echo -e "${CYAN}🎓 Testing Student Workflow for User: $user_id${NC}"
    
    local timestamp=$(date +%s)
    local email="student-${user_id}-${timestamp}@example.com"
    
    # Step 1: Student Registration
    log_verbose "Registering student..."
    local register_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/register" \
        "{\"email\":\"$email\",\"password\":\"StudentPass123!\",\"firstName\":\"Student\",\"lastName\":\"User$user_id\",\"role\":\"STUDENT\"}" \
        "" "201")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Student Registration Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local student_id=$(echo "$register_data" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Student registered with ID: $student_id"
    
    # Step 2: Student Login
    log_verbose "Logging in student..."
    local login_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/login" \
        "{\"email\":\"$email\",\"password\":\"StudentPass123!\"}" \
        "" "200")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Student Login Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local access_token=$(echo "$login_data" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Student logged in successfully"
    
    # Step 3: View Available Assessments
    log_verbose "Fetching available assessments..."
    make_api_request "GET" \
        "${BASE_URL}:3000/api/assessments" \
        "" \
        "$access_token" \
        "200" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Could not fetch assessments (may be empty)${NC}"
    else
        log_verbose "Assessments fetched successfully"
    fi
    
    # Step 4: Update Profile
    log_verbose "Updating student profile..."
    make_api_request "PUT" \
        "${BASE_URL}:3000/api/users/$student_id" \
        "{\"firstName\":\"UpdatedStudent\",\"lastName\":\"User$user_id\",\"metadata\":{\"testRun\":true,\"workflowTest\":\"student\"}}" \
        "$access_token" \
        "200" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Student Profile Update Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    log_verbose "Profile updated successfully"
    
    # Step 5: Logout
    log_verbose "Logging out student..."
    make_api_request "POST" \
        "${BASE_URL}:3000/api/users/logout" \
        "" \
        "" \
        "200" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Student Workflow Completed Successfully${NC}"
        ((WORKFLOW_PASSED++))
        return 0
    else
        echo -e "${RED}❌ Student Logout Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
}

test_teacher_workflow() {
    local user_id="$1"
    echo -e "${CYAN}👨‍🏫 Testing Teacher Workflow for User: $user_id${NC}"
    
    local timestamp=$(date +%s)
    local email="teacher-${user_id}-${timestamp}@example.com"
    
    # Step 1: Teacher Registration
    log_verbose "Registering teacher..."
    local register_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/register" \
        "{\"email\":\"$email\",\"password\":\"TeacherPass123!\",\"firstName\":\"Teacher\",\"lastName\":\"User$user_id\",\"role\":\"TEACHER\"}" \
        "" "201")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Teacher Registration Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local teacher_id=$(echo "$register_data" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Teacher registered with ID: $teacher_id"
    
    # Step 2: Teacher Login
    log_verbose "Logging in teacher..."
    local login_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/login" \
        "{\"email\":\"$email\",\"password\":\"TeacherPass123!\"}" \
        "" "200")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Teacher Login Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local access_token=$(echo "$login_data" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Teacher logged in successfully"
    
    # Step 3: Create Assessment (direct to assessment service)
    log_verbose "Creating assessment..."
    local assessment_data=$(make_api_request "POST" \
        "${BASE_URL}:4001/assessments" \
        "{\"title\":\"Test Assessment $user_id\",\"description\":\"Integration test assessment\",\"type\":\"QUIZ\",\"metadata\":{\"testRun\":true}}" \
        "$access_token" \
        "201")
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Assessment creation failed (may require additional auth)${NC}"
    else
        log_verbose "Assessment created successfully"
    fi
    
    # Step 4: View Created Assessments
    log_verbose "Fetching teacher's assessments..."
    make_api_request "GET" \
        "${BASE_URL}:3000/api/assessments" \
        "" \
        "$access_token" \
        "200" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Could not fetch teacher assessments${NC}"
    else
        log_verbose "Teacher assessments fetched successfully"
    fi
    
    # Step 5: Logout
    log_verbose "Logging out teacher..."
    make_api_request "POST" \
        "${BASE_URL}:3000/api/users/logout" \
        "" \
        "" \
        "200" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Teacher Workflow Completed Successfully${NC}"
        ((WORKFLOW_PASSED++))
        return 0
    else
        echo -e "${RED}❌ Teacher Logout Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
}

test_admin_workflow() {
    local user_id="$1"
    echo -e "${CYAN}👑 Testing Admin Workflow for User: $user_id${NC}"
    
    local timestamp=$(date +%s)
    local email="admin-${user_id}-${timestamp}@example.com"
    
    # Step 1: Admin Registration
    log_verbose "Registering admin..."
    local register_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/register" \
        "{\"email\":\"$email\",\"password\":\"AdminPass123!\",\"firstName\":\"Admin\",\"lastName\":\"User$user_id\",\"role\":\"ADMIN\"}" \
        "" "201")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Admin Registration Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local admin_id=$(echo "$register_data" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Admin registered with ID: $admin_id"
    
    # Step 2: Admin Login
    log_verbose "Logging in admin..."
    local login_data=$(make_api_request "POST" \
        "${BASE_URL}:3000/api/users/login" \
        "{\"email\":\"$email\",\"password\":\"AdminPass123!\"}" \
        "" "200")
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Admin Login Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
    
    local access_token=$(echo "$login_data" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    log_verbose "Admin logged in successfully"
    
    # Step 3: View All Users (admin privilege)
    log_verbose "Fetching all users..."
    make_api_request "GET" \
        "${BASE_URL}:3000/api/users" \
        "" \
        "$access_token" \
        "200" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ Could not fetch all users (may require admin privileges)${NC}"
    else
        log_verbose "All users fetched successfully"
    fi
    
    # Step 4: System Health Check (admin function)
    log_verbose "Checking system health..."
    make_api_request "GET" \
        "${BASE_URL}:3000/health" \
        "" \
        "$access_token" \
        "200" > /dev/null
    
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️ System health check failed${NC}"
    else
        log_verbose "System health check successful"
    fi
    
    # Step 5: Logout
    log_verbose "Logging out admin..."
    make_api_request "POST" \
        "${BASE_URL}:3000/api/users/logout" \
        "" \
        "" \
        "200" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Admin Workflow Completed Successfully${NC}"
        ((WORKFLOW_PASSED++))
        return 0
    else
        echo -e "${RED}❌ Admin Logout Failed${NC}"
        ((WORKFLOW_FAILED++))
        return 1
    fi
}

run_workflow_tests() {
    local user_id="$1"
    
    if [ "$STUDENT_ONLY" = true ]; then
        test_student_workflow "$user_id"
    elif [ "$TEACHER_ONLY" = true ]; then
        test_teacher_workflow "$user_id"
    elif [ "$ADMIN_ONLY" = true ]; then
        test_admin_workflow "$user_id"
    else
        # Run all workflows
        test_student_workflow "$user_id"
        sleep 1
        test_teacher_workflow "$user_id"
        sleep 1
        test_admin_workflow "$user_id"
    fi
}

# Main execution
echo -e "${CYAN}🚀 Pediafor Assessment Platform - API Workflow Test Suite${NC}"
echo -e "${CYAN}=======================================================${NC}"
echo -e "${YELLOW}Testing realistic user workflows across the platform...${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  Base URL: $BASE_URL"
echo -e "  Concurrent Users: $CONCURRENT_USERS"
echo -e "  Test Duration: $TEST_DURATION seconds"
echo -e "  Verbose Mode: $VERBOSE"
echo ""

# Check if platform is accessible
echo -e "${BLUE}🔍 Pre-flight Check...${NC}"
if ! curl -s -f --max-time 10 "${BASE_URL}:3000/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Platform not accessible at $BASE_URL:3000${NC}"
    echo -e "${YELLOW}Please ensure the platform is running with: ./platform-manager.sh start${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Platform is accessible${NC}"
echo ""

start_time=$(date +%s)
end_time=$((start_time + TEST_DURATION))

echo -e "${BLUE}🚀 Starting Workflow Tests...${NC}"
echo -e "${NC}=============================${NC}"

# Run concurrent users
if [ "$CONCURRENT_USERS" -eq 1 ]; then
    # Single user mode
    run_workflow_tests 1
else
    # Multiple concurrent users
    for i in $(seq 1 "$CONCURRENT_USERS"); do
        (
            echo -e "${CYAN}🔄 Starting User $i workflow...${NC}"
            run_workflow_tests "$i"
        ) &
    done
    
    # Wait for all background processes
    wait
fi

echo ""
echo -e "${CYAN}📊 Workflow Test Results${NC}"
echo -e "${CYAN}========================${NC}"
echo -e "${GREEN}Workflows Passed: $WORKFLOW_PASSED${NC}"
if [ $WORKFLOW_FAILED -eq 0 ]; then
    echo -e "${GREEN}Workflows Failed: $WORKFLOW_FAILED${NC}"
else
    echo -e "${RED}Workflows Failed: $WORKFLOW_FAILED${NC}"
fi
echo -e "${BLUE}Total Workflows: $((WORKFLOW_PASSED + WORKFLOW_FAILED))${NC}"
echo ""
echo -e "${CYAN}📈 Request Statistics${NC}"
echo -e "${CYAN}====================${NC}"
echo -e "${BLUE}Total Requests: $TOTAL_REQUESTS${NC}"
if [ $FAILED_REQUESTS -eq 0 ]; then
    echo -e "${GREEN}Failed Requests: $FAILED_REQUESTS${NC}"
else
    echo -e "${RED}Failed Requests: $FAILED_REQUESTS${NC}"
fi

if [ $TOTAL_REQUESTS -gt 0 ]; then
    local success_rate=$(( (TOTAL_REQUESTS - FAILED_REQUESTS) * 100 / TOTAL_REQUESTS ))
    echo -e "${BLUE}Success Rate: ${success_rate}%${NC}"
fi

echo ""
if [ $WORKFLOW_FAILED -eq 0 ] && [ $FAILED_REQUESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All API Workflows Completed Successfully!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some workflows failed. Please check the issues above.${NC}"
    exit 1
fi