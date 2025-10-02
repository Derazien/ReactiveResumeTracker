# Generate Dependency Graph (PowerShell)
# Outputs: docs/maps/deps.svg

Write-Host "🗺️  Generating dependency graph..." -ForegroundColor Cyan

# Ensure output directory exists
New-Item -ItemType Directory -Force -Path "docs/maps" | Out-Null

# Generate dependency graph as DOT format
$dotContent = npx depcruise `
  --output-type dot `
  --exclude "node_modules|dist|build|_scratch|coverage|\.test\.|\.spec\." `
  --config .dependency-cruiser.js `
  apps libs 2>&1

if ($LASTEXITCODE -eq 0) {
  # Check if Graphviz dot is available
  $dotAvailable = Get-Command dot -ErrorAction SilentlyContinue
  
  if ($dotAvailable) {
    # Convert DOT to SVG using Graphviz
    $dotContent | dot -Tsvg | Out-File -FilePath "docs/maps/deps.svg" -Encoding UTF8
    Write-Host "✅ Dependency graph generated: docs/maps/deps.svg" -ForegroundColor Green
  } else {
    # Save as DOT format if Graphviz not available
    $dotContent | Out-File -FilePath "docs/maps/deps.dot" -Encoding UTF8
    Write-Host "✅ Dependency graph (DOT) saved: docs/maps/deps.dot" -ForegroundColor Yellow
    Write-Host "⚠️  Install Graphviz to generate SVG: https://graphviz.org/" -ForegroundColor Yellow
  }
} else {
  Write-Host "❌ Failed to generate dependency graph" -ForegroundColor Red
  exit 1
}

