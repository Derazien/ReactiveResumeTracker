# 🤖 Ollama Multi-Model Deployment Guide

**Last Updated**: 2025-01-27  
**Purpose**: Deploy and manage multiple Ollama models for ReactiveResumeTracker and Skyvern  
**Related**: [LLM_SETUP.md](../LLM_SETUP.md) — General LLM configuration guide

---

## 🎯 Overview

This guide covers deploying multiple Ollama models that can be used simultaneously by:
1. **ReactiveResumeTracker** - For job analysis, content matching, and resume generation
2. **Skyvern** - For browser automation and intelligent web scraping

### Why Multiple Models?

- **Primary Model** (qwen2.5:7b-instruct): Best for instruction-following and structured tasks
- **Backup Model** (qwen2.5:3b-instruct): Faster responses for simple tasks

**Note**: We use the **instruct** versions as they are better at following specific instructions and producing structured output, which is ideal for job analysis and resume generation.

---

## 📋 Prerequisites

### System Requirements

- **RAM**: Minimum 16GB (8GB for 7B models, 4GB for 3B models)
- **Disk Space**: ~10GB for all models
- **Docker**: Docker and Docker Compose installed
- **Network**: Good internet connection for initial download

### Required Setup

1. **Ollama Container Running**:
   ```bash
   docker compose -f unified-docker-compose.yml up -d ollama
   ```

2. **Verify Ollama is Running**:
   ```bash
   docker ps | grep ollama
   curl http://localhost:11434/api/tags
   ```

---

## 🚀 Quick Start

### Option 1: Install All Recommended Models (Recommended)

```bash
# On server
cd /opt/reactive-resume
chmod +x scripts/production/setup-ollama-models.sh
./scripts/production/setup-ollama-models.sh
```

This installs:
- `qwen2.5:7b-instruct` (Primary model - ~4.7GB)
- `qwen2.5:3b-instruct` (Backup model - ~2GB)

**Time**: ~10-15 minutes depending on connection

### Option 2: Minimal Install (Fastest)

```bash
# Install only primary model
./scripts/production/setup-ollama-models.sh --minimal
```

This installs only:
- `qwen2.5:7b-instruct` (Primary model - ~4.7GB)

**Time**: ~5-10 minutes

---

## 🔧 Configuration

### 1. ReactiveResumeTracker Configuration

Add to your `.env` file:

```bash
# Ollama Local LLM Configuration
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
LOCAL_LLM_API_KEY=                           # Optional for Ollama

# Alternative: Switch to backup model for faster responses
# LOCAL_LLM_MODEL=qwen2.5:3b-instruct
```

**After updating `.env`**:
```bash
# Restart the application
pm2 restart reactive_resume_dev
```

### 2. Skyvern Configuration

Skyvern can share the same Ollama instance.

#### Option A: Using Docker Network (Recommended if Skyvern is in Docker)

Add to `skyvern/docker-compose.yml` or `skyvern/.env`:

```yaml
environment:
  # Use Ollama through Docker network
  OPENAI_API_BASE: http://ollama:11434/v1
  OPENAI_API_KEY: ollama                    # Any value works
  OPENAI_MODEL: qwen2.5:7b-instruct
```

#### Option B: Using localhost (If Skyvern runs outside Docker)

```bash
# In skyvern/.env
OPENAI_API_BASE=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OPENAI_MODEL=qwen2.5:7b-instruct
```

---

## 🎛️ Model Management

### List Installed Models

```bash
./scripts/production/setup-ollama-models.sh --list
```

Output:
```
📋 Installed Ollama Models:

NAME                         ID              SIZE      MODIFIED
qwen2.5:7b-instruct         9e9c82a1ec90    4.7 GB    2 hours ago
qwen2.5:3b-instruct         5f8ae51e9a21    2.0 GB    2 hours ago
```

### Remove a Model

```bash
# Remove backup model to free space
./scripts/production/setup-ollama-models.sh --remove qwen2.5:3b-instruct

# Remove old base models (if you had them)
./scripts/production/setup-ollama-models.sh --remove qwen2.5:7b
./scripts/production/setup-ollama-models.sh --remove qwen2.5:3b
```

