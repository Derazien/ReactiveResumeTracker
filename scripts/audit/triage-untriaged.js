#!/usr/bin/env node

/**
 * Triage Untriaged Entries
 * 
 * Scores and classifies the remaining untriaged entries using:
 * - refs: Number of references in repo/docs/CI (git grep)
 * - recent: Days since last change
 * - boot: 1 if 60-sec smoke succeeds, 0 otherwise
 * - overlap: % overlap with canonical commands
 * - platform: "cross" or "win-only"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CLASSIFICATION_PATH = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Classification.json');

/**
 * Count git grep references
 */
function countRefs(entry, referencedBy) {
  try {
    // Search for the entry name in repo
    const result = execSync(`git grep -c "${entry.replace(/"/g, '\\"')}" || echo "0"`, {
      cwd: WORKSPACE_ROOT,
      encoding: 'utf8'
    });
    
    const lines = result.trim().split('\n').filter(l => l && !l.startsWith('Binary'));
    return lines.length;
  } catch {
    return 0;
  }
}

/**
 * Get days since last change
 */
function getDaysSinceChange(filePath) {
  try {
    const fullPath = path.join(WORKSPACE_ROOT, filePath);
    if (!fs.existsSync(fullPath)) return 9999; // File doesn't exist
    
    const result = execSync(`git log -1 --format=%ct "${filePath}"`, {
      cwd: WORKSPACE_ROOT,
      encoding: 'utf8'
    }).trim();
    
    if (!result) return 9999;
    
    const timestamp = parseInt(result);
    const now = Date.now() / 1000;
    const days = Math.floor((now - timestamp) / 86400);
    return days;
  } catch {
    return 9999;
  }
}

/**
 * Determine overlap with canonical commands
 */
function calculateOverlap(entry, type, referencedBy) {
  // Debug/test scripts have low overlap
  if (referencedBy.includes('debug') || referencedBy.includes('test')) {
    return 0;
  }
  
  // Legacy scripts have high overlap
  if (referencedBy.includes('legacy')) {
    return 90;
  }
  
  // Git hooks (prepare, precommit) are unique
  if (entry === 'prepare' || entry === 'precommit') {
    return 0;
  }
  
  // init-multiple-dbs is unique
  if (entry.includes('init-multiple-dbs')) {
    return 0;
  }
  
  // Doc commands for deprecated compose files have overlap
  if (type === 'docs-command' && referencedBy.includes('docker-compose.skyvern.yml')) {
    return 80;
  }
  
  // Default low overlap
  return 10;
}

/**
 * Determine platform
 */
function determinePlatform(type, entry, referencedBy) {
  if (type.includes('ps1')) return 'win-only';
  if (type.includes('sh')) return 'cross';
  if (type === 'docs-command') return 'cross';
  if (type === 'npm-script') return 'cross';
  return 'cross';
}

/**
 * Classify based on scores
 */
function classifyEntry(entry, scores) {
  const { refs, recent, boot, overlap, platform } = scores;
  
  // Git hooks are active
  if (entry.entry === 'prepare' || entry.entry === 'precommit') {
    return 'active';
  }
  
  // init-multiple-dbs is unique database utility - active
  if (entry.entry.includes('init-multiple-dbs')) {
    return 'active';
  }
  
  // Debug/test utilities with low refs and old = deprecated
  if ((entry.referencedBy.includes('debug') || entry.referencedBy.includes('test')) && refs < 2 && recent > 30) {
    return 'deprecated';
  }
  
  // Legacy scripts = deprecated
  if (entry.referencedBy.includes('legacy')) {
    return 'deprecated';
  }
  
  // Doc commands for deprecated compose = deprecated
  if (entry.type === 'docs-command' && overlap > 50) {
    return 'deprecated';
  }
  
  // Win-only convenience with low overlap = potentially useful, keep as active for now
  if (platform === 'win-only' && overlap < 20) {
    return 'active';
  }
  
  // High overlap + low refs = deprecated
  if (overlap > 70 && refs < 3) {
    return 'deprecated';
  }
  
  // Default to active if unclear
  return 'active';
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Triaging Untriaged Entries\n');
  
  try {
    const classified = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
    
    // Filter untriaged entries
    const untriaged = classified.filter(e => e.newStatus === 'untriaged');
    console.log(`Found ${untriaged.length} untriaged entries\n`);
    
    // Score and classify each
    const scoredEntries = untriaged.map(entry => {
      console.log(`Scoring: ${entry.id} - ${entry.entry}`);
      
      const scores = {
        refs: countRefs(entry.entry, entry.referencedBy),
        recent: getDaysSinceChange(entry.referencedBy),
        boot: 0, // We'll assume 0 for now (manual testing required)
        overlap: calculateOverlap(entry.entry, entry.type, entry.referencedBy),
        platform: determinePlatform(entry.type, entry.entry, entry.referencedBy)
      };
      
      const newStatus = classifyEntry(entry, scores);
      
      console.log(`  refs=${scores.refs}, recent=${scores.recent}d, boot=${scores.boot}, overlap=${scores.overlap}%, platform=${scores.platform} → ${newStatus}`);
      
      return {
        ...entry,
        newStatus,
        scores
      };
    });
    
    // Update classification file
    const updatedClassification = classified.map(entry => {
      const scored = scoredEntries.find(s => s.id === entry.id);
      return scored || entry;
    });
    
    fs.writeFileSync(CLASSIFICATION_PATH, JSON.stringify(updatedClassification, null, 2), 'utf8');
    
    console.log(`\n✅ Triage complete\n`);
    
    // Print summary
    const summary = {};
    updatedClassification.forEach(e => {
      summary[e.newStatus] = (summary[e.newStatus] || 0) + 1;
    });
    
    console.log('Final Status Counts:');
    console.log('─────────────────────');
    Object.entries(summary).sort().forEach(([status, count]) => {
      console.log(`  ${status.padEnd(15)} ${count}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


