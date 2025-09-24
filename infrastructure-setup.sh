#!/bin/bash

# 🚀 SELF-HOSTED INFRASTRUCTURE SETUP SCRIPT
# Sets up complete LLM + Skyvern + ReactiveResumeTracker + n8n stack

set -e

echo "🚀 SETTING UP SELF-HOSTED AI INFRASTRUCTURE"
echo "=============================================="

# Check system requirements
echo "🔍 Checking system requirements..."

# Check for GPU
if command -v nvidia-smi >/dev/null 2>&1; then
    echo "✅ NVIDIA GPU detected"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits
else
    echo "❌ NVIDIA GPU not found. This setup requires a GPU for optimal performance."
    echo "   You can still run CPU-only models, but performance will be significantly slower."
    read -p "Continue anyway? (y/N): " continue_cpu
    if [[ $continue_cpu != "y" ]]; then
        exit 1
    fi
fi

# Check available memory
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 32 ]; then
    echo "⚠️  WARNING: Only ${TOTAL_RAM}GB RAM detected. Recommended: 32GB+"
    echo "   Consider upgrading for optimal performance."
fi

# Check disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2{print $4}' | sed 's/G//')
if [ "$AVAILABLE_SPACE" -lt 100 ]; then
    echo "⚠️  WARNING: Only ${AVAILABLE_SPACE}GB disk space available. Recommended: 200GB+"
fi

echo ""
echo "🐳 Installing Docker and Docker Compose..."

# Install Docker if not present
if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and back in for group changes to take effect."
fi

# Install Docker Compose if not present
if ! command -v docker-compose >/dev/null 2>&1; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
fi

# Install NVIDIA Container Toolkit for GPU support
if command -v nvidia-smi >/dev/null 2>&1; then
    echo "🔧 Installing NVIDIA Container Toolkit..."
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
    curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
    curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
    sudo apt-get update && sudo apt-get install -y nvidia-docker2
    sudo systemctl restart docker
    echo "✅ NVIDIA Container Toolkit installed"
fi

echo ""
echo "📁 Setting up directory structure..."

# Create necessary directories
mkdir -p monitoring n8n-workflows backups backup-scripts traefik

# Create monitoring configuration
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'ollama'
    static_configs:
      - targets: ['ollama:11434']
  
  - job_name: 'skyvern-api'
    static_configs:
      - targets: ['skyvern-api:8000']
  
  - job_name: 'reactive-resume'
    static_configs:
      - targets: ['reactive-resume-server:3000']
  
  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']
EOF

# Create backup script
cat > backup-scripts/backup-all.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting backup process..."

# Backup PostgreSQL databases
docker exec skyvern-postgres pg_dump -U skyvern skyvern > /backups/skyvern_${DATE}.sql
docker exec reactive-resume-postgres pg_dump -U reactive_resume reactive_resume > /backups/reactive_resume_${DATE}.sql
docker exec n8n-postgres pg_dump -U n8n n8n > /backups/n8n_${DATE}.sql

# Backup n8n workflows
docker exec n8n tar -czf /tmp/n8n_workflows_${DATE}.tar.gz -C /home/node/.n8n workflows
docker cp n8n:/tmp/n8n_workflows_${DATE}.tar.gz /backups/

# Compress and cleanup old backups
gzip /backups/*.sql
find /backups -name "*.gz" -mtime +7 -delete

echo "✅ Backup completed: ${DATE}"
EOF

chmod +x backup-scripts/backup-all.sh

echo ""
echo "🔒 Generating secure passwords..."

# Generate secure passwords
SKYVERN_DB_PASSWORD=$(openssl rand -base64 32)
REACTIVE_RESUME_DB_PASSWORD=$(openssl rand -base64 32)
N8N_DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
SKYVERN_API_KEY=$(openssl rand -base64 32)
N8N_PASSWORD=$(openssl rand -base64 16)
GRAFANA_PASSWORD=$(openssl rand -base64 16)

# Save passwords to secure file
cat > .env << EOF
# 🔐 GENERATED SECURE PASSWORDS
# Keep this file secure and backed up!

# Database Passwords
SKYVERN_DB_PASSWORD=${SKYVERN_DB_PASSWORD}
REACTIVE_RESUME_DB_PASSWORD=${REACTIVE_RESUME_DB_PASSWORD}
N8N_DB_PASSWORD=${N8N_DB_PASSWORD}

# Application Secrets
JWT_SECRET=${JWT_SECRET}
SKYVERN_API_KEY=${SKYVERN_API_KEY}

# UI Passwords
N8N_PASSWORD=${N8N_PASSWORD}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
EOF

chmod 600 .env

echo "✅ Secure passwords generated and saved to .env file"

echo ""
echo "🚀 Starting infrastructure..."

# Replace passwords in docker-compose file
sed -i "s/skyvern_password_change_this/${SKYVERN_DB_PASSWORD}/g" self-hosted-infrastructure.yml
sed -i "s/reactive_resume_password_change_this/${REACTIVE_RESUME_DB_PASSWORD}/g" self-hosted-infrastructure.yml
sed -i "s/n8n_password_change_this/${N8N_DB_PASSWORD}/g" self-hosted-infrastructure.yml
sed -i "s/your-jwt-secret-change-this/${JWT_SECRET}/g" self-hosted-infrastructure.yml
sed -i "s/your-secure-api-key-here/${SKYVERN_API_KEY}/g" self-hosted-infrastructure.yml
sed -i "s/change_this_password/${N8N_PASSWORD}/g" self-hosted-infrastructure.yml
sed -i "s/admin_password_change_this/${GRAFANA_PASSWORD}/g" self-hosted-infrastructure.yml

# Start infrastructure
docker-compose -f self-hosted-infrastructure.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "🎉 INFRASTRUCTURE SETUP COMPLETE!"
echo "================================="
echo ""
echo "🌐 ACCESS URLS:"
echo "├── 🤖 Ollama LLM API: http://localhost:11434"
echo "├── 🕷️ Skyvern API: http://localhost:8000"
echo "├── 🕷️ Skyvern UI: http://localhost:8081"
echo "├── 📄 Reactive Resume: http://localhost:5173"
echo "├── 🔄 n8n Automation: http://localhost:5678"
echo "├── 📊 Prometheus: http://localhost:9090"
echo "├── 📈 Grafana: http://localhost:3001"
echo "└── 🔀 Traefik Dashboard: http://localhost:8080"
echo ""
echo "🔐 CREDENTIALS:"
echo "├── n8n: admin / ${N8N_PASSWORD}"
echo "├── Grafana: admin / ${GRAFANA_PASSWORD}"
echo "└── Skyvern API Key: ${SKYVERN_API_KEY}"
echo ""
echo "📊 RESOURCE MONITORING:"
echo "└── Watch GPU usage: watch -n 1 nvidia-smi"
echo ""
echo "🔄 MANAGEMENT COMMANDS:"
echo "├── View logs: docker-compose -f self-hosted-infrastructure.yml logs -f [service]"
echo "├── Restart service: docker-compose -f self-hosted-infrastructure.yml restart [service]"
echo "├── Stop all: docker-compose -f self-hosted-infrastructure.yml down"
echo "└── Start all: docker-compose -f self-hosted-infrastructure.yml up -d"
echo ""
echo "💡 NEXT STEPS:"
echo "1. Configure n8n workflows for automation"
echo "2. Test Skyvern with your LinkedIn automation"
echo "3. Set up monitoring dashboards in Grafana"
echo "4. Configure backups and monitoring alerts"
echo ""
echo "✅ Your self-hosted AI infrastructure is ready!"











