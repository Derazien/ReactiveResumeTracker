# Setup VNC Access to Skyvern Chrome Instance
Write-Output "Setting up VNC access to Skyvern Chrome browser..."

# Step 1: Install VNC server in Skyvern container
Write-Output "📋 Step 1: Installing VNC server in Skyvern container..."

$vncSetupScript = @"
#!/bin/bash
# Install VNC server and window manager
apt-get update
apt-get install -y x11vnc fluxbox

# Set up VNC password (optional, using 'skyvern' as password)
mkdir -p ~/.vnc
x11vnc -storepasswd skyvern ~/.vnc/passwd

# Start VNC server on display :99 (where Xvfb is running)
x11vnc -display :99 -forever -usepw -shared -rfbport 5900 &

echo "VNC server started on port 5900"
echo "Password: skyvern"
echo "Connect with VNC viewer to localhost:5900"
"@

# Write script to container and execute
$vncSetupScript | docker exec -i skyvern-api bash

Write-Output "✅ VNC server setup complete!"
Write-Output ""
Write-Output "🎯 HOW TO CONNECT:"
Write-Output "   1. Install VNC Viewer (RealVNC, TigerVNC, or TightVNC)"
Write-Output "   2. Connect to: localhost:5900"
Write-Output "   3. Password: skyvern"
Write-Output "   4. You'll see the Skyvern desktop with Chrome"
Write-Output ""
Write-Output "🖥️ WHAT YOU'LL SEE:"
Write-Output "   • Xvfb virtual desktop (1920x1080)"
Write-Output "   • Chrome browser running Skyvern automation"
Write-Output "   • Real-time interaction capability"
Write-Output "   • Can manually login, click, type during automation"
Write-Output ""
Write-Output "🚀 WORKFLOW:"
Write-Output "   1. Start LinkedIn automation workflow"
Write-Output "   2. Connect via VNC when login needed"
Write-Output "   3. Manually login in the VNC Chrome window"
Write-Output "   4. Automation continues from where you left off"


















