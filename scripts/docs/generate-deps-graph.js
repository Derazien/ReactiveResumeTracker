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
 * Try to generate SVG from DOT file
 * Returns true if successful, false otherwise (non-fatal)
 */
function tryGenerateSvg(dotPath) {
  const svgPath = dotPath.replace(/\.dot$/, '.svg');
  const npx = getNpxCommand();
  
  try {
    execSync(
      `${npx} graphviz -Tsvg "${dotPath}" > "${svgPath}"`,
      { cwd: WORKSPACE_ROOT, shell: true, stdio: 'pipe' }
    );
    
    if (fs.existsSync(svgPath) && fs.statSync(svgPath).size > 0) {
      return true;
    }
  } catch (err) {
    // Silent fail - SVG is optional
  }
  
  return false;
}

/**
 * Generate dependency graph for a specific path
 */
function generateGraph(targetPath, outputName, description, skipSvg = false) {
  const npx = getNpxCommand();
  const dotPath = path.join(OUTPUT_DIR, `${outputName}.dot`);
  
  console.log(`\n🔧 Generating graph for ${description}...`);
  
  try {
    execSync(
      `${npx} depcruise --config .dependency-cruiser.js --output-type dot ${targetPath} > "${dotPath}"`,
      { cwd: WORKSPACE_ROOT, shell: true, stdio: 'pipe' }
    );
    
    const dotSize = fs.statSync(dotPath).size;
    console.log(`   ✅ DOT: ${path.relative(WORKSPACE_ROOT, dotPath)} (${(dotSize / 1024).toFixed(2)} KB)`);
    
    // Try SVG (skip for very large graphs)
    if (skipSvg) {
      console.log(`   ⏭️  SVG: Skipped (graph too large, use DOT viewer)`);
    } else if (tryGenerateSvg(dotPath)) {
      const svgPath = dotPath.replace(/\.dot$/, '.svg');
      const svgSize = fs.statSync(svgPath).size;
      console.log(`   ✅ SVG: ${path.relative(WORKSPACE_ROOT, svgPath)} (${(svgSize / 1024).toFixed(2)} KB)`);
    } else {
      console.log(`   ⚠️  SVG: Skipped (graphviz-cli not available or failed)`);
    }
    
    return true;
  } catch (err) {
    console.log(`   ❌ Failed: ${err.message.split('\n')[0]}`);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🗺️  Generating dependency graphs...\n');
  
  try {
    // Find project roots
    const roots = findProjectRoots();
    console.log(`📂 Project roots: ${roots.join(', ')}`);
    
    // Generate full repository graph (skip SVG - too large)
    console.log('\n📊 Full Repository Graph');
    console.log('─'.repeat(50));
    generateGraph(roots.join(' '), 'deps', 'full repository', true);
    
    // Count modules
    const depsPath = path.join(OUTPUT_DIR, 'deps.dot');
    try {
      const dotContent = fs.readFileSync(depsPath, 'utf8');
      const moduleCount = (dotContent.match(/\[label=/g) || []).length;
      console.log(`   📦 Total modules: ${moduleCount}`);
    } catch (err) {
      // Non-fatal
    }
    
    // Generate per-app graphs
    const appsDir = path.join(WORKSPACE_ROOT, 'apps');
    if (fs.existsSync(appsDir)) {
      console.log('\n📱 Per-App Graphs');
      console.log('─'.repeat(50));
      
      const apps = fs.readdirSync(appsDir).filter(name => {
        const appPath = path.join(appsDir, name);
        return fs.statSync(appPath).isDirectory();
      });
      
      for (const app of apps) {
        generateGraph(`apps/${app}`, `apps-${app}`, `apps/${app}`);
      }
    }
    
    // Generate graphs for large libs
    const libsToGraph = ['ui']; // Add more as needed
    const libsDir = path.join(WORKSPACE_ROOT, 'libs');
    
    if (fs.existsSync(libsDir)) {
      console.log('\n📚 Library Graphs');
      console.log('─'.repeat(50));
      
      for (const lib of libsToGraph) {
        const libPath = path.join(libsDir, lib);
        if (fs.existsSync(libPath)) {
          generateGraph(`libs/${lib}`, `libs-${lib}`, `libs/${lib}`);
        }
      }
    }
    
    console.log('\n✅ All dependency graphs generated successfully\n');
    
  } catch (err) {
    console.error('❌ Error generating dependency graphs:');
    console.error(err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };

