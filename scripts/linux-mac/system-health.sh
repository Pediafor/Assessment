#!/bin/bash
# Pediafor Assessment Platform - System Health Monitor (Linux/macOS)
# This script monitors the health of all services and infrastructure components

set -e

# Configuration
BASE_URL="http://localhost"
CONTINUOUS=false
INTERVAL=30
DETAILED=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
declare -A SERVICES=(
    ["Gateway"]="3000:/health"
    ["User"]="4000:/health"
    ["Assessment"]="4001:/health"
    ["Submission"]="4002:/health"
    ["Grading"]="4003:/health"
    ["RabbitMQ"]="15672:/"
)

# Database configuration
declare -A DATABASES=(
    ["User-DB"]="5432"
    ["Assessment-DB"]="5433"
    ["Submission-DB"]="5434"
    ["Grading-DB"]="5435"
    ["Redis"]="6379"
)

# Infrastructure checks
declare -A INFRASTRUCTURE=(
    ["Docker"]="docker ps"
    ["Network"]="ping -c 1 google.com"
)

# Parse command line arguments
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --base-url URL    Base URL for services (default: http://localhost)"
    echo "  --continuous      Run continuous monitoring"
    echo "  --interval N      Interval in seconds for continuous mode (default: 30)"
    echo "  --detailed        Show detailed service information"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Single health check"
    echo "  $0 --continuous              # Continuous monitoring every 30s"
    echo "  $0 --continuous --interval 10 # Continuous monitoring every 10s"
    echo "  $0 --detailed                # Detailed health information"
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --base-url)
            BASE_URL="$2"
            shift 2
            ;;
        --continuous)
            CONTINUOUS=true
            shift
            ;;
        --interval)
            INTERVAL="$2"
            shift 2
            ;;
        --detailed)
            DETAILED=true
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

print_header() {
    clear
    echo -e "${CYAN}💊 Pediafor Assessment Platform - System Health Monitor${NC}"
    echo -e "${CYAN}========================================================${NC}"
    echo -e "${BLUE}Monitoring Time: $(date)${NC}"
    echo ""
}

check_service_health() {
    local service_name="$1"
    local config="$2"
    local port=$(echo $config | cut -d':' -f1)
    local path=$(echo $config | cut -d':' -f2)
    
    local status="DOWN"
    local response_time="N/A"
    local details=""
    
    if command -v curl > /dev/null 2>&1; then
        local start_time=$(date +%s%N)
        if curl -s -f --max-time 5 "${BASE_URL}:${port}${path}" > /dev/null 2>&1; then
            local end_time=$(date +%s%N)
            response_time=$(( (end_time - start_time) / 1000000 ))
            status="UP"
        else
            details="Service not responding"
        fi
    else
        if nc -z localhost "$port" 2>/dev/null; then
            status="UP"
            details="Port accessible (curl not available)"
        else
            details="Port not accessible"
        fi
    fi
    
    if [ "$status" = "UP" ]; then
        echo -e "${GREEN}✅ $service_name${NC} - Status: ${GREEN}$status${NC}"
        [ "$DETAILED" = true ] && [ "$response_time" != "N/A" ] && echo -e "   Response Time: ${response_time}ms"
    else
        echo -e "${RED}❌ $service_name${NC} - Status: ${RED}$status${NC}"
        [ -n "$details" ] && echo -e "   ${YELLOW}$details${NC}"
    fi
}

check_database_health() {
    local db_name="$1"
    local port="$2"
    
    local status="DOWN"
    local details=""
    
    if nc -z localhost "$port" 2>/dev/null; then
        status="UP"
    else
        details="Port $port not accessible"
    fi
    
    if [ "$status" = "UP" ]; then
        echo -e "${GREEN}🗄️  $db_name${NC} - Status: ${GREEN}$status${NC}"
        [ "$DETAILED" = true ] && echo -e "   Port: $port"
    else
        echo -e "${RED}🗄️  $db_name${NC} - Status: ${RED}$status${NC}"
        [ -n "$details" ] && echo -e "   ${YELLOW}$details${NC}"
    fi
}

check_infrastructure_health() {
    local component="$1"
    local command="$2"
    
    local status="DOWN"
    local details=""
    
    if eval "$command" > /dev/null 2>&1; then
        status="UP"
    else
        details="Command failed: $command"
    fi
    
    if [ "$status" = "UP" ]; then
        echo -e "${GREEN}🔧 $component${NC} - Status: ${GREEN}$status${NC}"
    else
        echo -e "${RED}🔧 $component${NC} - Status: ${RED}$status${NC}"
        [ -n "$details" ] && echo -e "   ${YELLOW}$details${NC}"
    fi
}

get_docker_stats() {
    if command -v docker > /dev/null 2>&1; then
        echo ""
        echo -e "${BLUE}🐳 Docker Container Status:${NC}"
        echo -e "${NC}---------------------------${NC}"
        
        if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -20; then
            true
        else
            echo -e "${RED}Failed to retrieve Docker container information${NC}"
        fi
    fi
}

get_system_resources() {
    if [ "$DETAILED" = true ]; then
        echo ""
        echo -e "${BLUE}💾 System Resources:${NC}"
        echo -e "${NC}-------------------${NC}"
        
        # Memory usage
        if command -v free > /dev/null 2>&1; then
            echo -e "${CYAN}Memory:${NC}"
            free -h
        fi
        
        # Disk usage
        echo -e "${CYAN}Disk Usage:${NC}"
        df -h / 2>/dev/null || echo "Disk info unavailable"
        
        # CPU load (on Linux)
        if [ -f /proc/loadavg ]; then
            echo -e "${CYAN}CPU Load:${NC}"
            cat /proc/loadavg
        fi
    fi
}

run_health_check() {
    print_header
    
    echo -e "${BLUE}🔍 Service Health Status:${NC}"
    echo -e "${NC}-------------------------${NC}"
    for service in "${!SERVICES[@]}"; do
        check_service_health "$service" "${SERVICES[$service]}"
    done
    
    echo ""
    echo -e "${BLUE}🗄️  Database Health Status:${NC}"
    echo -e "${NC}----------------------------${NC}"
    for db in "${!DATABASES[@]}"; do
        check_database_health "$db" "${DATABASES[$db]}"
    done
    
    echo ""
    echo -e "${BLUE}🔧 Infrastructure Health:${NC}"
    echo -e "${NC}-------------------------${NC}"
    for component in "${!INFRASTRUCTURE[@]}"; do
        check_infrastructure_health "$component" "${INFRASTRUCTURE[$component]}"
    done
    
    if [ "$DETAILED" = true ]; then
        get_docker_stats
        get_system_resources
    fi
    
    echo ""
    echo -e "${CYAN}📊 Health Check Complete${NC}"
    
    if [ "$CONTINUOUS" = true ]; then
        echo -e "${YELLOW}Next check in $INTERVAL seconds... (Press Ctrl+C to stop)${NC}"
    fi
}

# Trap to handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Health monitoring stopped.${NC}"; exit 0' INT

# Main execution
if [ "$CONTINUOUS" = true ]; then
    echo -e "${CYAN}Starting continuous health monitoring...${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo ""
    
    while true; do
        run_health_check
        sleep "$INTERVAL"
    done
else
    run_health_check
fi