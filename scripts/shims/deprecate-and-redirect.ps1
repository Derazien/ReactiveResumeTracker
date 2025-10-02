# Deprecation Shim (PowerShell)
#
# Usage: Import this module and call Invoke-DeprecatedCommand with:
#   -DeprecatedCmd: deprecated command path
#   -CanonicalCmd: canonical command
#   -Arguments: arguments to forward

function Invoke-DeprecatedCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DeprecatedCmd,
        
        [Parameter(Mandatory=$true)]
        [string]$CanonicalCmd,
        
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )
    
    Write-Host "⚠️  DEPRECATION WARNING ⚠️" -ForegroundColor Yellow
    Write-Host "   Script: $DeprecatedCmd" -ForegroundColor Yellow
    Write-Host "   This script is deprecated and will be removed in a future release." -ForegroundColor Yellow
    Write-Host "   Please use: $CanonicalCmd" -ForegroundColor Yellow
    Write-Host "   Forwarding to canonical command..." -ForegroundColor Yellow
    Write-Host ""
    
    # Execute canonical command
    if ($Arguments) {
        & $CanonicalCmd @Arguments
    } else {
        & $CanonicalCmd
    }
}

# If script is executed directly, show usage
if ($MyInvocation.InvocationName -ne '.') {
    Write-Host "This is a shim utility script. Import it in your script:"
    Write-Host ""
    Write-Host "  . scripts/shims/deprecate-and-redirect.ps1"
    Write-Host "  Invoke-DeprecatedCommand -DeprecatedCmd `$PSCommandPath -CanonicalCmd 'canonical-command' -Arguments `$args"
}


