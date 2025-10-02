# DEPRECATED SHIM
# This script is deprecated. Please use the canonical command instead.

. scripts/shims/deprecate-and-redirect.ps1
Invoke-DeprecatedCommand -DeprecatedCmd "$PSCommandPath" -CanonicalCmd "pnpm dev" -Arguments $args
