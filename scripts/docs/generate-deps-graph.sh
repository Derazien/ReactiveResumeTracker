#!/usr/bin/env bash
# Generate Dependency Graph
# Outputs: docs/maps/deps.svg

echo "🗺️  Generating dependency graph..."

# Ensure output directory exists
mkdir -p docs/maps

# Generate dependency graph as SVG
npx depcruise \
  --output-type dot \
  --exclude "node_modules|dist|build|_scratch|coverage|\.test\.|\.spec\." \
  --config .dependency-cruiser.js \
  apps libs \
  | dot -T svg > docs/maps/deps.svg

if [ $? -eq 0 ]; then
  echo "✅ Dependency graph generated: docs/maps/deps.svg"
  echo "📊 $(grep -c '<g id="node' docs/maps/deps.svg 2>/dev/null || echo 0) modules analyzed"
else
  echo "❌ Failed to generate dependency graph"
  exit 1
fi

