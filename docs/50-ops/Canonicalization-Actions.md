# Phase B Canonicalization Action Report

Generated: 2025-10-02T13:20:04.073Z

## Summary

- **Files Moved**: 0
- **Shims Created**: 6
- **Skipped**: 0
- **Errors**: 0

## Shims Created

### `start-local.ps1`

- **Description**: Start local development server
- **Canonical Command**: `pnpm dev`

### `deploy-server.sh`

- **Description**: Deploy server infrastructure
- **Canonical Command**: `docker compose -f self-hosted-infrastructure.yml up`

### `scripts\development\local-setup-complete-stack.ps1`

- **Description**: Start complete Docker stack
- **Canonical Command**: `docker compose -f unified-docker-compose.yml up`

### `scripts\development\local-setup-reactiveresume-only.ps1`

- **Description**: Start ReactiveResume development (no Docker automation)
- **Canonical Command**: `pnpm dev`

### `scripts\production\server-setup-complete-stack.sh`

- **Description**: Setup complete server stack
- **Canonical Command**: `docker compose -f self-hosted-infrastructure.yml up`

### `scripts\production\server-setup-reactiveresume-only.sh`

- **Description**: Setup ReactiveResume only
- **Canonical Command**: `docker compose -f self-hosted-infrastructure.yml up reactive-resume-server reactive-resume-client reactive-resume-db reactive-resume-redis`

