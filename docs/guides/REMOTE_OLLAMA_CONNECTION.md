# 🔗 Connecting to Remote Ollama from Windows

## 🎯 Overview

This guide shows how to connect your local Windows development environment to the Ollama instance running on your remote server (`66.96.83.44`).

---

## 🚀 Quick Setup

### Step 1: Configure SSH Tunnel (Recommended for Security)

The safest way is to use an SSH tunnel to access the remote Ollama:

```powershell
# Open PowerShell and create SSH tunnel
# This forwards local port 11434 to remote Ollama
ssh -L 11434:localhost:11434 root@66.96.83.44

# Keep this terminal open while testing
# Password: LfqWw4C5Wm
```

**What this does:**
- Creates a secure tunnel from your Windows machine to the server
- Maps `localhost:11434` on Windows → `localhost:11434` on server
- All traffic is encrypted through SSH

### Step 2: Test the Connection

Open a **new** PowerShell window (keep SSH tunnel running):

```powershell
# Test if Ollama API is accessible
curl http://localhost:11434/api/tags

# You should see JSON response with installed models
```

### Step 3: Configure Your Local .env

Update your local `.env` file to use the tunneled connection:

```bash
# Local LLM Configuration (via SSH tunnel)
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
LOCAL_LLM_API_KEY=
```

### Step 4: Test from ReactiveResumeTracker

```powershell
# Start your local dev environment
.\scripts\win\start-local.ps1

# Or just the backend
pnpm start:dev

# Test the LLM integration through your app
# Navigate to job applications and try analyzing a job posting
```

---

## 🔧 Alternative Methods

### Method 2: Direct Connection (Less Secure)

If you want to skip the SSH tunnel (not recommended for production):

#### On Server:
```bash
# Allow Ollama to accept external connections
docker compose -f unified-docker-compose.yml down ollama

# Edit unified-docker-compose.yml to expose Ollama
# Change:
#   ports:
#     - "11434:11434"
# To:
#   ports:
#     - "0.0.0.0:11434:11434"

docker compose -f unified-docker-compose.yml up -d ollama

# Open firewall (if needed)
sudo ufw allow 11434/tcp
```

#### On Windows:
```bash
# In your .env
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://66.96.83.44:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
```

**⚠️ Security Warning:**
- This exposes Ollama to the internet
- Anyone can use your models if they know your IP
- Use SSH tunnel instead for security

### Method 3: PowerShell Script for SSH Tunnel

Create a convenient script: `scripts/win/connect-remote-ollama.ps1`

```powershell
# Connect to Remote Ollama via SSH Tunnel
# Keep this window open while developing

$serverIP = "66.96.83.44"
$serverUser = "root"
$localPort = 11434
$remotePort = 11434

Write-Host "🔗 Connecting to remote Ollama on $serverIP..." -ForegroundColor Cyan
Write-Host "   Local: http://localhost:$localPort" -ForegroundColor Green
Write-Host "   Remote: $serverIP:$remotePort" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Keep this window open while using remote Ollama" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C to disconnect" -ForegroundColor Gray
Write-Host ""

# Create SSH tunnel
ssh -L ${localPort}:localhost:${remotePort} ${serverUser}@${serverIP}
```

Usage:
```powershell
# In one terminal
.\scripts\win\connect-remote-ollama.ps1

# In another terminal, start your app
.\scripts\win\start-local.ps1
```

---

## 🧪 Testing the Connection

### Test 1: Check API Availability

```powershell
# List available models
curl http://localhost:11434/api/tags | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Should show: qwen2.5:7b-instruct, qwen2.5:3b-instruct, etc.
```

### Test 2: Generate Text

