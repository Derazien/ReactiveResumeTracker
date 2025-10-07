# ============================================================================
# Connect to Remote Ollama via SSH Tunnel
# ============================================================================
# 
# This script creates a secure SSH tunnel to access Ollama running on the
# remote server (66.96.83.44) from your local Windows machine.
#
# Usage:
#   .\scripts\win\connect-remote-ollama.ps1
#
# Keep this window open while developing locally with remote Ollama.
# Press Ctrl+C to disconnect.
#
# ============================================================================

param(
    [switch]$Help,
    [switch]$Test,
    [switch]$Status
)

# Colors
$cyan = "Cyan"
$green = "Green"
$yellow = "Yellow"
$gray = "Gray"
$red = "Red"

# Configuration
$serverIP = "66.96.83.44"
$serverUser = "root"
$localPort = 11434
$remotePort = 11434

function Show-Help {
    Write-Host ""
    Write-Host "Connect to Remote Ollama" -ForegroundColor $cyan
    Write-Host "========================" -ForegroundColor $cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor $yellow
    Write-Host "  .\scripts\win\connect-remote-ollama.ps1          # Connect to remote Ollama"
    Write-Host "  .\scripts\win\connect-remote-ollama.ps1 -Test    # Test connection"
    Write-Host "  .\scripts\win\connect-remote-ollama.ps1 -Status  # Check if tunnel is active"
    Write-Host "  .\scripts\win\connect-remote-ollama.ps1 -Help    # Show this help"
    Write-Host ""
    Write-Host "What this does:" -ForegroundColor $yellow
    Write-Host "  • Creates secure SSH tunnel to remote Ollama"
    Write-Host "  • Maps localhost:11434 → server:11434"
    Write-Host "  • Enables local development with remote models"
    Write-Host ""
    Write-Host "After connecting:" -ForegroundColor $yellow
    Write-Host "  1. Keep this window open"
    Write-Host "  2. Update .env: LOCAL_LLM_BASE_URL=http://localhost:11434"
    Write-Host "  3. Start local dev: .\scripts\win\start-local.ps1"
    Write-Host ""
    exit 0
}

function Test-Connection {
    Write-Host ""
    Write-Host "🧪 Testing Remote Ollama Connection..." -ForegroundColor $cyan
    Write-Host ""
    
    # Check if tunnel is active
    $tunnel = netstat -an | Select-String "127.0.0.1:$localPort.*LISTENING"
    
    if ($tunnel) {
        Write-Host "✓ SSH Tunnel is active" -ForegroundColor $green
        Write-Host "  Port $localPort is listening" -ForegroundColor $gray
        Write-Host ""
        
        # Test API
        try {
            Write-Host "Testing Ollama API..." -ForegroundColor $gray
            $response = Invoke-RestMethod -Uri "http://localhost:$localPort/api/tags" -Method Get -TimeoutSec 5
            
            Write-Host "✓ Ollama API is responding" -ForegroundColor $green
            Write-Host ""
            Write-Host "Installed Models:" -ForegroundColor $yellow
            
            if ($response.models) {
                foreach ($model in $response.models) {
                    $size = [math]::Round($model.size / 1GB, 2)
                    Write-Host "  • $($model.name) ($size GB)" -ForegroundColor $gray
                }
            } else {
                Write-Host "  No models found" -ForegroundColor $red
            }
            
            Write-Host ""
            Write-Host "✓ Connection is working!" -ForegroundColor $green
        }
        catch {
            Write-Host "✗ Cannot reach Ollama API" -ForegroundColor $red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $gray
            Write-Host ""
            Write-Host "Troubleshooting:" -ForegroundColor $yellow
            Write-Host "  1. Check if Ollama is running on server:"
            Write-Host "     ssh $serverUser@$serverIP 'docker ps | grep ollama'"
            Write-Host "  2. Check server logs:"
            Write-Host "     ssh $serverUser@$serverIP 'docker logs ollama --tail 50'"
        }
    }
    else {
        Write-Host "✗ SSH Tunnel is not active" -ForegroundColor $red
        Write-Host "  Port $localPort is not listening" -ForegroundColor $gray
        Write-Host ""
        Write-Host "To start tunnel:" -ForegroundColor $yellow
        Write-Host "  .\scripts\win\connect-remote-ollama.ps1"
    }
    
    Write-Host ""
    exit 0
}

