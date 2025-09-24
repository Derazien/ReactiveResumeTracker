# 🔧 Skyvern Setup & Troubleshooting Guide

## 🎯 **Technical Setup Overview**

This guide covers the technical setup, configuration, and troubleshooting for the Skyvern automation engine integrated with ReactiveResumeTracker.

## 🏗️ **System Architecture**

### **Component Overview**
```
ReactiveResumeTracker (Your Main App)
├── Frontend: React (localhost:5173)
├── Backend: NestJS (localhost:3000)  
├── PDF Service: (localhost:5174)
└── Integration: AutomationIntegrationController

Skyvern Automation Engine (Separate System)
├── API: FastAPI (localhost:8000)
├── UI: React (localhost:8081)
├── PostgreSQL: (localhost:5433)
├── Redis: (localhost:6380)
└── Data: ./services/skyvern/automation-data/
```

### **Communication Flow**
1. **User Action**: Clicks automation in ReactiveResume UI
2. **API Call**: ReactiveResume → Skyvern API (localhost:8000)
3. **Automation**: Skyvern performs browser automation
4. **Webhook**: Skyvern → ReactiveResume (job data)
5. **Processing**: ReactiveResume processes and stores results

## 🚀 **Initial Setup**

### **Prerequisites**
- ✅ Docker Desktop installed and running
- ✅ ReactiveResumeTracker working (run `./setup.ps1` first)
- ✅ Anthropic API key configured in `.env`

### **Quick Setup**
```powershell
# Start complete system (this should work out of the box)
.\start-complete-system.ps1
```

### **Manual Setup (if needed)**
```powershell
# Start just the automation services
docker-compose -f docker-compose.skyvern.yml up -d

# Check status
docker ps --filter name=skyvern
```

## 🔑 **API Key Configuration**

### **Get Skyvern API Key**

#### **Method 1: From Skyvern UI (Recommended)**
1. **Start Skyvern**: `docker-compose -f docker-compose.skyvern.yml up -d`
2. **Open UI**: http://localhost:8081
3. **Create Account**: Register or login
4. **Get API Key**: Settings → API Key → Copy

#### **Method 2: From Container Logs**
```powershell
# Check container logs for auto-generated key
docker logs skyvern-api | findstr "API"
```

### **Configure API Key**
Add to your `.env` file:
```bash
SKYVERN_API_KEY=your_api_key_here
```

### **Verify Configuration**
```powershell
# Restart to apply new API key
.\start-complete-system.ps1

# Test API connection
curl http://localhost:3000/api/automation/status
```

## 🐳 **Docker Configuration**

### **Docker Compose Structure**
The `docker-compose.skyvern.yml` file defines:
- **skyvern-postgres**: Database (port 5433)
- **skyvern-redis**: Cache (port 6380)  
- **skyvern**: Main API service (port 8000)
- **skyvern-ui**: Web interface (port 8081)

### **Volume Mappings**
```yaml
volumes:
  - ./services/skyvern/automation-data/artifacts:/data/artifacts
  - ./services/skyvern/automation-data/videos:/data/videos
  - ./services/skyvern/automation-data/har:/data/har
  - ./services/skyvern/automation-data/log:/data/log
```

### **Environment Variables**
```yaml
environment:
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
  - SKYVERN_API_KEY=${SKYVERN_API_KEY}
  - DATABASE_STRING=postgresql+psycopg://skyvern:skyvern@skyvern-postgres:5432/skyvern
  - REDIS_URL=redis://skyvern-redis:6379
```

## 🛠️ **Common Issues & Solutions**

### **Issue 1: "Automation Unavailable"**

#### **Symptoms**
- Automation card shows "Unavailable" status
- Red status badge in UI
- Error messages in browser console

#### **Diagnosis**
```powershell
# Check if Docker services are running
docker ps --filter name=skyvern

# Should see 4 containers: skyvern-api, skyvern-ui, skyvern-postgres, skyvern-redis
```

#### **Solutions**
```powershell
# Solution 1: Restart services
docker-compose -f docker-compose.skyvern.yml down
docker-compose -f docker-compose.skyvern.yml up -d

# Solution 2: Check Docker Desktop is running
# Start Docker Desktop if not running

# Solution 3: Check port conflicts
netstat -an | findstr "8000 8081 5433 6380"
# If ports are in use, stop conflicting services
```

### **Issue 2: "Invalid API Key" Errors**

#### **Symptoms**
- HTTP 401 errors in logs
- "Invalid credentials" messages
- Automation starts but fails immediately

#### **Diagnosis**
```powershell
# Check if API key is set
Get-Content .env | Select-String "SKYVERN_API_KEY"

# Test API key directly
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8000/api/v1/tasks
```

#### **Solutions**
1. **Get valid API key** from http://localhost:8081
2. **Update .env file** with correct key
3. **Restart system** to apply changes

### **Issue 3: Skyvern UI Not Accessible**

#### **Symptoms**
- http://localhost:8081 not responding
- "Connection refused" errors
- UI container not starting

#### **Diagnosis**
```powershell
# Check UI container status
docker ps --filter name=skyvern-ui

# Check UI container logs
docker logs skyvern-ui --tail 20
```

#### **Solutions**
```powershell
# Solution 1: Check for missing secrets file
# Create if missing:
mkdir -p services/skyvern/automation-data/.streamlit
echo 'cred = "your_api_key_here"' > services/skyvern/automation-data/.streamlit/secrets.toml

# Solution 2: Restart UI container
docker restart skyvern-ui

# Solution 3: Check volume mappings in docker-compose.skyvern.yml
```

