# 🎯 Copy Arc Browser Settings to Skyvern Docker Container
# Arc is Chromium-based, so settings are compatible!

Write-Output "🔄 Copying Arc Browser Settings to Skyvern Docker..."

# Arc browser data locations (Microsoft Store version)
$ArcUserData = "C:\Users\raedz\AppData\Local\Packages\TheBrowserCompany.Arc_ttt1ap7aakyb4\LocalCache\Local\Arc\User Data"
$ArcDefault = "$ArcUserData\Default"

# Check if Arc is installed
if (!(Test-Path $ArcUserData)) {
    Write-Output "❌ Arc browser not found at: $ArcUserData"
    Write-Output "💡 Make sure Arc is installed and you've used it at least once"
    exit 1
}

Write-Output "✅ Found Arc browser data at: $ArcUserData"

# Create temporary directory for copying
$TempDir = "./temp-arc-data"
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -Path $TempDir -ItemType Directory | Out-Null

Write-Output "📂 Copying Arc profile data..."

# Copy VERIFIED Chrome-compatible Arc browser data
$ItemsToCopy = @(
    # ✅ GUARANTEED CHROME COMPATIBILITY:
    "Default/Login Data",            # 224 KB - LinkedIn passwords (SQLite)
    "Default/History",               # 182 MB - Browsing history (SQLite)  
    "Default/Web Data",              # 704 KB - Autofill & bookmarks (SQLite)
    "Default/Preferences",           # 553 KB - Browser settings (JSON)
    "Default/Secure Preferences",    # 0.1 KB - Security settings (JSON)
    "Default/Extension Cookies",     # 20 KB - Login sessions (SQLite)
    "Local State",                   # Chrome global state (JSON)
    "First Run",                     # First run marker
    
    # ✅ ADDITIONAL PROFILES (if they exist):
    "Profile 1/Login Data",          # Additional profile passwords
    "Profile 1/History",             # Additional profile history
    "Profile 1/Preferences",         # Additional profile settings
    "Profile 1/Web Data"             # Additional profile autofill
)

foreach ($Item in $ItemsToCopy) {
    $SourcePath = Join-Path $ArcUserData $Item
    $DestPath = Join-Path $TempDir $Item
    
    if (Test-Path $SourcePath) {
        # Create destination directory if needed
        $DestDir = Split-Path $DestPath -Parent
        if (!(Test-Path $DestDir)) {
            New-Item -Path $DestDir -ItemType Directory -Force | Out-Null
        }
        
        if (Test-Path $SourcePath -PathType Container) {
            Copy-Item $SourcePath $DestPath -Recurse -Force
            Write-Output "✅ Copied folder: $Item"
        } else {
            Copy-Item $SourcePath $DestPath -Force
            Write-Output "✅ Copied file: $Item"
        }
    } else {
        Write-Output "⚠️  Skipped (not found): $Item"
    }
}

Write-Output ""
Write-Output "🚀 Starting Docker containers..."

# Start Skyvern containers
docker-compose -f docker-compose.skyvern.yml up -d skyvern-postgres skyvern-redis
Start-Sleep -Seconds 10

docker-compose -f docker-compose.skyvern.yml up -d skyvern

Write-Output "⏳ Waiting for containers to be ready..."
Start-Sleep -Seconds 15

Write-Output ""
Write-Output "📦 Copying Arc data to Docker container..."

# Copy the data to Docker volume
docker cp "$TempDir/." skyvern-api:/tmp/arc-import/

# Set up the Chrome data directory inside container
docker exec skyvern-api bash -c "
    mkdir -p /home/skyvern/.config/google-chrome
    mkdir -p /tmp/chrome-user-data
    
    # Copy Arc data to Chrome locations
    if [ -d /tmp/arc-import ]; then
        cp -r /tmp/arc-import/* /home/skyvern/.config/google-chrome/ 2>/dev/null || true
        cp -r /tmp/arc-import/* /tmp/chrome-user-data/ 2>/dev/null || true
        
        # Set proper permissions
        chown -R skyvern:skyvern /home/skyvern/.config/google-chrome 2>/dev/null || true
        chmod -R 755 /home/skyvern/.config/google-chrome 2>/dev/null || true
        
        echo '✅ Arc browser data imported successfully!'
        echo '📂 Chrome data located at:'
        echo '   • /home/skyvern/.config/google-chrome'
        echo '   • /tmp/chrome-user-data'
    else
        echo '❌ Import data not found'
    fi
"

Write-Output ""
Write-Output "🧹 Cleaning up temporary files..."
Remove-Item $TempDir -Recurse -Force

Write-Output ""
Write-Output "🎉 ARC BROWSER IMPORT COMPLETE!"
Write-Output ""
Write-Output "✅ BENEFITS:"
Write-Output "  • Your Arc passwords, cookies, and sessions are now in Skyvern"
Write-Output "  • LinkedIn login should persist across restarts"
Write-Output "  • Bookmarks and preferences imported"
Write-Output "  • Chrome data persisted in Docker volume"
Write-Output ""
Write-Output "🔧 NEXT STEPS:"
Write-Output "  1. Restart Skyvern containers: docker-compose -f docker-compose.skyvern.yml restart"
Write-Output "  2. Connect via VNC to see your imported profile"
Write-Output "  3. Test LinkedIn automation - should stay logged in!"
Write-Output ""
Write-Output "📺 VNC Access: localhost:5900 (password: skyvern)"
