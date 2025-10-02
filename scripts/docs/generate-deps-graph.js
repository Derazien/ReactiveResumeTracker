#!/usr/bin/env node

/**
 * Generate Dependency Graph (Cross-platform)
 * 
 * Generates both DOT and SVG formats of the dependency graph
 * Outputs: docs/maps/deps.dot, docs/maps/deps.svg
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'docs/maps');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Determine project roots dynamically
 */
function findProjectRoots() {
  const candidates = ['apps', 'libs', 'packages', 'services', 'src'];
  const roots = [];
  
  for (const candidate of candidates) {
    const candidatePath = path.join(WORKSPACE_ROOT, candidate);
    if (fs.existsSync(candidatePath)) {
      roots.push(candidate);
    }
  }
  
  return roots.length > 0 ? roots : ['.']; // Fallback to root
}

/**
 * Determine npx command based on platform
 */
function getNpxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

/**
 * Main execution
 */
function main() {
  console.log('🗺️  Generating dependency graph...\n');
  
  try {
    // Find project roots
    const roots = findProjectRoots();
    console.log(`📂 Project roots: ${roots.join(', ')}\n`);
    
    const npx = getNpxCommand();
    
    // Generate DOT format (write directly to file to avoid buffer overflow)
    console.log('🔧 Running dependency-cruiser...');
    const dotPath = path.join(OUTPUT_DIR, 'deps.dot');
    
    execSync(
      `${npx} depcruise --config .dependency-cruiser.js --output-type dot ${roots.join(' ')} > "${dotPath}"`,
      { cwd: WORKSPACE_ROOT, shell: true, stdio: 'inherit' }
    );
    
    console.log(`✅ DOT file generated: ${path.relative(WORKSPACE_ROOT, dotPath)}`);
    
    // DOT file info
    const dotSize = fs.statSync(dotPath).size;
    console.log(`\n📊 File size: ${(dotSize / 1024).toFixed(2)} KB`);
    
    // Count modules from DOT file
    try {
      const dotContent = fs.readFileSync(dotPath, 'utf8');
      const moduleCount = (dotContent.match(/\[label=/g) || []).length;
      console.log(`\n📦 Modules analyzed: ${moduleCount}`);
    } catch (err) {
      // Non-fatal if we can't count modules
    }
    
    console.log('\n✅ Dependency graph generation complete\n');
    
  } catch (err) {
    console.error('❌ Error generating dependency graph:');
    console.error(err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

