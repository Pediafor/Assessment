#!/bin/bash
# Pediafor Assessment Platform - Platform Manager (Linux/macOS)
# Single command platform management and testing suite

set -e

# Configuration
COMPOSE_FILE="docker-compose.yml"
HEALTH_CHECK_TIMEOUT=60
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_header() {
    echo -e "${CYAN}🚀 Pediafor Assessment Platform Manager${NC}"
    echo -e "${CYAN}=======================================${NC}"
    echo ""
}

show_help() {
    print_header
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start       Start the entire platform"
    echo "  stop        Stop the entire platform"
    echo "  restart     Restart the entire platform"
    echo "  status      Show platform status"
    echo "  test        Run comprehensive test suite"
    echo "  monitor     Start continuous health monitoring"
    echo "  logs        Show logs from all services"
    echo "  clean       Clean up containers and volumes"
    echo "  rebuild     Rebuild and restart the platform"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --verbose   Show detailed output"
    echo "  --timeout N Set health check timeout (default: 60 seconds)"
    echo ""
    echo "Examples:"
    echo "  $0 start              # Start the platform"
    echo "  $0 test --verbose     # Run tests with detailed output"
    echo "  $0 monitor            # Start continuous monitoring"
    echo "  $0 restart            # Restart all services"
    echo "  $0 clean              # Clean up everything"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${NC}   $1${NC}"
    fi
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Determine compose command
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    log_verbose "Using compose command: $COMPOSE_CMD"
    log_success "Dependencies check passed"
}

wait_for_services() {
    log_info "Waiting for services to be healthy..."
    
    local timeout=$HEALTH_CHECK_TIMEOUT
    local elapsed=0
    local interval=5
    
    while [ $elapsed -lt $timeout ]; do
        if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
            log_success "Platform is healthy and ready!"
            return 0
        fi
        
        log_verbose "Waiting for services... ($elapsed/$timeout seconds)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    log_warning "Services may not be fully ready yet (timeout reached)"
    return 1
}

start_platform() {
    print_header
    log_info "Starting Pediafor Assessment Platform..."
    
    check_dependencies
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    log_info "Starting all services..."
    if [ "$VERBOSE" = true ]; then
        $COMPOSE_CMD up -d
    else
        $COMPOSE_CMD up -d > /dev/null 2>&1
    fi
    
    log_success "All services started"
    
    # Wait for services to be ready
    wait_for_services
    
    echo ""
    log_success "Platform started successfully!"
    echo ""
    echo -e "${CYAN}🌐 Available Services:${NC}"
    echo -e "  Gateway:    http://localhost:3000"
    echo -e "  User:       http://localhost:4000"
    echo -e "  Assessment: http://localhost:4001"
    echo -e "  Submission: http://localhost:4002"
    echo -e "  Grading:    http://localhost:4003"
    echo -e "  RabbitMQ:   http://localhost:15672 (guest/guest)"
    echo ""
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo -e "  • Run tests: $0 test"
    echo -e "  • Monitor health: $0 monitor"
    echo -e "  • View logs: $0 logs"
}

stop_platform() {
    print_header
    log_info "Stopping Pediafor Assessment Platform..."
    
    check_dependencies
    cd "$PROJECT_ROOT"
    
    log_info "Stopping all services..."
    if [ "$VERBOSE" = true ]; then
        $COMPOSE_CMD down
    else
        $COMPOSE_CMD down > /dev/null 2>&1
    fi
    
    log_success "Platform stopped successfully!"
}

restart_platform() {
    print_header
    log_info "Restarting Pediafor Assessment Platform..."
    
    stop_platform
    echo ""
    start_platform
}

show_status() {
    print_header
    log_info "Platform Status Check..."
    
    check_dependencies
    cd "$PROJECT_ROOT"
    
    echo ""
    echo -e "${CYAN}🐳 Docker Containers:${NC}"
    echo -e "${NC}-------------------${NC}"
    $COMPOSE_CMD ps
    
    echo ""
    echo -e "${CYAN}💊 Service Health:${NC}"
    echo -e "${NC}-----------------${NC}"
    
    # Run quick health check
    if [ -f "$SCRIPT_DIR/system-health.sh" ]; then
        bash "$SCRIPT_DIR/system-health.sh"
    else
        log_warning "system-health.sh not found, showing basic status only"
    fi
}

