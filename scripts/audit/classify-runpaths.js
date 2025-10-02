#!/usr/bin/env node

/**
 * Run Paths Classifier
 * 
 * Applies canonicalization policy to classify all run paths as:
 * - canonical: Official entry point
 * - active: Used but not primary entry point
 * - deprecated: Marked for removal
 * - shim: Redirects to canonical
 * - duplicate: Redundant with another entry
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

// Classification rules based on Phase B policy
const CLASSIFICATION_RULES = {
  // CANONICAL: Root npm scripts for local no-Docker development
  canonical: [
    { type: 'npm-script', entry: 'dev', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'build', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'test', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'lint', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'lint:fix', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'format', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'format:fix', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'prisma:generate', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'prisma:migrate', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'prisma:migrate:dev', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'prisma:studio', referencedBy: 'package.json' },
    
    // Skyvern frontend package-local scripts
    { type: 'npm-script', entry: 'dev', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'build', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'test', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'preview', referencedBy: /skyvern-frontend/ },
    
    // Unified docker-compose (local Docker stack)
    { type: 'docker-service', referencedBy: 'unified-docker-compose.yml' },
    
    // Self-hosted infrastructure (production/server)
    { type: 'docker-service', referencedBy: 'self-hosted-infrastructure.yml' },
  ],
  
  // ACTIVE: Useful supporting scripts
  active: [
    { type: 'npm-script', entry: 'prebuild', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'prestart', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'start', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'crowdin:sync', referencedBy: 'package.json' },
    { type: 'npm-script', entry: 'messages:extract', referencedBy: 'package.json' },
    
    // Skyvern n8n integration (might be used)
    { type: 'npm-script', referencedBy: /n8n/ },
    
    // Audit script (just created)
    { type: 'script-js', entry: 'runpaths.js' },
    
    // Production DB scripts
    { type: 'script-js', entry: 'export-current-database.js' },
    { type: 'script-js', entry: 'complete-database-import.js' },
  ],
  
  // DEPRECATED: Old compose files and scripts to be moved to _scratch
  deprecated: [
    { type: 'docker-service', referencedBy: 'docker-compose.skyvern.yml' },
    { type: 'docker-service', referencedBy: 'services/skyvern/docker-compose.yml' },
    { type: 'docker-service', referencedBy: /scripts\/docker\// },
    
    { type: 'script-ps1', referencedBy: /scripts\/legacy\// },
    { type: 'script-sh', referencedBy: /scripts\/legacy\// },
    { type: 'script-ps1', referencedBy: /scripts\/debug\// },
    
    { type: 'npm-script', entry: 'run-artifact-server', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'serve', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'start', referencedBy: /skyvern-frontend/ },
    { type: 'npm-script', entry: 'format', referencedBy: /skyvern-frontend/ }, // use root format
    { type: 'npm-script', entry: 'lint', referencedBy: /skyvern-frontend/ }, // use root lint
  ],
  
  // SHIM: Windows-specific launchers that should redirect to canonical
  shim: [
    { type: 'root-script-ps1', entry: 'start-local.ps1' }, // -> pnpm dev + docker compose
    { type: 'root-script-sh', entry: 'deploy-server.sh' }, // -> docker compose -f self-hosted
    { type: 'script-ps1', entry: 'local-setup-complete-stack.ps1' },
    { type: 'script-ps1', entry: 'local-setup-reactiveresume-only.ps1' },
    { type: 'script-sh', entry: 'server-setup-complete-stack.sh' },
    { type: 'script-sh', entry: 'server-setup-reactiveresume-only.sh' },
  ],
  
  // DUPLICATE: Volume definitions incorrectly parsed as services
  duplicate: [
    { type: 'docker-service', entry: /_data$/ }, // volume names ending in _data
    { type: 'docker-service', entry: 'services' }, // top-level YAML key
    { type: 'docker-service', entry: 'default' }, // default network
  ],
};

/**
 * Classify a single entry
 */
