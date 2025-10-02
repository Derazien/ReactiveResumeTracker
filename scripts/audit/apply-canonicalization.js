#!/usr/bin/env node

/**
 * Apply Canonicalization
 * 
 * Executes Phase B canonicalization:
 * 1. Moves deprecated scripts to _scratch/scripts/legacy/
 * 2. Creates shims at original locations
 * 3. Generates action report
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CLASSIFICATION_PATH = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Classification.json');
const SCRATCH_DIR = path.join(WORKSPACE_ROOT, '_scratch/scripts/legacy');

// Ensure scratch directory exists
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

const actions = {
  moved: [],
  shimmed: [],
  skipped: [],
  errors: []
};

/**
 * Move a file to _scratch and create a shim
 */
function moveAndShim(entry) {
  const originalPath = path.join(WORKSPACE_ROOT, entry.referencedBy);
  
  if (!fs.existsSync(originalPath)) {
    actions.skipped.push({ entry, reason: 'File does not exist' });
    return;
  }
  
  // Determine target path in _scratch
  const relativePath = path.relative(WORKSPACE_ROOT, originalPath);
  const targetPath = path.join(SCRATCH_DIR, path.basename(originalPath));
  
  try {
    // Move file
    const content = fs.readFileSync(originalPath, 'utf8');
    fs.writeFileSync(targetPath, content, 'utf8');
    actions.moved.push({ from: relativePath, to: path.relative(WORKSPACE_ROOT, targetPath) });
    
    // Create shim based on file type
    const ext = path.extname(originalPath);
    createShim(originalPath, ext, entry);
    
  } catch (err) {
    actions.errors.push({ entry, error: err.message });
  }
}

/**
 * Create appropriate shim for a Windows script
 */
function createShimForWindows(entry) {
  // Map Windows scripts to canonical commands
  const shimMap = {
    'start-local.ps1': {
      canonical: 'pnpm dev',
      description: 'Start local development server',
      extraInfo: 'For Docker services: docker compose -f unified-docker-compose.yml up'
    },
    'local-setup-complete-stack.ps1': {
      canonical: 'docker compose -f unified-docker-compose.yml up',
      description: 'Start complete Docker stack'
    },
    'local-setup-reactiveresume-only.ps1': {
      canonical: 'pnpm dev',
      description: 'Start ReactiveResume development (no Docker automation)'
    },
    'test-import.ps1': {
      canonical: 'node scripts/production/complete-database-import.js',
      description: 'Import database'
    },
    'test-local-postgres.ps1': {
      canonical: 'docker compose -f unified-docker-compose.yml up postgres',
      description: 'Start PostgreSQL'
    },
    'copy-arc-to-docker.ps1': {
      canonical: null,
      description: 'Deprecated utility - no canonical equivalent'
    }
  };
  
  const shimInfo = shimMap[entry.entry];
  if (!shimInfo) {
    actions.skipped.push({ entry, reason: 'No shim mapping defined' });
    return;
  }
  
  const originalPath = path.join(WORKSPACE_ROOT, entry.referencedBy === '.' ? entry.entry : entry.referencedBy);
  
  if (shimInfo.canonical) {
    const shimContent = `# DEPRECATED SHIM
# This script is deprecated. Please use the canonical command instead.

. scripts/shims/deprecate-and-redirect.ps1
Invoke-DeprecatedCommand -DeprecatedCmd "$PSCommandPath" -CanonicalCmd "${shimInfo.canonical}" -Arguments $args
`;
    
    fs.writeFileSync(originalPath, shimContent, 'utf8');
    actions.shimmed.push({ 
      path: path.relative(WORKSPACE_ROOT, originalPath),
      canonical: shimInfo.canonical,
      description: shimInfo.description
    });
  } else {
    // No canonical - just mark deprecated
    const deprecatedContent = `# DEPRECATED
# ${shimInfo.description}
# This script has been deprecated and will be removed in a future release.

Write-Host "⚠️  DEPRECATION WARNING ⚠️" -ForegroundColor Yellow
Write-Host "   This script is deprecated and no longer maintained." -ForegroundColor Yellow
Write-Host "   ${shimInfo.description}" -ForegroundColor Yellow
exit 1
`;
    
    fs.writeFileSync(originalPath, deprecatedContent, 'utf8');
    actions.shimmed.push({ 
      path: path.relative(WORKSPACE_ROOT, originalPath),
      canonical: 'NONE',
      description: shimInfo.description
    });
  }
}

/**
 * Create appropriate shim for a Linux script
 */
