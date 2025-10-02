#!/usr/bin/env node

/**
 * Dependency Cruiser Baseline Comparison
 * 
 * Compares current dependency state with baseline to ensure no NEW cycles are introduced.
 * Allows gradual fixing of existing cycles without blocking development.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const BASELINE_PATH = path.join(WORKSPACE_ROOT, 'docs/maps/depcruise-baseline.json');

/**
 * Extract cycle violations from dependency-cruiser report
 */
function extractCycleViolations(report) {
  const violations = report.summary?.violations || [];
  return violations
    .filter(v => v.rule?.name === 'no-circular')
    .map(v => ({
      from: v.from,
      to: v.to,
      // Create a normalized cycle ID for comparison
      cycleId: [v.from, v.to].sort().join(' → ')
    }));
}

/**
 * Run dependency cruiser and get current state
 */
function getCurrentState() {
  console.log('🔍 Running dependency cruiser on current codebase...\n');
  
  try {
    const output = execSync(
      'npx depcruise --output-type json --config .dependency-cruiser.js apps libs',
      { cwd: WORKSPACE_ROOT, encoding: 'utf8', stdio: 'pipe' }
    );
    
    return JSON.parse(output);
  } catch (err) {
    // depcruise exits with non-zero when violations found
    // But still outputs JSON to stdout
    if (err.stdout) {
      return JSON.parse(err.stdout);
    }
    throw err;
  }
}

/**
 * Main comparison logic
 */
function main() {
  console.log('📊 Dependency Cycle Baseline Comparison\n');
  console.log('=' .repeat(70));
  
  // Load baseline
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`❌ Baseline not found: ${BASELINE_PATH}`);
    console.error('   Run: npx depcruise --output-type json --config .dependency-cruiser.js apps libs > docs/maps/depcruise-baseline.json');
    process.exit(1);
  }
  
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const baselineCycles = extractCycleViolations(baseline);
  
  console.log(`\n📋 Baseline State:`);
  console.log(`   Modules: ${baseline.summary?.totalCruised || 0}`);
  console.log(`   Dependencies: ${baseline.summary?.totalDependenciesCruised || 0}`);
  console.log(`   Circular violations: ${baselineCycles.length}\n`);
  
  // Get current state
  const current = getCurrentState();
  const currentCycles = extractCycleViolations(current);
  
  console.log(`📋 Current State:`);
  console.log(`   Modules: ${current.summary?.totalCruised || 0}`);
  console.log(`   Dependencies: ${current.summary?.totalDependenciesCruised || 0}`);
  console.log(`   Circular violations: ${currentCycles.length}\n`);
  
  console.log('='.repeat(70));
  
  // Compare
  const baselineCycleIds = new Set(baselineCycles.map(c => c.cycleId));
  const currentCycleIds = new Set(currentCycles.map(c => c.cycleId));
  
  // Find new cycles
  const newCycles = currentCycles.filter(c => !baselineCycleIds.has(c.cycleId));
  
  // Find fixed cycles
  const fixedCycles = baselineCycles.filter(c => !currentCycleIds.has(c.cycleId));
  
  // Results
  console.log(`\n📊 Comparison Results:\n`);
  console.log(`   Baseline cycles:  ${baselineCycles.length}`);
  console.log(`   Current cycles:   ${currentCycles.length}`);
  console.log(`   New cycles:       ${newCycles.length}`);
  console.log(`   Fixed cycles:     ${fixedCycles.length}`);
  console.log(`   Net change:       ${currentCycles.length - baselineCycles.length >= 0 ? '+' : ''}${currentCycles.length - baselineCycles.length}\n`);
  
  if (fixedCycles.length > 0) {
    console.log(`✅ Cycles Fixed:\n`);
    fixedCycles.slice(0, 5).forEach(cycle => {
      console.log(`   - ${cycle.from} → ${cycle.to}`);
    });
    if (fixedCycles.length > 5) {
      console.log(`   ... and ${fixedCycles.length - 5} more\n`);
    }
  }
  
  if (newCycles.length > 0) {
    console.log(`\n❌ NEW CYCLES DETECTED:\n`);
    newCycles.forEach(cycle => {
      console.log(`   - ${cycle.from}`);
      console.log(`     → ${cycle.to}\n`);
    });
    
    console.log('='.repeat(70));
    console.log('❌ BASELINE VIOLATION: New circular dependencies introduced');
    console.log('='.repeat(70));
    console.log('\nPlease fix the circular dependencies listed above.');
    console.log('See docs/00-foundation/ADR-0001-Dependency-Cycles-Baseline.md for guidance.\n');
    
    process.exit(1);
  } else if (currentCycles.length > baselineCycles.length) {
    // Edge case: different cycles but same or more count
    console.log(`\n⚠️  WARNING: Cycle count increased but no exact new cycles detected`);
    console.log(`   This might indicate refactored cycles. Please review carefully.\n`);
    process.exit(1);
  } else {
    console.log('='.repeat(70));
    console.log('✅ BASELINE MAINTAINED: No new circular dependencies');
    console.log('='.repeat(70));
    
    if (fixedCycles.length > 0) {
      console.log(`\n🎉 Great work! You fixed ${fixedCycles.length} cycle(s)!`);
      console.log(`   Consider updating the baseline after this PR merges.\n`);
    } else {
      console.log(`\n💡 Baseline: ${baselineCycles.length} cycles remaining`);
      console.log(`   See ADR-0001 for remediation strategy.\n`);
    }
    
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, extractCycleViolations };