function classifyEntry(entry) {
  // Priority check: duplicates first (volume definitions, etc.)
  if (entry.type === 'docker-service') {
    if (/_data$|_downloads$/.test(entry.entry) || 
        entry.entry === 'services' || 
        entry.entry === 'default') {
      return 'duplicate';
    }
  }
  
  // Check each classification category
  for (const [status, rules] of Object.entries(CLASSIFICATION_RULES)) {
    for (const rule of rules) {
      let matches = true;
      
      // Check type
      if (rule.type && entry.type !== rule.type) {
        matches = false;
      }
      
      // Check entry (can be string or regex)
      if (rule.entry) {
        if (rule.entry instanceof RegExp) {
          if (!rule.entry.test(entry.entry)) {
            matches = false;
          }
        } else if (rule.entry !== entry.entry) {
          matches = false;
        }
      }
      
      // Check referencedBy (can be string or regex)
      if (rule.referencedBy) {
        if (rule.referencedBy instanceof RegExp) {
          if (!rule.referencedBy.test(entry.referencedBy)) {
            matches = false;
          }
        } else if (rule.referencedBy !== entry.referencedBy) {
          matches = false;
        }
      }
      
      if (matches) {
        return status;
      }
    }
  }
  
  // Default: untriaged
  return 'untriaged';
}

/**
 * Parse catalog markdown and extract entries
 */
function parseCatalog(catalogPath) {
  const content = fs.readFileSync(catalogPath, 'utf8');
  const entries = [];
  
  // Find detailed entries section
  const detailsMatch = content.match(/## Detailed Entries\n\n([\s\S]+?)---/);
  if (!detailsMatch) {
    throw new Error('Could not find Detailed Entries section');
  }
  
  const detailsSection = detailsMatch[1];
  
  // Parse each entry
  const entryRegex = /####\s+(RP\d+):\s+`([^`]+)`\n\n(?:- \*\*Referenced By:\*\*\s+`([^`]+)`\n)?(?:- \*\*Command:\*\*\s+`([^`]*)`\n)?(?:- \*\*Description:\*\*\s+([^\n]+)\n)?(?:- \*\*Status:\*\*\s+(\w+)\n)?/g;
  
  let match;
  while ((match = entryRegex.exec(detailsSection)) !== null) {
    entries.push({
      id: match[1],
      entry: match[2],
      referencedBy: match[3] || '',
      command: match[4] || '',
      description: match[5] || '',
      status: match[6] || 'untriaged',
      // Also extract type from heading
      type: null // Will be inferred from context
    });
  }
  
  // Also parse from the main catalog table to get type info
  const tableMatch = content.match(/## Catalog\n\n\|[^\n]+\n\|[^\n]+\n([\s\S]+?)\n\n## Detailed/);
  if (tableMatch) {
    const tableRows = tableMatch[1].trim().split('\n');
    tableRows.forEach(row => {
      const cols = row.split('|').map(c => c.trim());
      if (cols.length >= 5 && cols[1].startsWith('RP')) {
        const id = cols[1];
        const type = cols[3];
        
        // Find matching entry and set type
        const entry = entries.find(e => e.id === id);
        if (entry) {
          entry.type = type;
        }
      }
    });
  }
  
  return entries;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Classifying Run Paths\n');
  
  const catalogPath = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Catalog.md');
  
  try {
    const entries = parseCatalog(catalogPath);
    console.log(`Found ${entries.length} entries\n`);
    
    // Classify all entries
    const classified = entries.map(entry => ({
      ...entry,
      newStatus: classifyEntry(entry)
    }));
    
    // Generate summary
    const summary = {
      canonical: 0,
      active: 0,
      deprecated: 0,
      shim: 0,
      duplicate: 0,
      untriaged: 0
    };
    
    classified.forEach(entry => {
      summary[entry.newStatus]++;
    });
    
    console.log('Classification Summary:');
    console.log('─────────────────────────────────────');
    Object.entries(summary).sort().forEach(([status, count]) => {
      console.log(`  ${status.padEnd(15)} ${count}`);
    });
    console.log(`  ${'TOTAL'.padEnd(15)} ${entries.length}`);
    console.log('');
    
    // Output detailed classification for review
    const outputPath = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Classification.json');
    fs.writeFileSync(outputPath, JSON.stringify(classified, null, 2), 'utf8');
    console.log(`✅ Classification saved to: ${outputPath}\n`);
    
    // Show breakdown by type and status
    console.log('Breakdown by Type:');
    console.log('─────────────────────────────────────');
    const byType = {};
    classified.forEach(entry => {
      if (!byType[entry.type]) {
        byType[entry.type] = { canonical: 0, active: 0, deprecated: 0, shim: 0, duplicate: 0, untriaged: 0 };
      }
      byType[entry.type][entry.newStatus]++;
    });
    
    Object.entries(byType).sort().forEach(([type, statusCounts]) => {
      console.log(`\n  ${type}:`);
      Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
          console.log(`    ${status.padEnd(12)} ${count}`);
        }
      });
    });
    
    return classified;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { classifyEntry, main };

