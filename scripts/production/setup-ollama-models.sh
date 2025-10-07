#!/usr/bin/env bash
set -e

# ============================================================================
# Ollama Multi-Model Setup Script
# ============================================================================
# 
# This script installs and configures multiple Ollama models for:
# 1. ReactiveResumeTracker - Job analysis, content matching, resume generation
# 2. Skyvern - Browser automation and web scraping
#
# Models installed:
# - qwen2.5:7b         - Primary model (fast, efficient, multilingual)
# - qwen2.5:3b         - Backup lightweight model (faster responses)
# - qwen2.5-coder:7b   - Optional: For code-related tasks
#
# Usage:
#   ./scripts/production/setup-ollama-models.sh [OPTIONS]
#
# Options:
#   --minimal           Install only primary model (qwen2.5:7b)
#   --with-coder        Include coder model
#   --list              List all installed models and exit
#   --remove MODEL      Remove a specific model
#   --help              Show this help message
#
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Configuration
OLLAMA_CONTAINER="${OLLAMA_CONTAINER:-ollama}"
OLLAMA_HOST="${OLLAMA_HOST:-http://localhost:11434}"

# Model configuration
PRIMARY_MODEL="qwen2.5:7b-instruct"
BACKUP_MODEL="qwen2.5:3b-instruct"

# Parse arguments
MINIMAL_MODE=false
INSTALL_CODER=false
LIST_ONLY=false
REMOVE_MODEL=""

show_help() {
    echo "Ollama Multi-Model Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --minimal           Install only primary model (qwen2.5:7b-instruct)"
    echo "  --list              List all installed models and exit"
    echo "  --remove MODEL      Remove a specific model"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                               # Install primary + backup models"
    echo "  $0 --minimal                     # Install only primary model"
    echo "  $0 --list                        # List installed models"
    echo "  $0 --remove qwen2.5:3b-instruct  # Remove backup model"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        --minimal)
            MINIMAL_MODE=true
            shift
            ;;
        --list)
            LIST_ONLY=true
            shift
            ;;
        --remove)
            REMOVE_MODEL="$2"
            shift 2
            ;;
        --help)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ============================================================================
# Helper Functions
# ============================================================================

check_ollama_running() {
    if ! docker ps | grep -q "$OLLAMA_CONTAINER"; then
        echo -e "${RED}❌ Error: Ollama container is not running${NC}"
        echo ""
        echo "Please start Ollama first:"
        echo "  docker compose -f unified-docker-compose.yml up -d ollama"
        exit 1
    fi
}

wait_for_ollama() {
    echo -e "${CYAN}⏳ Waiting for Ollama to be ready...${NC}"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$OLLAMA_HOST/api/tags" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Ollama is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -e "${GRAY}   Attempt $attempt/$max_attempts...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Error: Ollama did not become ready in time${NC}"
    exit 1
}

list_models() {
    echo -e "${CYAN}📋 Installed Ollama Models:${NC}"
    echo ""
    docker exec "$OLLAMA_CONTAINER" ollama list || echo -e "${GRAY}   No models installed${NC}"
    echo ""
}

check_model_exists() {
    local model=$1
    docker exec "$OLLAMA_CONTAINER" ollama list | grep -q "^${model}" && return 0 || return 1
}

pull_model() {
    local model=$1
    local description=$2
    
    echo ""
    echo -e "${CYAN}📥 Installing: ${YELLOW}${model}${NC}"
    echo -e "${GRAY}   Purpose: ${description}${NC}"
    echo ""
    
    if check_model_exists "$model"; then
        echo -e "${YELLOW}⚠️  Model already installed, skipping...${NC}"
        return 0
    fi
    
    echo -e "${GRAY}   This may take several minutes depending on your connection...${NC}"
    if docker exec "$OLLAMA_CONTAINER" ollama pull "$model"; then
        echo -e "${GREEN}✓ Successfully installed ${model}${NC}"
        
        # Get model info
        echo -e "${GRAY}   Model info:${NC}"
        docker exec "$OLLAMA_CONTAINER" ollama show "$model" 2>/dev/null | head -10 || true
    else
        echo -e "${RED}❌ Failed to install ${model}${NC}"
        return 1
    fi
}

remove_model() {
    local model=$1
    
    echo ""
    echo -e "${YELLOW}🗑️  Removing model: ${model}${NC}"
    
    if ! check_model_exists "$model"; then
        echo -e "${GRAY}   Model not found, nothing to remove${NC}"
        return 0
    fi
    
    if docker exec "$OLLAMA_CONTAINER" ollama rm "$model"; then
        echo -e "${GREEN}✓ Successfully removed ${model}${NC}"
    else
        echo -e "${RED}❌ Failed to remove ${model}${NC}"
        return 1
    fi
}

