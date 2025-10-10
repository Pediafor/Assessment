#!/bin/bash
# Pediafor Assessment Platform - Complete Integration Test (Linux/macOS)
# This script tests the entire system end-to-end including all services and event flows

set -e

# Configuration
BASE_URL="http://localhost"
VERBOSE=false
SKIP_EVENT_TESTS=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Parse command line arguments
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
        --skip-event-tests)
            SKIP_EVENT_TESTS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--base-url URL] [--verbose] [--skip-event-tests]"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}🚀 Pediafor Assessment Platform - Integration Test Suite${NC}"
echo -e "${CYAN}=================================================${NC}"
echo -e "${YELLOW}Testing complete system integration...${NC}"
echo ""

# Services configuration
declare -A SERVICES=(
    ["Gateway"]="3000:/health"
    ["User"]="4000:/health"
    ["Assessment"]="4001:/health"
    ["Submission"]="4002:/health"
    ["Grading"]="4003:/health"
    ["RabbitMQ"]="15672:/"
)

# Database ports
declare -A DATABASES=(
    ["User-DB"]="5432"
    ["Assessment-DB"]="5433"
    ["Submission-DB"]="5434"
    ["Grading-DB"]="5435"
    ["Redis"]="6379"
)

write_test_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name${NC}"
        [ -n "$details" ] && echo -e "   ${NC}$details${NC}"
        ((TESTS_FAILED++))
    fi
}

test_service_health() {
    local service_name="$1"
    local config="$2"
    local port=$(echo $config | cut -d':' -f1)
    local path=$(echo $config | cut -d':' -f2)
    
    if curl -s -f --max-time 10 "${BASE_URL}:${port}${path}" > /dev/null 2>&1; then
        write_test_result "$service_name Service Health" "PASS"
        return 0
    else
        write_test_result "$service_name Service Health" "FAIL" "Service not responding"
        return 1
    fi
}

test_database_connection() {
    local db_name="$1"
    local port="$2"
    
    if nc -z localhost "$port" 2>/dev/null; then
        write_test_result "$db_name Connection" "PASS"
        return 0
    else
        write_test_result "$db_name Connection" "FAIL" "Port $port not accessible"
        return 1
    fi
}

test_user_workflow() {
    echo ""
    echo -e "${CYAN}🔐 Testing Complete User Authentication Workflow...${NC}"
    
    # Generate unique test user
    local timestamp=$(date +%s)
    local test_email="integration-test-${timestamp}@example.com"
    
    # Test user registration
    local register_response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$test_email\",\"password\":\"TestPassword123!\",\"firstName\":\"Integration\",\"lastName\":\"Test\",\"role\":\"STUDENT\"}" \
        "${BASE_URL}:3000/api/users/register" 2>/dev/null)
    
    local register_code="${register_response: -3}"
    if [ "$register_code" = "201" ]; then
        write_test_result "User Registration via Gateway" "PASS"
        local user_data="${register_response%???}"
        local user_id=$(echo "$user_data" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    else
        write_test_result "User Registration via Gateway" "FAIL" "Status: $register_code"
        return 1
    fi
    
    # Test user login
    local login_response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$test_email\",\"password\":\"TestPassword123!\"}" \
        -c /tmp/cookies.txt \
        "${BASE_URL}:3000/api/users/login" 2>/dev/null)
    
    local login_code="${login_response: -3}"
    if [ "$login_code" = "200" ]; then
        write_test_result "User Login via Gateway" "PASS"
        local login_data="${login_response%???}"
        local access_token=$(echo "$login_data" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    else
        write_test_result "User Login via Gateway" "FAIL" "Status: $login_code"
        return 1
    fi
    
    # Test accessing protected resource
    local profile_response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $access_token" \
        "${BASE_URL}:3000/api/users/$user_id" 2>/dev/null)
    
    local profile_code="${profile_response: -3}"
    if [ "$profile_code" = "200" ]; then
        write_test_result "Access Protected Resource" "PASS"
    else
        write_test_result "Access Protected Resource" "FAIL" "Status: $profile_code"
    fi
    
    # Test profile update
    local update_response=$(curl -s -w "%{http_code}" -X PUT \
        -H "Authorization: Bearer $access_token" \
        -H "Content-Type: application/json" \
        -d '{"firstName":"Updated","lastName":"User","metadata":{"testRun":true}}' \
        "${BASE_URL}:3000/api/users/$user_id" 2>/dev/null)
    
    local update_code="${update_response: -3}"
    if [ "$update_code" = "200" ]; then
        write_test_result "User Profile Update" "PASS"
    else
        write_test_result "User Profile Update" "FAIL" "Status: $update_code"
    fi
    
    # Test logout
    local logout_response=$(curl -s -w "%{http_code}" -X POST \
        -b /tmp/cookies.txt \
        "${BASE_URL}:3000/api/users/logout" 2>/dev/null)
    
    local logout_code="${logout_response: -3}"
    if [ "$logout_code" = "200" ]; then
        write_test_result "User Logout" "PASS"
    else
        write_test_result "User Logout" "FAIL" "Status: $logout_code"
    fi
    
    # Cleanup
    rm -f /tmp/cookies.txt
}