### **Issue 4: LinkedIn Login Loops**

#### **Symptoms**
- Automation gets stuck at LinkedIn login
- "Login required" messages repeatedly
- Browser automation pauses indefinitely

#### **Solutions**
1. **Manual Login**:
   - Open http://localhost:8081
   - Complete LinkedIn login in browser view
   - Wait for automation to continue

2. **Session Persistence**:
   - Login session should persist between runs
   - May need periodic re-authentication

3. **Clear Browser Data**:
   ```powershell
   # Stop automation
   docker-compose -f docker-compose.skyvern.yml down
   
   # Clear browser data
   Remove-Item services/skyvern/automation-data/* -Recurse -Force
   
   # Restart
   docker-compose -f docker-compose.skyvern.yml up -d
   ```

### **Issue 5: Rate Limiting (Anthropic)**

#### **Symptoms**
- "Rate limit exceeded" errors
- Automation fails with API errors
- Long delays between actions

#### **Solutions**
1. **Wait and Retry**: Rate limits reset over time
2. **Upgrade Plan**: Increase Anthropic API limits
3. **Switch Provider**: Use OpenAI instead:
   ```bash
   # In .env file
   OPENAI_API_KEY=your_openai_key
   # Update Skyvern config to use OpenAI
   ```

## 📊 **Monitoring & Debugging**

### **Health Checks**
```powershell
# Check all services status
curl http://localhost:3000/api/automation/status

# Check Skyvern API directly
curl http://localhost:8000/docs

# Check database connectivity
docker exec skyvern-postgres pg_isready -U skyvern
```

### **Log Analysis**
```powershell
# ReactiveResume backend logs
# Check terminal where you ran start-complete-system.ps1

# Skyvern API logs
docker logs skyvern-api --tail 50

# Skyvern UI logs  
docker logs skyvern-ui --tail 20

# Database logs
docker logs skyvern-postgres --tail 20
```

### **Data Inspection**
```powershell
# Check automation artifacts
ls services/skyvern/automation-data/artifacts/

# Check videos of automation runs
ls services/skyvern/automation-data/videos/

# Check HAR files (network requests)
ls services/skyvern/automation-data/har/
```

## 🔧 **Advanced Configuration**

### **Custom Browser Settings**
Edit `docker-compose.skyvern.yml`:
```yaml
environment:
  - BROWSER_TYPE=chromium-headful  # or chromium-headless
  - ENABLE_CODE_BLOCK=true
  - CHROME_IGNORE_HTTPS_ERRORS=false
```

### **Database Configuration**
```yaml
environment:
  - DATABASE_STRING=postgresql+psycopg://skyvern:skyvern@skyvern-postgres:5432/skyvern
  - POSTGRES_USER=skyvern
  - POSTGRES_PASSWORD=skyvern
  - POSTGRES_DB=skyvern
```

### **LLM Provider Configuration**
```yaml
# Anthropic (default)
environment:
  - ENABLE_ANTHROPIC=true
  - LLM_KEY=ANTHROPIC_CLAUDE3.5_HAIKU
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

# OpenAI (alternative)
environment:
  - ENABLE_OPENAI=true
  - LLM_KEY=OPENAI_GPT4O
  - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## 🧪 **Testing & Validation**

### **System Test**
```powershell
# Run integration test
.\test-integration.ps1

# Manual test steps:
# 1. Visit http://localhost:5173/dashboard/job-applications
# 2. Click automation card
# 3. Try LinkedIn automation with 1-2 jobs
# 4. Monitor in Skyvern UI: http://localhost:8081
```

### **API Test**
```powershell
# Test automation endpoint
curl -X POST http://localhost:3000/api/automation/status

# Test Skyvern API directly
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8000/api/v1/tasks
```

## 📋 **Maintenance**

### **Regular Cleanup**
```powershell
# Clean old artifacts (weekly)
Remove-Item services/skyvern/automation-data/artifacts/* -Recurse -Force -Confirm:$false

# Clean old videos (weekly)  
Remove-Item services/skyvern/automation-data/videos/* -Recurse -Force -Confirm:$false

# Clean Docker images (monthly)
docker system prune -f
```

### **Updates**
```powershell
# Update Skyvern images
docker-compose -f docker-compose.skyvern.yml pull
docker-compose -f docker-compose.skyvern.yml up -d
```

## 🆘 **Getting Help**

### **Debug Checklist**
1. ✅ Docker Desktop running?
2. ✅ All 4 containers running? (`docker ps`)
3. ✅ API key configured in .env?
4. ✅ Ports 8000, 8081 accessible?
5. ✅ No firewall blocking connections?

### **Support Resources**
- **Skyvern Documentation**: https://docs.skyvern.com
- **Docker Issues**: Check Docker Desktop status
- **API Issues**: Review Skyvern logs
- **Integration Issues**: Check ReactiveResume backend logs

## 📚 **Related Documentation**

- **🚀 Quick Start**: `docs/automation/QUICKSTART.md` - Complete setup and usage guide
- **📋 LinkedIn Automation**: `docs/automation/LINKEDIN_AUTOMATION.md` - Comprehensive LinkedIn workflow guide
- **🏗️ System Architecture**: `docs/automation/SYSTEM_ARCHITECTURE_ANALYSIS.md` - Complete technical analysis
- **🌐 Skyvern Official Docs**: https://docs.skyvern.com - Official Skyvern documentation

Your automation system should now be fully operational! 🚀