### Add a Model Later

```bash
# Manually pull a model
docker exec ollama ollama pull qwen2.5:7b-instruct

# Or reinstall all
./scripts/production/setup-ollama-models.sh
```

### Update Models

```bash
# Pull latest version of a model
docker exec ollama ollama pull qwen2.5:7b-instruct

# Or remove and reinstall all
./scripts/production/setup-ollama-models.sh --remove qwen2.5:7b-instruct
./scripts/production/setup-ollama-models.sh --remove qwen2.5:3b-instruct
./scripts/production/setup-ollama-models.sh
```

---

## 💡 Model Selection Guide

### When to Use Each Model

| Model | Use Case | Speed | Quality | Memory |
|-------|----------|-------|---------|--------|
| `qwen2.5:7b-instruct` | Job analysis, resume generation, content matching | Fast | High | 8GB |
| `qwen2.5:3b-instruct` | Quick responses, simple queries, testing | Very Fast | Good | 4GB |

### Recommended Configurations

**For Production** (Best Performance):
```bash
LOCAL_LLM_MODEL=qwen2.5:7b-instruct
```

**For Development** (Faster Iteration):
```bash
LOCAL_LLM_MODEL=qwen2.5:3b-instruct
```

### Why Instruct Models?

The **-instruct** versions are specifically fine-tuned for:
- ✅ Following specific instructions and constraints
- ✅ Producing structured output (JSON, lists, tables)
- ✅ Better at task-oriented requests
- ✅ More predictable and consistent responses
- ✅ Ideal for job analysis, content extraction, and resume generation

### Switching Models

You can switch models by updating the configuration:

```bash
# ReactiveResumeTracker (.env)
LOCAL_LLM_MODEL=qwen2.5:3b-instruct      # Use backup model

# Skyvern (.env or docker-compose)
OPENAI_MODEL=qwen2.5:3b-instruct         # Use backup model
```

**Restart services after changing**:
```bash
pm2 restart reactive_resume_dev
# Or for Skyvern
docker compose -f skyvern-docker-compose.yml restart
```

---

## 🔌 API Usage

### Ollama API Endpoint

Ollama exposes an OpenAI-compatible API at:
```
http://localhost:11434/v1
```

### Direct API Testing

```bash
# List available models
curl http://localhost:11434/api/tags

# Generate completion
curl http://localhost:11434/api/generate -d '{
  "model": "qwen2.5:7b-instruct",
  "prompt": "Analyze this job posting: Software Engineer..."
}'

# Chat completion (OpenAI-compatible)
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "qwen2.5:7b-instruct",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}'
```

### Using with ReactiveResumeTracker

The application automatically uses Ollama when configured:

```bash
# Test through the application API
curl http://localhost:3000/api/job-applications/analyze-from-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jobText": "Software Engineer position...",
    "url": "https://linkedin.com/jobs/123"
  }'
```

---

## 🐳 Docker Integration

### Ollama Container Configuration

From `unified-docker-compose.yml`:

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: ollama
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  restart: unless-stopped
```

### Container Commands

```bash
# Start Ollama
docker compose -f unified-docker-compose.yml up -d ollama

# Stop Ollama
docker compose -f unified-docker-compose.yml stop ollama

# View logs
docker logs ollama

# Execute commands inside container
docker exec ollama ollama list
docker exec ollama ollama run qwen2.5:7b "Hello!"

# Access container shell
docker exec -it ollama bash
```

### Network Access

**From other Docker containers**:
- Use hostname: `ollama`
- URL: `http://ollama:11434`

**From host machine**:
- Use localhost: `localhost`
- URL: `http://localhost:11434`

---

## 🚨 Troubleshooting

### Model Download Fails

**Problem**: Download interrupted or fails

**Solution**:
```bash
# Clear partial downloads
docker exec ollama rm -rf /root/.ollama/downloads/*

# Try pulling manually
docker exec ollama ollama pull qwen2.5:7b

# Check disk space
df -h
```

### Out of Memory

**Problem**: System runs out of RAM when loading models

