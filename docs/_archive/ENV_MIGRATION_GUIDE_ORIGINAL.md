# Environment Variables Migration Guide

## Skyvern External Service Refactor

**Date**: 2025-10-03  
**Status**: Required for all deployments

### What Changed

Skyvern is now treated as an **external service** instead of a bundled local service.

**Before**: Skyvern ran as part of `unified-docker-compose.yml`  
**After**: Skyvern runs separately and is accessed via HTTP API

### Required Environment Variables

Add these to your `.env` file:

```bash
# Skyvern Configuration (External Service)
SKYVERN_ENABLED=true                        # Enable/disable globally
SKYVERN_BASE_URL=http://localhost:8000     # Your Skyvern instance URL
SKYVERN_TIMEOUT_MS=30000                    # HTTP timeout (optional)
```

### Migration Steps

#### Option A: Run Skyvern Locally (Separate Instance)

1. **Stop existing Skyvern services**:
   ```bash
   docker compose down skyvern-postgres skyvern-redis skyvern skyvern-ui
   ```

2. **Start Skyvern independently**:
   ```bash
   # From services/skyvern/ directory
   cd services/skyvern
   docker compose up -d
   ```

3. **Update your `.env`**:
   ```bash
   SKYVERN_ENABLED=true
   SKYVERN_BASE_URL=http://localhost:8000
   ```

4. **Restart Reactive Resume**:
   ```bash
   docker compose up -d
   # Or: pnpm dev
   ```

#### Option B: Use Skyvern Cloud

1. **Sign up for Skyvern Cloud**: https://www.skyvern.com

2. **Update your `.env`**:
   ```bash
   SKYVERN_ENABLED=true
   SKYVERN_BASE_URL=https://api.skyvern.com
   ```

3. **Configure API Key in App**:
   - Log into Reactive Resume
   - Go to Settings → Automation
   - Enter your Skyvern Cloud API key

#### Option C: Deploy Skyvern to Remote Server

1. **Deploy Skyvern** to your server (see Skyvern docs)

2. **Update your `.env`**:
   ```bash
   SKYVERN_ENABLED=true
   SKYVERN_BASE_URL=https://skyvern.yourcompany.com
   ```

### Docker Compose Changes

Skyvern services are now **optional** via profiles:

```yaml
# Start ONLY Reactive Resume services (default)
docker compose up -d

# Start WITH Skyvern services (legacy mode)
docker compose --profile skyvern up -d
```

### User Settings

Users now configure their Skyvern API keys in **App Settings** → **Automation**, not in `.env`.

The server `.env` only controls:
- Whether Skyvern is enabled globally (`SKYVERN_ENABLED`)
- The default base URL (`SKYVERN_BASE_URL`)
- HTTP timeout (`SKYVERN_TIMEOUT_MS`)

### Verification

Test your setup:

```bash
# 1. Check server logs
pnpm dev
# Look for: "Skyvern client initialized: http://localhost:8000"

# 2. Test API connection
curl http://localhost:3000/api/automation/status

# 3. Test Skyvern health
curl http://localhost:8000/docs
```

### Troubleshooting

**Error: "Skyvern automation is not enabled"**  
→ Set `SKYVERN_ENABLED=true` in `.env`

**Error: "Failed to reach Skyvern"**  
→ Check `SKYVERN_BASE_URL` is correct and Skyvern is running

**Error: "Invalid API key"**  
→ User needs to configure their personal Skyvern API key in Settings

### Rollback (Emergency)

If you need to quickly rollback:

1. **Start Skyvern with profile**:
   ```bash
   docker compose --profile skyvern up -d
   ```

2. **Set in `.env`**:
   ```bash
   SKYVERN_ENABLED=true
   SKYVERN_BASE_URL=http://localhost:8000
   ```

This restores the old behavior temporarily.

### Benefits of New Approach

✅ **Decoupled**: Skyvern can run on different machine/cloud  
✅ **Scalable**: Run multiple Skyvern instances behind load balancer  
✅ **Flexible**: Use Skyvern Cloud or self-host  
✅ **Maintainable**: Skyvern updates don't require app restart  
✅ **Resource Efficient**: Only run Skyvern when needed

### Questions?

See full documentation:
- [Skyvern Official Docs](https://docs.skyvern.com/introduction)
- [Project Overview](./Project-Overview.md)
- [Docker Services](../50-ops/Docker-Services.md)


