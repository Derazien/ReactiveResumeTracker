# DEPRECATED SHIM
# This script is deprecated. Please use the canonical command instead.

. scripts/shims/deprecate-and-redirect.ps1
Invoke-DeprecatedCommand -DeprecatedCmd "$PSCommandPath" -CanonicalCmd "docker compose -f unified-docker-compose.yml up" -Arguments $args
