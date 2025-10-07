# 🤖 Ollama Multi-Model Setup - Complete Guide

## 📋 Overview

This document provides a complete walkthrough for deploying multiple Ollama models that can be used by both **ReactiveResumeTracker** and **Skyvern** simultaneously.

---

## ✅ What Was Created

### 1. **Setup Script** (`scripts/production/setup-ollama-models.sh`)
A comprehensive bash script that:
- Installs multiple Ollama models (qwen2.5:7b, qwen2.5:3b, qwen2.5-coder:7b)
- Supports minimal, standard, and full installation modes
- Tests each model after installation
- Provides model management (list, remove, update)
- Displays configuration instructions

### 2. **Documentation** (`docs/50-ops/OLLAMA_DEPLOYMENT.md`)
Complete deployment guide covering:
- Prerequisites and system requirements
- Installation options (minimal, standard, full)
- Configuration for ReactiveResumeTracker and Skyvern
- Model selection guide and best practices
- API usage and Docker integration
- Troubleshooting and monitoring
- Resource management

### 3. **Integration Updates**
- Updated `deploy-server-dev.sh` to mention Ollama setup
- Updated `Run-Paths-Catalog.md` with new script entry
- Updated main `docs/README.md` to reference Ollama documentation

---

## 🚀 Quick Start Guide

### Step 1: Ensure Ollama Container is Running

```bash
# On your server
cd /opt/reactive-resume
docker compose -f unified-docker-compose.yml up -d ollama

# Verify it's running
docker ps | grep ollama
curl http://localhost:11434/api/tags
```

### Step 2: Run the Setup Script

#### Option A: Standard Installation (Recommended)
Installs primary + backup instruct models:
```bash
chmod +x scripts/production/setup-ollama-models.sh
./scripts/production/setup-ollama-models.sh
```

**Models installed:**
- `qwen2.5:7b-instruct` - Primary instruct model (~4.7GB) - Best for structured tasks
- `qwen2.5:3b-instruct` - Backup instruct model (~2GB) - Faster responses

**Time:** ~10-15 minutes  
**Disk Space:** ~7GB

#### Option B: Minimal Installation (Fastest)
Installs only primary instruct model:
```bash
./scripts/production/setup-ollama-models.sh --minimal
```

**Models installed:**
- `qwen2.5:7b-instruct` only

**Time:** ~5-10 minutes  
**Disk Space:** ~5GB

### Step 3: Configure ReactiveResumeTracker

Edit your `.env` file:
```bash
# Add these lines
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
LOCAL_LLM_API_KEY=                           # Optional for Ollama
```

Restart the application:
```bash
pm2 restart reactive_resume_dev
```

### Step 4: Configure Skyvern (Optional)

If you're using Skyvern, configure it to use the same Ollama instance.

#### If Skyvern is in Docker:
Add to `skyvern/docker-compose.yml`:
```yaml
environment:
  OPENAI_API_BASE: http://ollama:11434/v1
  OPENAI_API_KEY: ollama
  OPENAI_MODEL: qwen2.5:7b-instruct
```

#### If Skyvern runs outside Docker:
Add to `skyvern/.env`:
```bash
OPENAI_API_BASE=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=qwen2.5:7b-instruct
```

Restart Skyvern:
```bash
docker compose -f skyvern-docker-compose.yml restart
# Or if running locally
pm2 restart skyvern
```

---

## 🎯 Model Selection Guide

### Which Model to Use?

| Model | Best For | Speed | Quality | RAM |
|-------|----------|-------|---------|-----|
| **qwen2.5:7b-instruct** | Production, job analysis, resume generation, structured output | Fast | High | 8GB |
| **qwen2.5:3b-instruct** | Development, testing, quick responses | Very Fast | Good | 4GB |

### Recommended Configurations

**Production Setup:**
```bash
LOCAL_LLM_MODEL=qwen2.5:7b-instruct          # Best quality & instruction-following
```

**Development Setup:**
```bash
LOCAL_LLM_MODEL=qwen2.5:3b-instruct          # Faster iteration
```

---

## 🔄 Running Both Applications Simultaneously

Yes! Both ReactiveResumeTracker and Skyvern can use Ollama at the same time:

1. **Same Model**: Both can use the same model (e.g., `qwen2.5:7b-instruct`)
2. **Different Models**: Configure each to use different models:
   - ReactiveResume: `qwen2.5:7b-instruct` for quality
   - Skyvern: `qwen2.5:3b-instruct` for speed

**Why Instruct Models?**
- ✅ Better at following specific instructions
- ✅ More structured and predictable output
- ✅ Ideal for job analysis and data extraction
- ✅ Better JSON/structured format generation

**Example Configuration:**

ReactiveResume `.env`:
```bash
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
```

Skyvern `.env`:
```bash
OPENAI_MODEL=qwen2.5:3b-instruct              # Use faster model
```

**Network Configuration:**

Ollama container in `unified-docker-compose.yml`:
```yaml
ollama:
  image: ollama/ollama:latest
  container_name: ollama
  ports:
    - "11434:11434"                   # Accessible from host and containers
  volumes:
    - ollama_data:/root/.ollama
  restart: unless-stopped
  networks:
    - reactive_resume_network         # Shared network
```

