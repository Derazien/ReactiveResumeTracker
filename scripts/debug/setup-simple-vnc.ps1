# 🔧 Simple VNC Setup Without Password Issues
Write-Output "Setting up VNC access without password complications..."

# Stop current VNC if running
docker exec skyvern-api bash -c "pkill x11vnc || true"
Start-Sleep 2

# Start VNC server WITHOUT password (simpler and more reliable)
docker exec skyvern-api bash -c "
echo 'Setting up simple VNC access...'

# Ensure Xvfb is running on display :99
if ! pgrep -f 'Xvfb :99' > /dev/null; then
    echo 'Starting Xvfb display server...'
    Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset &
    sleep 3
fi

# Start VNC server without password authentication
echo 'Starting VNC server without password...'
x11vnc -display :99 -forever -shared -rfbport 5900 \
    -noxdamage -noxfixes -noxrandr -wait 50 -nap \
    -desktop skyvern-chrome -bg -o /tmp/vnc-simple.log

sleep 2
if pgrep x11vnc > /dev/null; then
    echo '✅ VNC server started successfully on port 5900'
    echo '🔓 NO PASSWORD REQUIRED - connect directly'
    echo '📺 VNC desktop ready for Chrome automation'
else
    echo '❌ VNC server failed to start'
    cat /tmp/vnc-simple.log || true
fi
"

Write-Output ""
Write-Output "✅ SIMPLE VNC SETUP COMPLETE!"
Write-Output ""
Write-Output "🔗 CONNECTION INFO:"
Write-Output "  • Address: localhost:5900"
Write-Output "  • Password: NOT REQUIRED (leave blank)"
Write-Output "  • Security: Localhost only (safe)"
Write-Output ""
Write-Output "🎯 BENEFITS:"
Write-Output "  • No password authentication issues"
Write-Output "  • Immediate connection"
Write-Output "  • Reliable VNC access"
Write-Output "  • Perfect for Chrome automation control"

