test_model() {
    local model=$1
    
    echo ""
    echo -e "${CYAN}🧪 Testing model: ${model}${NC}"
    echo -e "${GRAY}   Running simple prompt...${NC}"
    
    local response=$(docker exec "$OLLAMA_CONTAINER" ollama run "$model" "Say 'Model working' in exactly 2 words." --verbose=false 2>/dev/null || echo "failed")
    
    if [ "$response" != "failed" ]; then
        echo -e "${GREEN}✓ Model is working${NC}"
        echo -e "${GRAY}   Response: ${response}${NC}"
        return 0
    else
        echo -e "${RED}❌ Model test failed${NC}"
        return 1
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║          Ollama Multi-Model Setup Script                  ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Ollama container is running
check_ollama_running

# Wait for Ollama to be ready
wait_for_ollama

# Handle list-only mode
if [ "$LIST_ONLY" = true ]; then
    list_models
    exit 0
fi

# Handle remove model mode
if [ -n "$REMOVE_MODEL" ]; then
    remove_model "$REMOVE_MODEL"
    echo ""
    list_models
    exit 0
fi

# ============================================================================
# Install Models
# ============================================================================

echo -e "${CYAN}🚀 Installing Ollama models...${NC}"
echo ""

# Always install primary model
pull_model "$PRIMARY_MODEL" "Primary model for general tasks (fast, efficient, multilingual)"

# Install backup model unless in minimal mode
if [ "$MINIMAL_MODE" = false ]; then
    pull_model "$BACKUP_MODEL" "Backup lightweight model for faster responses"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║            ✓ Model Installation Complete                  ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show installed models
list_models

# ============================================================================
# Test Models
# ============================================================================

echo -e "${CYAN}🧪 Running model tests...${NC}"

test_model "$PRIMARY_MODEL"

if [ "$MINIMAL_MODE" = false ]; then
    test_model "$BACKUP_MODEL"
fi

# ============================================================================
# Configuration Instructions
# ============================================================================

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║            📋 Configuration Instructions                  ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}1. ReactiveResumeTracker Configuration:${NC}"
echo ""
echo "   Add to your .env file:"
echo ""
echo "   # Ollama Configuration"
echo "   LLM_PROVIDER=local"
echo "   LOCAL_LLM_BASE_URL=http://localhost:11434"
echo "   LOCAL_LLM_MODEL=${PRIMARY_MODEL}"
echo "   LOCAL_LLM_API_KEY=                           # Optional for Ollama"
echo ""

echo -e "${YELLOW}2. Skyvern Configuration:${NC}"
echo ""
echo "   Skyvern can use the same Ollama instance."
echo "   Configure in skyvern/.env or docker-compose:"
echo ""
echo "   OPENAI_API_BASE=http://ollama:11434/v1       # If using Docker network"
echo "   # OR"
echo "   OPENAI_API_BASE=http://localhost:11434/v1    # If running locally"
echo "   OPENAI_API_KEY=ollama                        # Any value works"
echo "   OPENAI_MODEL=${PRIMARY_MODEL}"
echo ""

echo -e "${YELLOW}3. Model Usage:${NC}"
echo ""
echo "   Primary Model (${PRIMARY_MODEL}):"
echo "   - Use for: Job analysis, content matching, resume generation"
echo "   - Better at following instructions and structured output"
echo "   - Context: 128k tokens"
echo "   - Speed: Fast"
echo ""

if [ "$MINIMAL_MODE" = false ]; then
echo "   Backup Model (${BACKUP_MODEL}):"
echo "   - Use for: Quick responses, simple queries"
echo "   - Lightweight and faster than 7b model"
echo "   - Context: 128k tokens"
echo "   - Speed: Very fast"
echo ""
fi

echo -e "${YELLOW}4. Switching Models:${NC}"
echo ""
echo "   To switch between installed models, update the configuration:"
echo "   LOCAL_LLM_MODEL=${PRIMARY_MODEL}     # Primary (recommended)"
if [ "$MINIMAL_MODE" = false ]; then
echo "   LOCAL_LLM_MODEL=${BACKUP_MODEL}      # Backup (faster)"
fi
echo ""

echo -e "${YELLOW}5. API Endpoint:${NC}"
echo ""
echo "   Ollama exposes an OpenAI-compatible API at:"
echo "   http://localhost:11434/v1"
echo ""
echo "   You can use it with any OpenAI-compatible client."
echo ""

echo -e "${YELLOW}6. Management Commands:${NC}"
echo ""
echo "   List models:      ./scripts/production/setup-ollama-models.sh --list"
echo "   Remove model:     ./scripts/production/setup-ollama-models.sh --remove qwen2.5:3b-instruct"
echo "   Reinstall all:    ./scripts/production/setup-ollama-models.sh"
echo "   Minimal install:  ./scripts/production/setup-ollama-models.sh --minimal"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║                 Setup Complete! 🎉                        ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