function createShimForLinux(entry) {
  const shimMap = {
    'deploy-server.sh': {
      canonical: 'docker compose -f self-hosted-infrastructure.yml up',
      description: 'Deploy server infrastructure'
    },
    'server-setup-complete-stack.sh': {
      canonical: 'docker compose -f self-hosted-infrastructure.yml up',
      description: 'Setup complete server stack'
    },
    'server-setup-reactiveresume-only.sh': {
      canonical: 'docker compose -f self-hosted-infrastructure.yml up reactive-resume-server reactive-resume-client reactive-resume-db reactive-resume-redis',
      description: 'Setup ReactiveResume only'
    }
  };
  
  const shimInfo = shimMap[entry.entry];
  if (!shimInfo) {
    actions.skipped.push({ entry, reason: 'No shim mapping defined' });
    return;
  }
  
  const originalPath = path.join(WORKSPACE_ROOT, entry.referencedBy === '.' ? entry.entry : entry.referencedBy);
  
  const shimContent = `#!/usr/bin/env bash
# DEPRECATED SHIM
# This script is deprecated. Please use the canonical command instead.

source scripts/shims/deprecate-and-redirect.sh
deprecate_and_redirect "$0" "${shimInfo.canonical}" "$@"
`;
  
  fs.writeFileSync(originalPath, shimContent, 'utf8');
  fs.chmodSync(originalPath, '755');
  
  actions.shimmed.push({ 
    path: path.relative(WORKSPACE_ROOT, originalPath),
    canonical: shimInfo.canonical,
    description: shimInfo.description
  });
}

/**
 * Generate action report
 */
function generateReport() {
  let report = `# Phase B Canonicalization Action Report

Generated: ${new Date().toISOString()}

## Summary

- **Files Moved**: ${actions.moved.length}
- **Shims Created**: ${actions.shimmed.length}
- **Skipped**: ${actions.skipped.length}
- **Errors**: ${actions.errors.length}

`;

  if (actions.moved.length > 0) {
    report += `## Files Moved to _scratch/scripts/legacy/\n\n`;
    actions.moved.forEach(({ from, to }) => {
      report += `- \`${from}\` → \`${to}\`\n`;
    });
    report += '\n';
  }

  if (actions.shimmed.length > 0) {
    report += `## Shims Created\n\n`;
    actions.shimmed.forEach(({ path, canonical, description }) => {
      report += `### \`${path}\`\n\n`;
      report += `- **Description**: ${description}\n`;
      report += `- **Canonical Command**: \`${canonical}\`\n\n`;
    });
  }

  if (actions.skipped.length > 0) {
    report += `## Skipped Entries\n\n`;
    actions.skipped.forEach(({ entry, reason }) => {
      report += `- \`${entry.entry}\`: ${reason}\n`;
    });
    report += '\n';
  }

  if (actions.errors.length > 0) {
    report += `## Errors\n\n`;
    actions.errors.forEach(({ entry, error }) => {
      report += `- \`${entry.entry}\`: ${error}\n`;
    });
    report += '\n';
  }

  return report;
}

/**
 * Main execution
 */
function main(dryRun = false) {
  console.log('🚀 Applying Canonicalization (Phase B)\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY CHANGES'}\n`);
  
  try {
    const classified = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
    
    // Process shim entries
    const shimEntries = classified.filter(e => e.newStatus === 'shim');
    console.log(`Processing ${shimEntries.length} shim entries...\n`);
    
    shimEntries.forEach(entry => {
      if (entry.type === 'root-script-ps1' || entry.type === 'script-ps1') {
        console.log(`  Creating Windows shim: ${entry.entry}`);
        if (!dryRun) createShimForWindows(entry);
      } else if (entry.type === 'root-script-sh' || entry.type === 'script-sh') {
        console.log(`  Creating Linux shim: ${entry.entry}`);
        if (!dryRun) createShimForLinux(entry);
      }
    });
    
    console.log('\n✅ Canonicalization complete\n');
    
    // Generate report
    const report = generateReport();
    const reportPath = path.join(WORKSPACE_ROOT, 'docs/50-ops/Canonicalization-Actions.md');
    
    if (!dryRun) {
      fs.writeFileSync(reportPath, report, 'utf8');
      console.log(`📄 Action report saved: ${reportPath}\n`);
    } else {
      console.log('─── DRY RUN REPORT ───\n');
      console.log(report);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Parse CLI args
const dryRun = process.argv.includes('--dry-run');
main(dryRun);


