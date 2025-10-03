# 📋 Complete Script Functionality Guide

## 🎯 **Script Categories by Functionality:**

---

## 🔥 **ROOT DIRECTORY - Main Launchers:**

### **`start-local.ps1`** 🚀
- **Function**: Local development launcher (Windows)
- **Runs**: ReactiveResume only (default) OR complete stack (-Full)
- **Database**: SQLite (fast local development)
- **Process**: Background PowerShell jobs (terminal free)
- **Usage**: 
  ```powershell
  .\start-local.ps1                # ReactiveResume only
  .\start-local.ps1 -Full          # Complete automation stack
  .\start-local.ps1 -Status        # Check status
  .\start-local.ps1 -Stop          # Stop all
  ```

### **`deploy-server.sh`** 🌐
- **Function**: Server deployment launcher (Linux)
- **Runs**: Complete automation stack (default) OR ReactiveResume only (--lite)
- **Database**: Docker PostgreSQL (production)
- **Process**: PM2 + Docker (background, terminal free)
- **Usage**:
  ```bash
  ./deploy-server.sh               # Complete automation empire
  ./deploy-server.sh --lite        # ReactiveResume only
  ```

---

## 📁 **scripts/development/ - Local Development:**

### **`local-setup-reactiveresume-only.ps1`** ⚡
- **Function**: Lightweight local development
- **Runs**: **ReactiveResume ONLY**
- **Services**: Backend + Frontend + Chrome PDF
- **Database**: SQLite (fastest for development)
- **Docker**: Chrome service only
- **RAM Usage**: ~2-3GB
- **Startup**: ~2 minutes
- **Use Case**: Daily development, feature testing

### **`local-setup-complete-stack.ps1`** 💪
- **Function**: Full automation stack locally
- **Runs**: **ReactiveResume + Skyvern + All Services**
- **Services**: ReactiveResume + Skyvern + Chrome + PDF + Automation
- **Database**: SQLite (ReactiveResume) + Docker PostgreSQL (Skyvern)
- **Docker**: All Skyvern containers + Chrome
- **RAM Usage**: ~6-8GB
- **Startup**: ~5 minutes
- **Use Case**: Test complete automation workflows, LinkedIn job scraping

---

## 🌐 **scripts/production/ - Server Deployment:**

### **`server-setup-reactiveresume-only.sh`** 💡
- **Function**: Lightweight server deployment
- **Runs**: **ReactiveResume ONLY** 
- **Services**: ReactiveResume + PostgreSQL + Redis + MinIO + Chrome
- **Database**: Docker PostgreSQL (port 5432)
- **Process**: PM2 (background Node.js management)
- **RAM Usage**: ~6GB
- **Use Case**: Simple resume builder hosting, no automation

### **`server-setup-complete-stack.sh`** 🚀
- **Function**: Complete automation empire
- **Runs**: **ReactiveResume + Skyvern + Ollama + Everything**
- **Services**: All ReactiveResume + All Skyvern + LLM
- **Database**: Docker PostgreSQL (2 instances: ports 5432 + 5433)
- **Process**: PM2 + Docker (everything background)
- **RAM Usage**: ~18GB
- **Use Case**: Full production automation platform

### **`complete-database-import.js`** 📊
- **Function**: Database migration tool
- **Purpose**: Import SQLite dev.db → PostgreSQL
- **Usage**: `node complete-database-import.js`
- **Imports**: Users, resumes, job applications, companies, content

### **`export-current-database.js`** 💾
- **Function**: Database export tool
- **Purpose**: Export current SQLite to JSON for migration
- **Usage**: `node export-current-database.js`
- **Exports**: Complete database with latest changes

---

## 🐳 **scripts/docker/ - Docker Configurations:**

### **`docker-compose-reactiveresume-only.yml`** ⚡
- **Function**: Lightweight Docker setup
- **Runs**: **ReactiveResume Services ONLY**
- **Services**: PostgreSQL + Redis + MinIO + Chrome
- **Ports**: 5432 (PostgreSQL), 6379 (Redis), 9000/9001 (MinIO), 3001 (Chrome)
- **RAM Usage**: ~4GB
- **Use Case**: Simple hosting, no automation

### **`docker-compose-complete-stack.yml`** 🤖
- **Function**: Complete automation Docker setup
- **Runs**: **ReactiveResume + Skyvern + Ollama**
- **Services**: Everything containerized
- **Ports**: All services (5432, 5433, 6379, 6380, 8000, 8081, 9000, 9001, 11434)
- **RAM Usage**: ~16GB
- **Use Case**: Full automation platform

---

## 🔧 **ROOT DIRECTORY - Existing Docker:**

### **`docker-compose.skyvern.yml`** 🤖 (Existing)
- **Function**: Skyvern automation only
- **Runs**: **Skyvern ONLY** (no ReactiveResume)
- **Services**: Skyvern PostgreSQL + Redis + API + UI
- **Ports**: 5433 (PostgreSQL), 6380 (Redis), 8000 (API), 8081 (UI)
- **RAM Usage**: ~4GB
- **Use Case**: Add automation to existing ReactiveResume

### **`unified-docker-compose.yml`** 🌟
- **Function**: Alternative complete stack
- **Runs**: **ReactiveResume + Skyvern + Ollama**
- **Note**: Similar to scripts/docker/docker-compose-complete-stack.yml
- **Can be deleted** (duplicate functionality)