function Check-Status {
    Write-Host ""
    Write-Host "📊 SSH Tunnel Status" -ForegroundColor $cyan
    Write-Host ""
    
    # Check if tunnel is active
    $tunnel = netstat -an | Select-String "127.0.0.1:$localPort.*LISTENING"
    
    if ($tunnel) {
        Write-Host "Status: " -NoNewline
        Write-Host "ACTIVE" -ForegroundColor $green
        Write-Host "Port:   $localPort" -ForegroundColor $gray
        Write-Host "Target: $serverIP:$remotePort" -ForegroundColor $gray
        Write-Host ""
        
        # Check for SSH process
        $sshProcess = Get-Process ssh -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessName -eq "ssh"
        }
        
        if ($sshProcess) {
            Write-Host "SSH Processes:" -ForegroundColor $yellow
            foreach ($proc in $sshProcess) {
                Write-Host "  • PID: $($proc.Id)" -ForegroundColor $gray
            }
        }
    }
    else {
        Write-Host "Status: " -NoNewline
        Write-Host "INACTIVE" -ForegroundColor $red
        Write-Host ""
        Write-Host "To start tunnel:" -ForegroundColor $yellow
        Write-Host "  .\scripts\win\connect-remote-ollama.ps1"
    }
    
    Write-Host ""
    exit 0
}

# Handle arguments
if ($Help) {
    Show-Help
}

if ($Test) {
    Test-Connection
}

if ($Status) {
    Check-Status
}

# Main execution - Create SSH tunnel
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor $cyan
Write-Host "║                                                            ║" -ForegroundColor $cyan
Write-Host "║          Remote Ollama SSH Tunnel                         ║" -ForegroundColor $cyan
Write-Host "║                                                            ║" -ForegroundColor $cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $cyan
Write-Host ""

Write-Host "🔗 Connecting to remote Ollama..." -ForegroundColor $cyan
Write-Host ""
Write-Host "Server:     $serverIP" -ForegroundColor $gray
Write-Host "Local URL:  http://localhost:$localPort" -ForegroundColor $green
Write-Host "Remote:     $serverIP:$remotePort" -ForegroundColor $gray
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor $yellow
Write-Host "   • Keep this window open while developing" -ForegroundColor $yellow
Write-Host "   • Press Ctrl+C to disconnect" -ForegroundColor $yellow
Write-Host "   • Update .env: LOCAL_LLM_BASE_URL=http://localhost:$localPort" -ForegroundColor $yellow
Write-Host ""

# Check if port is already in use
$portInUse = netstat -an | Select-String "127.0.0.1:$localPort.*LISTENING"

if ($portInUse) {
    Write-Host "⚠️  Warning: Port $localPort is already in use" -ForegroundColor $yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $cyan
    Write-Host "  1. Another tunnel is already running (you can use it)"
    Write-Host "  2. Close other applications using port $localPort"
    Write-Host "  3. Kill existing SSH tunnels: Get-Process ssh | Stop-Process"
    Write-Host ""
    
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host ""
        Write-Host "Cancelled." -ForegroundColor $gray
        Write-Host ""
        exit 0
    }
}

Write-Host "Establishing SSH tunnel..." -ForegroundColor $cyan
Write-Host ""
Write-Host "📝 Note: You'll be prompted for the server password" -ForegroundColor $gray
Write-Host "   Password: LfqWw4C5Wm" -ForegroundColor $gray
Write-Host ""
Write-Host "Connecting..." -ForegroundColor $cyan
Write-Host ""

# Create SSH tunnel with keepalive
$sshArgs = @(
    "-L", "${localPort}:localhost:${remotePort}",
    "-o", "ServerAliveInterval=60",
    "-o", "ServerAliveCountMax=3",
    "-o", "ExitOnForwardFailure=yes",
    "${serverUser}@${serverIP}"
)

# Execute SSH
try {
    & ssh $sshArgs
}
catch {
    Write-Host ""
    Write-Host "✗ SSH tunnel failed" -ForegroundColor $red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $gray
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor $yellow
    Write-Host "  1. Check network connection"
    Write-Host "  2. Verify server is accessible: ping $serverIP"
    Write-Host "  3. Test SSH connection: ssh $serverUser@$serverIP"
    Write-Host "  4. Check if Ollama is running on server:"
    Write-Host "     ssh $serverUser@$serverIP 'docker ps | grep ollama'"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Connection closed." -ForegroundColor $gray
Write-Host ""