**Solution**:
```bash
# Use smaller model
LOCAL_LLM_MODEL=qwen2.5:3b

# Or add swap space (Linux)
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Model Not Responding

**Problem**: Model loaded but not responding

**Solution**:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama container
docker compose -f unified-docker-compose.yml restart ollama

# Check logs
docker logs ollama --tail 100

# Test model directly
docker exec ollama ollama run qwen2.5:7b "test"
```

### Connection Refused

**Problem**: Cannot connect to Ollama API

**Solution**:
```bash
# Check if container is running
docker ps | grep ollama

# Check port mapping
docker port ollama

# Check firewall (if remote access)
sudo ufw allow 11434/tcp

# Verify .env configuration
grep LOCAL_LLM .env
```

### Performance Issues

**Problem**: Models running slowly

**Solution**:
1. **Use smaller model**: Switch to `qwen2.5:3b`
2. **Close other applications**: Free up RAM
3. **Check CPU usage**: `top` or `htop`
4. **Enable GPU** (if available):
   ```yaml
   # In docker-compose.yml
   ollama:
     deploy:
       resources:
         reservations:
           devices:
             - driver: nvidia
               count: 1
               capabilities: [gpu]
   ```

---

## 📊 Monitoring

### Check Resource Usage

```bash
# Container stats
docker stats ollama

# Memory usage
docker exec ollama ps aux | grep ollama

# Disk usage
docker exec ollama du -sh /root/.ollama/*
```

### Health Check

```bash
# Test API health
curl http://localhost:11434/api/tags

# Test model response
time docker exec ollama ollama run qwen2.5:7b "Say hello in one word"

# Check container logs
docker logs ollama --tail 50 --follow
```

---

## 🔄 Integration with Deployment Scripts

### Adding to Server Deployment

Update `scripts/production/deploy-server-dev.sh` to include Ollama setup:

```bash
# After Docker services are started
echo "Setting up Ollama models..."
./scripts/production/setup-ollama-models.sh --minimal

# Or add as a separate step
echo "Ollama setup complete. To install models:"
echo "  ./scripts/production/setup-ollama-models.sh"
```

### Automated Setup

For fully automated deployment, add to your CI/CD pipeline:

```bash
# In your deployment script
docker compose -f unified-docker-compose.yml up -d ollama
sleep 10  # Wait for Ollama to start
./scripts/production/setup-ollama-models.sh --minimal
```

---

## 📖 Best Practices

### 1. Model Selection
- Start with `qwen2.5:7b` for best quality
- Use `qwen2.5:3b` for faster responses in development
- Only install coder model if needed for technical tasks

### 2. Resource Management
- Monitor RAM usage regularly
- Remove unused models to free disk space
- Use swap space on memory-constrained systems

### 3. Configuration
- Keep model name consistent in `.env` files
- Document which model is used in production
- Test model changes in development first

### 4. Monitoring
- Check Ollama logs for errors
- Monitor response times
- Track memory usage over time

### 5. Updates
- Periodically update models for improvements
- Test new models before deploying to production
- Keep backup of working model version

---

## 🔗 Related Documentation

- [LLM_SETUP.md](../LLM_SETUP.md) — General LLM configuration
- [Project-Overview.md](00-foundation/Project-Overview.md) — System architecture
- [Docker-Services.md](50-ops/Docker-Services.md) — Docker configuration
- [Phase-E-Server-Deployment-Guide.md](50-ops/Phase-E-Server-Deployment-Guide.md) — Deployment guide

---

## 💬 Getting Help

**Model not working?**
1. Check logs: `docker logs ollama`
2. Test API: `curl http://localhost:11434/api/tags`
3. Restart container: `docker compose restart ollama`

**Out of space?**
1. List models: `./scripts/production/setup-ollama-models.sh --list`
2. Remove unused: `./scripts/production/setup-ollama-models.sh --remove MODEL_NAME`

**Performance issues?**
1. Switch to smaller model: `LOCAL_LLM_MODEL=qwen2.5:3b`
2. Check RAM: `docker stats ollama`
3. Monitor logs: `docker logs ollama --follow`

---

**Last Updated**: 2025-01-27  
**Maintained By**: ReactiveResumeTracker Team