run_tests() {
    print_header
    log_info "Running Comprehensive Test Suite..."
    
    check_dependencies
    
    # Check if platform is running
    if ! curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
        log_error "Platform is not running. Start it first with: $0 start"
        exit 1
    fi
    
    echo ""
    echo -e "${CYAN}🧪 Test Suite Execution${NC}"
    echo -e "${NC}======================${NC}"
    
    local test_failed=false
    
    # Run integration tests
    if [ -f "$SCRIPT_DIR/integration-test.sh" ]; then
        log_info "Running integration tests..."
        if [ "$VERBOSE" = true ]; then
            bash "$SCRIPT_DIR/integration-test.sh" --verbose
        else
            bash "$SCRIPT_DIR/integration-test.sh"
        fi
        
        if [ $? -ne 0 ]; then
            test_failed=true
        fi
    else
        log_warning "integration-test.sh not found, skipping integration tests"
    fi
    
    echo ""
    
    # Run API workflow tests
    if [ -f "$SCRIPT_DIR/api-workflow-test.sh" ]; then
        log_info "Running API workflow tests..."
        if [ "$VERBOSE" = true ]; then
            bash "$SCRIPT_DIR/api-workflow-test.sh" --verbose
        else
            bash "$SCRIPT_DIR/api-workflow-test.sh"
        fi
        
        if [ $? -ne 0 ]; then
            test_failed=true
        fi
    else
        log_warning "api-workflow-test.sh not found, skipping workflow tests"
    fi
    
    echo ""
    if [ "$test_failed" = true ]; then
        log_error "Some tests failed. Please check the output above."
        exit 1
    else
        log_success "All tests passed successfully!"
    fi
}

start_monitoring() {
    print_header
    log_info "Starting Continuous Platform Monitoring..."
    
    if [ -f "$SCRIPT_DIR/system-health.sh" ]; then
        log_info "Starting health monitor..."
        bash "$SCRIPT_DIR/system-health.sh" --continuous --detailed
    else
        log_error "system-health.sh not found"
        exit 1
    fi
}

show_logs() {
    print_header
    log_info "Showing Platform Logs..."
    
    check_dependencies
    cd "$PROJECT_ROOT"
    
    echo ""
    echo -e "${CYAN}📋 Container Logs:${NC}"
    echo -e "${NC}-----------------${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop following logs${NC}"
    echo ""
    
    $COMPOSE_CMD logs -f --tail=50
}

clean_platform() {
    print_header
    log_warning "Cleaning up Pediafor Assessment Platform..."
    
    check_dependencies
    cd "$PROJECT_ROOT"
    
    echo ""
    echo -e "${RED}⚠️  This will remove all containers, networks, and volumes!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Stopping and removing all services..."
        $COMPOSE_CMD down -v --remove-orphans
        
        log_info "Removing unused Docker resources..."
        docker system prune -f
        
        log_success "Platform cleaned up successfully!"
    else
        log_info "Cleanup cancelled"
    fi
}

rebuild_platform() {
    print_header
    log_info "Rebuilding Pediafor Assessment Platform..."
    
    check_dependencies
    cd "$PROJECT_ROOT"
    
    log_info "Stopping services..."
    $COMPOSE_CMD down
    
    log_info "Rebuilding images..."
    if [ "$VERBOSE" = true ]; then
        $COMPOSE_CMD build --no-cache
    else
        $COMPOSE_CMD build --no-cache > /dev/null 2>&1
    fi
    
    log_success "Rebuild complete!"
    
    echo ""
    log_info "Starting rebuilt platform..."
    start_platform
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        start|stop|restart|status|test|monitor|logs|clean|rebuild|help)
            COMMAND="$1"
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --timeout)
            HEALTH_CHECK_TIMEOUT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute command
case "${COMMAND:-help}" in
    start)
        start_platform
        ;;
    stop)
        stop_platform
        ;;
    restart)
        restart_platform
        ;;
    status)
        show_status
        ;;
    test)
        run_tests
        ;;
    monitor)
        start_monitoring
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_platform
        ;;
    rebuild)
        rebuild_platform
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: ${COMMAND}"
        show_help
        exit 1
        ;;
esac