---

## 🔍 **scripts/debug/ - Debugging Tools:**

### **`setup-simple-vnc.ps1`** 🖥️
- **Function**: VNC debugging setup
- **Purpose**: Remote desktop access for server debugging
- **Use Case**: Visual server management

### **`setup-vnc-access.ps1`** 🔧
- **Function**: VNC access configuration
- **Purpose**: Configure VNC remote access
- **Use Case**: Remote server debugging

### **`setup-x11-forwarding.ps1`** 🖼️
- **Function**: X11 forwarding setup
- **Purpose**: Linux GUI forwarding over SSH
- **Use Case**: Advanced server debugging

---

## 📚 **scripts/legacy/ - Reference Scripts:**

### **`setup.ps1`** (29KB) 🏛️
- **Function**: Original comprehensive Windows setup
- **Status**: Legacy (replaced by organized scripts)
- **Keep**: For reference only

### **`setup.sh`** (13KB) 🐧
- **Function**: Original Linux setup
- **Status**: Legacy (replaced by organized scripts)
- **Keep**: For reference only

### **`start-complete-system.ps1`** (13KB) 💼
- **Function**: Your current local startup script
- **Runs**: ReactiveResume + Skyvern (your current approach)
- **Status**: **Still useful** - this is what you currently use!
- **Consider**: Keep as alternative to new organized scripts

---

## 🔧 **ROOT DIRECTORY - Utilities:**

### **`copy-arc-to-docker.ps1`** 📦
- **Function**: Copy Arc browser to Docker
- **Purpose**: Browser automation utility
- **Keep**: May be useful for Skyvern debugging

### **`self-hosted-infrastructure.yml`** 🏗️
- **Function**: Alternative infrastructure setup
- **Purpose**: Self-hosted infrastructure definition
- **Status**: May be obsolete (check if needed)

---

## 🎯 **SUMMARY BY USE CASE:**

### **🚀 ReactiveResume ONLY:**
```
Local Development:
├── start-local.ps1 (default mode)
└── scripts/development/local-setup-reactiveresume-only.ps1

Server Production:
├── deploy-server.sh --lite
├── scripts/production/server-setup-reactiveresume-only.sh
└── scripts/docker/docker-compose-reactiveresume-only.yml

Docker Only:
└── scripts/docker/docker-compose-reactiveresume-only.yml
```

### **🤖 Skyvern ONLY:**
```
Docker Setup:
└── docker-compose.skyvern.yml (existing, works standalone)

Server Addition:
└── Use docker-compose.skyvern.yml to add to existing ReactiveResume
```

### **💪 ReactiveResume + Skyvern (Complete Stack):**
```
Local Development:
├── start-local.ps1 -Full
└── scripts/development/local-setup-complete-stack.ps1

Server Production:
├── deploy-server.sh (default mode)
├── scripts/production/server-setup-complete-stack.sh
└── scripts/docker/docker-compose-complete-stack.yml

Legacy (Current):
└── scripts/legacy/start-complete-system.ps1 (your current approach)
```

---

## 🎯 **Recommended Usage Matrix:**

| Scenario | Script | Components | Database | RAM | Terminal |
|----------|--------|------------|----------|-----|----------|
| **Quick Development** | `start-local.ps1` | ReactiveResume only | SQLite | ~2GB | Free |
| **Full Local Testing** | `start-local.ps1 -Full` | Everything | SQLite+Docker | ~8GB | Free |
| **Simple Server** | `deploy-server.sh --lite` | ReactiveResume only | Docker PostgreSQL | ~6GB | Free |
| **Production Server** | `deploy-server.sh` | Complete automation | Docker PostgreSQL | ~18GB | Free |
| **Add Automation** | `docker-compose.skyvern.yml` | Skyvern only | Docker PostgreSQL | ~4GB | Free |

---

## 🔄 **Process Management:**

### **✅ All Scripts Run in Background:**
- **Local**: PowerShell background jobs + Docker detached
- **Server**: PM2 process management + Docker detached  
- **Result**: Terminal always stays free for other commands

### **✅ Easy Management Commands:**
```bash
# Check status
pm2 status              # Server Node.js processes
docker ps               # All Docker containers
.\start-local.ps1 -Status   # Local Windows services

# Restart services
pm2 restart all         # Server Node.js
docker-compose restart  # Docker services
.\start-local.ps1 -Restart  # Local restart
```

---

## 💡 **Recommendations:**

### **Keep These Scripts:**
- ✅ **Root launchers** (start-local.ps1, deploy-server.sh)
- ✅ **Organized scripts** (all in scripts/ subdirectories)
- ✅ **docker-compose.skyvern.yml** (useful for adding automation)

### **Consider Removing:**
- ❓ **unified-docker-compose.yml** (duplicate of scripts/docker/ version)
- ❓ **self-hosted-infrastructure.yml** (may be obsolete)

### **Your Current Workflow:**
- **Development**: Use `start-local.ps1` (replaces your current setup)
- **Server**: Use `deploy-server.sh` (complete automation empire)
- **Automation only**: Use `docker-compose.skyvern.yml`

**This organization gives you clean, one-command deployment for any scenario!** 🎯

Which deployment scenario are you most interested in testing first?
