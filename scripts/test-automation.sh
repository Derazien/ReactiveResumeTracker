#!/bin/bash

# Test script for job automation integration
# This script tests the integration between your main server, automation engine, and Skyvern

echo "🧪 Testing Job Automation Integration..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test URLs
MAIN_SERVER="http://localhost:3000"
AUTOMATION_ENGINE="http://localhost:3001"
SKYVERN_API="http://localhost:8000"
SKYVERN_UI="http://localhost:8080"

# Function to test service health
test_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Testing ${service_name}... "
    
    if curl -s -f "${url}/health" > /dev/null 2>&1 || curl -s -f "${url}" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}❌ DOWN${NC}"
        return 1
    fi
}

# Function to test automation endpoint
test_automation() {
    echo "Testing automation execution..."
    
    # Test data
    TEST_PAYLOAD='{
        "instruction": "Search for React developer jobs on Indeed (this is a test)",
        "targetUrl": "https://indeed.com", 
        "jobCriteria": {
            "keywords": ["React", "Frontend"],
            "location": "Remote",
            "remote": true
        },
        "maxApplications": 2,
        "autoApply": false
    }'
    
    echo "Sending test automation request..."
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "${TEST_PAYLOAD}" \
        "${AUTOMATION_ENGINE}/api/automation/execute" 2>/dev/null)
    
    if [ $? -eq 0 ] && echo "$response" | grep -q "success"; then
        echo -e "${GREEN}✅ Automation test PASSED${NC}"
        echo "Response: $response"
        return 0
    else
        echo -e "${RED}❌ Automation test FAILED${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Main test execution
echo "1. Testing service health..."
echo "----------------------------"

# Test each service
test_service "Main Server" "${MAIN_SERVER}"
MAIN_OK=$?

test_service "Automation Engine" "${AUTOMATION_ENGINE}"
AUTO_OK=$?

test_service "Skyvern API" "${SKYVERN_API}"
SKYVERN_OK=$?

test_service "Skyvern UI" "${SKYVERN_UI}"
UI_OK=$?

echo ""
echo "2. Testing automation integration..."
echo "------------------------------------"

if [ $AUTO_OK -eq 0 ]; then
    test_automation
    AUTOMATION_TEST=$?
else
    echo -e "${YELLOW}⚠️  Skipping automation test - service is down${NC}"
    AUTOMATION_TEST=1
fi

echo ""
echo "3. Test Summary"
echo "==============="

if [ $MAIN_OK -eq 0 ] && [ $AUTO_OK -eq 0 ] && [ $SKYVERN_OK -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL SERVICES ARE HEALTHY!${NC}"
    
    if [ $AUTOMATION_TEST -eq 0 ]; then
        echo -e "${GREEN}🚀 AUTOMATION INTEGRATION WORKING!${NC}"
        echo ""
        echo "🎯 Next steps:"
        echo "  1. Visit http://localhost:3000 - Your main application"
        echo "  2. Visit http://localhost:8080 - Skyvern UI (for debugging)"
        echo "  3. Test job automation endpoints in your application"
        echo ""
        echo "📚 Available automation endpoints:"
        echo "  POST /api/job-applications/automation/execute"
        echo "  POST /api/job-applications/automation/job-hunt" 
        echo "  POST /api/job-applications/automation/quick-search"
        echo "  POST /api/job-applications/automation/linkedin"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Services healthy but automation test failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ SOME SERVICES ARE DOWN${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    [ $MAIN_OK -ne 0 ] && echo "  - Check your main server at ${MAIN_SERVER}"
    [ $AUTO_OK -ne 0 ] && echo "  - Check automation engine at ${AUTOMATION_ENGINE}"  
    [ $SKYVERN_OK -ne 0 ] && echo "  - Check Skyvern API at ${SKYVERN_API}"
    [ $UI_OK -ne 0 ] && echo "  - Check Skyvern UI at ${SKYVERN_UI}"
    echo ""
    echo "💡 Make sure all services are running with:"
    echo "   docker-compose -f docker-compose.automation.yml up -d"
    exit 1
fi

