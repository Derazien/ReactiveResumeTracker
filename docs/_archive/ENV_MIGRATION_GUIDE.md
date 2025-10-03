> **⚠️ ARCHIVED** (2025-10-03): This document has been merged into canonical documentation
>
> **See Instead**:
> - [Project Overview → External Services → Skyvern Integration](../00-foundation/Project-Overview.md#skyvern-integration-external-service) — Environment variables, configuration, deployment options
> - [Module Architecture → External Integrations → Skyvern](../10-architecture/Modules.md#integrationssky vern) — Integration module structure, client, guards
> - [Docker Services](../50-ops/Docker-Services.md) — Skyvern as optional Docker profile
> - [Service Health](../50-ops/Service-Health.md) — External Skyvern health checks

---

# ⚠️ This Document is Archived

The content below has been **merged into canonical documentation**. Please refer to the links above for the most current information.

---

# Environment Variables Migration Guide

## Skyvern External Service Refactor

**Date**: 2025-10-03  
**Status**: ~~Required for all deployments~~ **MERGED INTO CANONICAL DOCS**

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

**For complete information**, see:
- [Project Overview → Skyvern Integration](../00-foundation/Project-Overview.md#skyvern-integration-external-service)







