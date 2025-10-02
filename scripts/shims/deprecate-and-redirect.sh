#!/usr/bin/env bash
# Deprecation Shim (Bash/Zsh)
#
# Usage: source this script and call deprecate_and_redirect with:
#   $1: deprecated command path
#   $2: canonical command
#   $3+: arguments to forward

deprecate_and_redirect() {
  local deprecated_cmd="$1"
  local canonical_cmd="$2"
  shift 2
  
  echo "⚠️  DEPRECATION WARNING ⚠️" >&2
  echo "   Script: $deprecated_cmd" >&2
  echo "   This script is deprecated and will be removed in a future release." >&2
  echo "   Please use: $canonical_cmd" >&2
  echo "   Forwarding to canonical command..." >&2
  echo "" >&2
  
  # Execute canonical command
  eval "$canonical_cmd" "$@"
}

# If script is executed directly (not sourced), show usage
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "This is a shim utility script. Source it in your script:"
  echo ""
  echo "  source scripts/shims/deprecate-and-redirect.sh"
  echo "  deprecate_and_redirect \"\$0\" \"canonical-command\" \"\$@\""
  exit 0
fi


