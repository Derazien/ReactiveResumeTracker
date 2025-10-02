#!/usr/bin/env bash
# DEPRECATED SHIM
# This script is deprecated. Please use the canonical command instead.

source scripts/shims/deprecate-and-redirect.sh
deprecate_and_redirect "$0" "docker compose -f self-hosted-infrastructure.yml up reactive-resume-server reactive-resume-client reactive-resume-db reactive-resume-redis" "$@"