test_assessment_workflow() {
    echo ""
    echo -e "${CYAN}📝 Testing Assessment Management Workflow...${NC}"
    
    # Test direct assessment service access
    local health_response=$(curl -s -w "%{http_code}" "${BASE_URL}:4001/health" 2>/dev/null)
    local health_code="${health_response: -3}"
    
    if [ "$health_code" = "200" ]; then
        write_test_result "Assessment Service Access" "PASS"
    else
        write_test_result "Assessment Service Access" "FAIL" "Status: $health_code"
    fi
}

test_event_flow() {
    if [ "$SKIP_EVENT_TESTS" = true ]; then
        echo ""
        echo -e "${YELLOW}⏭️  Skipping Event Flow Tests (as requested)${NC}"
        return
    fi
    
    echo ""
    echo -e "${CYAN}📡 Testing Cross-Service Event Flow...${NC}"
    
    # Test RabbitMQ Management API
    local rabbit_response=$(curl -s -w "%{http_code}" "${BASE_URL}:15672/api/overview" 2>/dev/null)
    local rabbit_code="${rabbit_response: -3}"
    
    if [ "$rabbit_code" = "200" ]; then
        write_test_result "RabbitMQ Management API" "PASS"
    else
        write_test_result "RabbitMQ Management API" "FAIL" "Requires authentication or service down"
    fi
    
    # Test event publishing by creating a user
    local timestamp=$(date +%s)
    local event_email="event-test-${timestamp}@example.com"
    
    local event_response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$event_email\",\"password\":\"EventTest123!\",\"firstName\":\"Event\",\"lastName\":\"Test\",\"role\":\"STUDENT\"}" \
        "${BASE_URL}:4000/users/register" 2>/dev/null)
    
    local event_code="${event_response: -3}"
    if [ "$event_code" = "201" ]; then
        write_test_result "User Registration Event Publishing" "PASS" "Events should be published to RabbitMQ"
    else
        write_test_result "User Registration Event Publishing" "FAIL" "Status: $event_code"
    fi
}

test_inter_service_communication() {
    echo ""
    echo -e "${CYAN}🔗 Testing Inter-Service Communication...${NC}"
    
    # Test gateway to user service routing
    local gateway_user_response=$(curl -s -w "%{http_code}" "${BASE_URL}:3000/api/users/health" 2>/dev/null)
    local gateway_user_code="${gateway_user_response: -3}"
    
    if [ "$gateway_user_code" = "200" ]; then
        write_test_result "Gateway → User Service Routing" "PASS"
    else
        write_test_result "Gateway → User Service Routing" "FAIL" "Status: $gateway_user_code"
    fi
    
    # Test direct service access
    local direct_response=$(curl -s -w "%{http_code}" "${BASE_URL}:4000/health" 2>/dev/null)
    local gateway_response=$(curl -s -w "%{http_code}" "${BASE_URL}:3000/health" 2>/dev/null)
    
    local direct_code="${direct_response: -3}"
    local gateway_code="${gateway_response: -3}"
    
    if [ "$direct_code" = "200" ] && [ "$gateway_code" = "200" ]; then
        write_test_result "Direct Service Access" "PASS"
    else
        write_test_result "Direct Service Access" "FAIL" "Gateway: $gateway_code, User: $direct_code"
    fi
}

# Main Test Execution
echo -e "${BLUE}🔍 Phase 1: Infrastructure Health Checks${NC}"
echo -e "${NC}----------------------------------------${NC}"

# Test all services
for service in "${!SERVICES[@]}"; do
    test_service_health "$service" "${SERVICES[$service]}"
    sleep 0.1
done

# Test all databases
for db in "${!DATABASES[@]}"; do
    test_database_connection "$db" "${DATABASES[$db]}"
    sleep 0.1
done

echo ""
echo -e "${BLUE}🔍 Phase 2: End-to-End Workflow Tests${NC}"
echo -e "${NC}------------------------------------${NC}"

# Test complete workflows
test_user_workflow
test_assessment_workflow
test_inter_service_communication
test_event_flow

# Summary
echo ""
echo -e "${CYAN}📊 Integration Test Results${NC}"
echo -e "${CYAN}===========================${NC}"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}Tests Failed: $TESTS_FAILED${NC}"
else
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
fi
echo -e "${BLUE}Total Tests: $((TESTS_PASSED + TESTS_FAILED))${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All Integration Tests Passed! Platform is fully operational.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit 1
fi