```powershell
# Test text generation
$body = @{
    model = "qwen2.5:7b-instruct"
    prompt = "Say hello in one word"
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Test 3: OpenAI-Compatible Endpoint

```powershell
# Test OpenAI-compatible API
$body = @{
    model = "qwen2.5:7b-instruct"
    messages = @(
        @{
            role = "user"
            content = "Hello!"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:11434/v1/chat/completions" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Test 4: Through Your Application

```powershell
# Start local dev environment
.\scripts\win\start-local.ps1

# Navigate to: http://localhost:5173/dashboard/job-applications
# Click "New Application" → Paste a job URL
# Check if job analysis works (uses LLM)
```

---

## 📊 Monitoring Remote Ollama

### Check Server Logs

```powershell
# SSH into server
ssh root@66.96.83.44

# View Ollama logs
docker logs ollama --tail 100 --follow

# Check which model is loaded
docker exec ollama ps aux | grep ollama
```

### Monitor Resource Usage

```powershell
# On server
ssh root@66.96.83.44 "docker stats ollama --no-stream"

# Should show memory and CPU usage
```

---

## ⚡ Performance Considerations

### Latency
- **SSH Tunnel**: Adds ~1-5ms overhead (negligible)
- **Network Latency**: Depends on your connection to server
- **Model Response**: Same as if running locally

### Bandwidth
- **Request**: ~1-10 KB (text input)
- **Response**: ~1-50 KB (text output)
- **Streaming**: More efficient for real-time responses

### Tips for Better Performance
1. **Use SSH Compression**: `ssh -C -L 11434:localhost:11434 root@66.96.83.44`
2. **Keep Tunnel Alive**: Use `ServerAliveInterval=60` in SSH config
3. **Use Smaller Model**: `LOCAL_LLM_MODEL=qwen2.5:3b-instruct` for faster responses

---

## 🔒 Security Best Practices

### 1. Always Use SSH Tunnel
```powershell
# ✅ Secure - through SSH tunnel
LOCAL_LLM_BASE_URL=http://localhost:11434

# ❌ Insecure - direct connection
LOCAL_LLM_BASE_URL=http://66.96.83.44:11434
```

### 2. Configure SSH Keys (Optional but Recommended)

```powershell
# Generate SSH key on Windows
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy to server
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@66.96.83.44 "cat >> ~/.ssh/authorized_keys"

# Now you can connect without password
ssh -L 11434:localhost:11434 root@66.96.83.44
```

### 3. Create SSH Config for Easy Connection

Create/edit `~/.ssh/config`:

```
Host reactive-resume
    HostName 66.96.83.44
    User root
    LocalForward 11434 localhost:11434
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Then connect with:
```powershell
ssh reactive-resume
# Automatically creates tunnel!
```

---

## 🐛 Troubleshooting

### Issue: "Connection Refused"

**Cause**: SSH tunnel not established or Ollama not running on server

**Solution**:
```powershell
# 1. Check if SSH tunnel is active
netstat -an | findstr "11434"
# Should show: TCP    127.0.0.1:11434    0.0.0.0:0    LISTENING

# 2. SSH into server and check Ollama
ssh root@66.96.83.44 "docker ps | grep ollama"

# 3. Restart Ollama if needed
ssh root@66.96.83.44 "docker compose -f /opt/reactive-resume/unified-docker-compose.yml restart ollama"
```

### Issue: "Tunnel Keeps Disconnecting"

**Solution**: Add keepalive to SSH tunnel
```powershell
# Use these flags
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -L 11434:localhost:11434 root@66.96.83.44
```

### Issue: "Slow Responses"

**Cause**: Network latency or server under load

**Solution**:
```powershell
# 1. Test network latency
ping 66.96.83.44

# 2. Check server resources
ssh root@66.96.83.44 "docker stats ollama --no-stream"

# 3. Switch to faster model
LOCAL_LLM_MODEL=qwen2.5:3b-instruct
```

### Issue: "Model Not Found"

**Cause**: Specified model not installed on server

**Solution**:
```powershell
# 1. Check available models
curl http://localhost:11434/api/tags

# 2. Install missing model on server
ssh root@66.96.83.44 "cd /opt/reactive-resume && ./scripts/production/setup-ollama-models.sh"
```

---

## 🎯 Development Workflow

### Recommended Setup

**Terminal 1**: SSH Tunnel (keep running)
```powershell
ssh -L 11434:localhost:11434 root@66.96.83.44
```

**Terminal 2**: Local Development
```powershell
.\scripts\win\start-local.ps1
```

**Your .env**:
```bash
# Remote Ollama via SSH tunnel
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct

# Local PostgreSQL (Docker)
DATABASE_URL=postgresql://reactive_resume:reactive_resume_2024@localhost:5432/reactive_resume?schema=public&sslmode=disable

# Local services (Docker)
REDIS_URL=redis://localhost:6379
STORAGE_URL=http://localhost:9000
CHROME_URL=ws://localhost:3001
```

### Alternative: Use Cloud LLM for Local Dev

If SSH tunnel is inconvenient:

```bash
# Use Anthropic for local development
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Use Ollama on server for production
# (configured in server's .env)
```

---

## 📝 Quick Reference

### Connect to Remote Ollama
```powershell
# Create SSH tunnel
ssh -L 11434:localhost:11434 root@66.96.83.44
```

### Test Connection
```powershell
curl http://localhost:11434/api/tags
```

### Configure App
```bash
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
```

### Check Server
```powershell
ssh root@66.96.83.44 "docker logs ollama --tail 50"
```

---

## ✅ Verification Checklist

- [ ] SSH tunnel created: `ssh -L 11434:localhost:11434 root@66.96.83.44`
- [ ] API accessible: `curl http://localhost:11434/api/tags`
- [ ] Models listed: qwen2.5:7b-instruct, qwen2.5:3b-instruct, etc.
- [ ] Local .env updated with `LOCAL_LLM_BASE_URL=http://localhost:11434`
- [ ] Application started: `.\scripts\win\start-local.ps1`
- [ ] Test job analysis works in UI
- [ ] SSH tunnel stable (no disconnects)

---

**You're now connected to remote Ollama from Windows!** 🎉

This setup gives you:
- ✅ Secure connection through SSH
- ✅ No firewall changes needed on server
- ✅ Local development with remote models
- ✅ No API costs
- ✅ Same performance as cloud LLMs

