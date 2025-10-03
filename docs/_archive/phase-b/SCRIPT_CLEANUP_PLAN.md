# 🧹 Script Cleanup & Organization Plan

## 📊 **Current Script Analysis:**

### **🗑️ OBSOLETE SCRIPTS (DELETE):**
```bash
# Test scripts that are no longer needed
cleanup-test-data.js                    # Old test cleanup
test-api-key-debug.js                   # API debugging (obsolete)
test-automation-endpoints.js            # Endpoint testing (old)
test-integration.ps1                    # Integration testing (old)
test-workflow-editor.ps1                # Workflow testing (old)
test-workflow-simple.ps1                # Simple workflow test (old)
test-workflow-wpid440789045004028228.js # Specific workflow test (old)
workflow-editor-script.js               # Workflow editing (old)

# Obsolete deployment scripts
infrastructure-setup.sh                 # Replaced by organized scripts
simple-docker-deployment.sh             # Replaced by organized scripts
```

### **📁 SCRIPTS TO MOVE TO scripts/ DIRECTORY:**

#### **Production Scripts (scripts/production/):**
```bash
server-setup-reactiveresume-only.sh     # Lightweight server deployment
server-setup-complete-stack.sh          # Full automation server deployment
complete-database-import.js             # Database migration tool
export-current-database.js              # Database export tool
```

#### **Development Scripts (scripts/development/):**
```bash
local-setup-reactiveresume-only.ps1     # Lightweight local development
local-setup-complete-stack.ps1          # Full local automation stack
```

#### **Docker Configurations (scripts/docker/):**
```bash
docker-compose-reactiveresume-only.yml  # Lightweight Docker setup
docker-compose-complete-stack.yml       # Full Docker automation stack
docker-compose.skyvern.yml              # Skyvern-only setup (existing)
```

#### **Debug/Utility Scripts (scripts/debug/):**
```bash
setup-simple-vnc.ps1                    # VNC debugging setup
setup-vnc-access.ps1                    # VNC access configuration
setup-x11-forwarding.ps1                # X11 forwarding for debugging
```

### **🤔 LEGACY SCRIPTS (EVALUATE):**
```bash
setup.ps1 (29KB)                        # Large Windows setup - check if needed
setup.sh (13KB)                         # Linux setup - check if needed  
start-complete-system.ps1 (13KB)        # Current local startup - evaluate
```

---

## 🎯 **Recommended Actions:**

### **1. Delete Obsolete Scripts:**
- All `test-*` scripts (no longer needed)
- Old deployment scripts (replaced)
- Workflow debugging scripts (automation system handles this)

### **2. Organize scripts/ Directory Structure:**
```
scripts/
├── production/
│   ├── server-setup-reactiveresume-only.sh
│   ├── server-setup-complete-stack.sh
│   ├── complete-database-import.js
│   └── export-current-database.js
├── development/
│   ├── local-setup-reactiveresume-only.ps1
│   └── local-setup-complete-stack.ps1
├── docker/
│   ├── docker-compose-reactiveresume-only.yml
│   ├── docker-compose-complete-stack.yml
│   └── docker-compose.skyvern.yml
├── debug/
│   ├── setup-simple-vnc.ps1
│   ├── setup-vnc-access.ps1
│   └── setup-x11-forwarding.ps1
└── legacy/
    ├── setup.ps1 (if keeping for reference)
    ├── setup.sh (if keeping for reference)
    └── start-complete-system.ps1 (current local - evaluate)
```

### **3. Create Main Launcher Scripts:**
```bash
# In project root
start-local.ps1          # Wrapper for local development
start-server.sh          # Wrapper for server deployment
```

---

## 🔧 **Implementation Plan:**

### **Phase 1: Cleanup Obsolete Scripts**
- Delete all test-* scripts
- Delete obsolete deployment scripts
- Clean up home directory

### **Phase 2: Organize scripts/ Directory**  
- Create subdirectories
- Move scripts to appropriate locations
- Update any path references

### **Phase 3: Create Wrapper Scripts**
- Simple launchers in project root
- Easy deployment commands

### **Phase 4: Update Documentation**
- Update README with new script organization
- Create quick start guide

---

## 🎯 **Benefits After Cleanup:**

### **✅ Clean Project Root:**
- Only essential files visible
- No script clutter
- Professional appearance

### **✅ Organized scripts/ Directory:**
- Clear purpose for each script
- Easy to find the right script
- Separated by environment (local/server)

### **✅ Simplified Deployment:**
- One command for any scenario
- Clear documentation
- Easy maintenance

**Ready to execute this cleanup plan?** 🧹🚀
