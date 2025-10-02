#!/usr/bin/env node

/**
 * Add "Replaced by" Column to Catalog
 * 
 * Maps deprecated entries to their canonical equivalents
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CLASSIFICATION_PATH = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Classification.json');

// Mapping rules for deprecated entries
const REPLACEMENT_MAP = {
  // Docker services from deprecated compose files
  'docker-compose.skyvern.yml': {
    'skyvern-postgres': 'unified-docker-compose.yml:skyvern-postgres',
    'skyvern-redis': 'unified-docker-compose.yml:skyvern-redis',
    'skyvern': 'unified-docker-compose.yml:skyvern',
    'skyvern-ui': 'unified-docker-compose.yml:skyvern-ui'
  },
  
  'scripts/docker/docker-compose-complete-stack.yml': {
    'postgres-main': 'unified-docker-compose.yml:postgres-main',
    'redis': 'unified-docker-compose.yml:redis',
    'minio': 'unified-docker-compose.yml:minio',
    'chrome': 'unified-docker-compose.yml:chrome',
    'skyvern-postgres': 'unified-docker-compose.yml:skyvern-postgres',
    'skyvern-redis': 'unified-docker-compose.yml:skyvern-redis',
    'skyvern': 'unified-docker-compose.yml:skyvern',
    'skyvern-ui': 'unified-docker-compose.yml:skyvern-ui',
    'ollama': 'unified-docker-compose.yml:ollama'
  },
  
  'scripts/docker/docker-compose-reactiveresume-only.yml': {
    'postgres': 'unified-docker-compose.yml:postgres-main',
    'redis': 'unified-docker-compose.yml:redis',
    'minio': 'unified-docker-compose.yml:minio',
    'chrome': 'unified-docker-compose.yml:chrome'
  },
  
  'services/skyvern/docker-compose.yml': {
    'postgres': 'unified-docker-compose.yml:skyvern-postgres',
    'skyvern': 'unified-docker-compose.yml:skyvern',
    'skyvern-ui': 'unified-docker-compose.yml:skyvern-ui'
  },
  
  // NPM scripts
  'services/skyvern/skyvern-frontend/package.json': {
    'lint': 'pnpm lint (root)',
    'format': 'pnpm format (root)',
    'run-artifact-server': 'Not needed - integrated',
    'serve': 'npm run dev (skyvern-frontend)',
    'start': 'npm run dev (skyvern-frontend)'
  },
  
  // Script files
  'scripts/legacy': {
    'setup.ps1': 'pnpm install + docker compose -f unified-docker-compose.yml up -d',
    'setup.sh': 'pnpm install + docker compose -f unified-docker-compose.yml up -d',
    'start-complete-system.ps1': 'docker compose -f unified-docker-compose.yml up -d'
  }
};

/**
 * Determine replacement for an entry
 */
function getReplacement(entry) {
  if (entry.newStatus !== 'deprecated') {
    return null;
  }
  
  // Check file-based mappings
  for (const [filePattern, mappings] of Object.entries(REPLACEMENT_MAP)) {
    if (entry.referencedBy.includes(filePattern)) {
      const replacement = mappings[entry.entry];
      if (replacement) {
        return replacement;
      }
    }
  }
  
  // Default mappings based on patterns
  if (entry.type === 'docker-service') {
    // Services from deprecated compose files map to unified
    if (entry.referencedBy.includes('docker-compose.skyvern.yml')) {
      return `unified-docker-compose.yml:${entry.entry}`;
    }
    if (entry.referencedBy.includes('scripts/docker/')) {
      return `unified-docker-compose.yml:${entry.entry}`;
    }
  }
  
  return 'See canonical commands in docs/50-ops/Run-Paths-Catalog.md';
}

function main() {
  console.log('📝 Adding "Replaced by" column\n');
  
  try {
    const classified = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
    
    // Add replacedBy field
    const updated = classified.map(entry => ({
      ...entry,
      replacedBy: getReplacement(entry)
    }));
    
    // Save updated classification
    fs.writeFileSync(CLASSIFICATION_PATH, JSON.stringify(updated, null, 2), 'utf8');
    
    console.log(`✅ Updated ${classified.length} entries\n`);
    
    // Count entries with replacements
    const withReplacement = updated.filter(e => e.replacedBy).length;
    console.log(`Entries with "Replaced by": ${withReplacement}`);
    console.log(`  (All deprecated entries should have this)\n`);
    
    // Verify deprecated entries have replacements
    const deprecated = updated.filter(e => e.newStatus === 'deprecated');
    const missingReplacement = deprecated.filter(e => !e.replacedBy);
    
    if (missingReplacement.length > 0) {
      console.log(`⚠️  Deprecated entries missing replacement:`);
      missingReplacement.forEach(e => {
        console.log(`  - ${e.id}: ${e.entry} (${e.referencedBy})`);
      });
    } else {
      console.log(`✅ All ${deprecated.length} deprecated entries have replacements`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