---

## 📊 Management Commands

### List Installed Models
```bash
./scripts/production/setup-ollama-models.sh --list
```

### Remove a Model
```bash
# Free up space by removing backup model
./scripts/production/setup-ollama-models.sh --remove qwen2.5:3b

# Remove coder model
./scripts/production/setup-ollama-models.sh --remove qwen2.5-coder:7b
```

### Add Models Later
```bash
# Install coder model after initial setup
./scripts/production/setup-ollama-models.sh --with-coder
```

### Update Models
```bash
# Pull latest version
docker exec ollama ollama pull qwen2.5:7b
```

### Switch Between Models

Just update the configuration:
```bash
# ReactiveResume: Edit .env
LOCAL_LLM_MODEL=qwen2.5:3b           # Switch to backup model

# Restart
pm2 restart reactive_resume_dev
```

---

## 🧪 Testing the Setup

### Test Ollama API
```bash
# Check if Ollama is responding
curl http://localhost:11434/api/tags

# Test a model directly
docker exec ollama ollama run qwen2.5:7b "Say hello in one word"
```

### Test ReactiveResumeTracker Integration
```bash
# Check API health
curl http://localhost:3000/api/health

# Test LLM endpoint (requires auth token)
curl http://localhost:3000/api/job-applications/analyze-from-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobText": "Software Engineer position requiring JavaScript and React...",
    "url": "https://linkedin.com/jobs/123"
  }'
```

### Test Skyvern Integration
```bash
# Check Skyvern health
curl http://localhost:8000/health

# Models will be used automatically during automation tasks
```

---

## 📈 Resource Monitoring

### Check RAM Usage
```bash
# View container stats
docker stats ollama

# Check system memory
free -h
```

### Check Disk Usage
```bash
# Check model sizes
docker exec ollama du -sh /root/.ollama/*

# Check available space
df -h
```

### Monitor Performance
```bash
# Watch logs
docker logs ollama --follow

# Check response times
time docker exec ollama ollama run qwen2.5:7b "test"
```

---

## 🚨 Common Issues & Solutions

### Issue: Out of Memory
**Solution 1**: Use smaller model
```bash
LOCAL_LLM_MODEL=qwen2.5:3b
```

**Solution 2**: Add swap space
```bash
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Issue: Model Download Fails
**Solution**:
```bash
# Clear partial downloads
docker exec ollama rm -rf /root/.ollama/downloads/*

# Try again
docker exec ollama ollama pull qwen2.5:7b
```

### Issue: Cannot Connect to Ollama
**Solution**:
```bash
# Check if container is running
docker ps | grep ollama

# Restart if needed
docker compose -f unified-docker-compose.yml restart ollama

# Check logs
docker logs ollama --tail 50
```

### Issue: Slow Responses
**Solution**:
```bash
# Switch to faster model
LOCAL_LLM_MODEL=qwen2.5:3b

# Or check if multiple heavy tasks are running
docker stats
```

---

## 📝 Best Practices

1. **Start with Standard Installation**: Primary + backup models
2. **Monitor RAM Usage**: Keep an eye on memory consumption
3. **Test Before Production**: Verify model quality matches your needs
4. **Keep Models Updated**: Pull new versions periodically
5. **Document Configuration**: Keep track of which model is used where
6. **Remove Unused Models**: Free up disk space
7. **Use Smaller Models for Development**: Faster iteration
8. **Enable Logging**: Monitor Ollama logs for issues

---

## 🔗 Related Documentation

- **[OLLAMA_DEPLOYMENT.md](../docs/50-ops/OLLAMA_DEPLOYMENT.md)** — Detailed deployment guide
- **[LLM_SETUP.md](../docs/LLM_SETUP.md)** — General LLM configuration
- **[Run-Paths-Catalog.md](../docs/50-ops/Run-Paths-Catalog.md)** — All executable commands
- **[Docker-Services.md](../docs/50-ops/Docker-Services.md)** — Docker service configuration

---

## 📞 Need Help?

**Script Usage:**
```bash
./scripts/production/setup-ollama-models.sh --help
```

**Check Logs:**
```bash
docker logs ollama --tail 100
```

**Test Connection:**
```bash
curl http://localhost:11434/api/tags
```

**Monitor Resources:**
```bash
docker stats ollama
free -h
df -h
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Ollama container is running: `docker ps | grep ollama`
- [ ] Models are installed: `./scripts/production/setup-ollama-models.sh --list`
- [ ] API is responding: `curl http://localhost:11434/api/tags`
- [ ] ReactiveResume `.env` is configured with `LOCAL_LLM_MODEL`
- [ ] Application restarted: `pm2 restart reactive_resume_dev`
- [ ] Test endpoint works: Try analyzing a job posting
- [ ] (Optional) Skyvern configured and restarted
- [ ] System has sufficient RAM (check `free -h`)
- [ ] Disk space available (check `df -h`)

---

**Setup Complete!** 🎉

You now have multiple Ollama models deployed and ready to use by both ReactiveResumeTracker and Skyvern simultaneously.

