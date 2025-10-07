#!/usr/bin/env bash
# ============================================================================
# Ollama Model Comparison Test
# ============================================================================
# 
# This script tests multiple Ollama models with the same prompt to compare
# their responses and performance.
#
# Usage:
#   ./scripts/production/compare-ollama-models.sh "Your test prompt here"
#
# Example:
#   ./scripts/production/compare-ollama-models.sh "Explain what a software engineer does"
#
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

OLLAMA_CONTAINER="ollama"

# Default test prompt
DEFAULT_PROMPT="List 3 key skills for a software engineer position. Be concise."

# Get prompt from argument or use default
TEST_PROMPT="${1:-$DEFAULT_PROMPT}"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║          Ollama Model Comparison Test                     ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Ollama is running
if ! docker ps | grep -q "$OLLAMA_CONTAINER"; then
    echo -e "${RED}❌ Error: Ollama container is not running${NC}"
    exit 1
fi

# Get list of installed models
echo -e "${CYAN}📋 Detecting installed models...${NC}"
echo ""

MODELS=$(docker exec "$OLLAMA_CONTAINER" ollama list | tail -n +2 | awk '{print $1}')

if [ -z "$MODELS" ]; then
    echo -e "${RED}❌ No models found${NC}"
    exit 1
fi

echo -e "${GREEN}Found models:${NC}"
for model in $MODELS; do
    echo -e "  • ${YELLOW}$model${NC}"
done
echo ""

# Test prompt
echo -e "${CYAN}📝 Test Prompt:${NC}"
echo -e "${GRAY}\"$TEST_PROMPT\"${NC}"
echo ""
echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test each model
for model in $MODELS; do
    echo -e "${CYAN}🤖 Testing: ${YELLOW}$model${NC}"
    echo -e "${GRAY}────────────────────────────────────────────────────────────${NC}"
    
    # Start timer
    START_TIME=$(date +%s.%N)
    
    # Run the model
    RESPONSE=$(docker exec "$OLLAMA_CONTAINER" ollama run "$model" "$TEST_PROMPT" 2>&1)
    
    # End timer
    END_TIME=$(date +%s.%N)
    DURATION=$(echo "$END_TIME - $START_TIME" | bc)
    
    # Display results
    echo -e "${GREEN}Response:${NC}"
    echo "$RESPONSE" | sed 's/^/  /'
    echo ""
    echo -e "${GRAY}⏱️  Time: ${DURATION} seconds${NC}"
    echo ""
    echo -e "${GRAY}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
done

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║          Comparison Complete                              ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}💡 Tips:${NC}"
echo ""
echo -e "  • ${CYAN}qwen2.5:7b${NC} - General purpose, balanced"
echo -e "  • ${CYAN}qwen2.5:7b-instruct${NC} - Better at following instructions"
echo -e "  • ${CYAN}qwen2.5:3b${NC} - Faster, lightweight"
echo -e "  • ${CYAN}qwen2.5-coder:7b${NC} - Specialized for code"
echo ""
echo -e "Choose based on your use case:"
echo -e "  • Job analysis: ${GREEN}qwen2.5:7b-instruct${NC} (best instruction following)"
echo -e "  • Resume generation: ${GREEN}qwen2.5:7b${NC} (balanced quality)"
echo -e "  • Quick responses: ${GREEN}qwen2.5:3b${NC} (fastest)"
echo -e "  • Code tasks: ${GREEN}qwen2.5-coder:7b${NC} (code-focused)"
echo ""

