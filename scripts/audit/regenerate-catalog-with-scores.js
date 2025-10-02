#!/usr/bin/env node

/**
 * Regenerate Run Paths Catalog with Scores
 * 
 * Updates the catalog with scores and final statuses
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CLASSIFICATION_PATH = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Classification.json');
const OUTPUT_FILE = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Catalog.md');

function generateMarkdown(classified) {
  const timestamp = new Date().toISOString();
  
  // Count by status
  const byStatus = {};
  classified.forEach(e => {
    byStatus[e.newStatus] = (byStatus[e.newStatus] || 0) + 1;
  });
  
  let md = `# Run Paths Catalog

> **Generated:** ${timestamp}
> 
> **Purpose:** Comprehensive inventory of all executable paths, commands, and services in the repository.
>
> **Status Legend:**
> - \`canonical\` - Official, documented entry point
> - \`active\` - Used but not primary entry point  
> - \`deprecated\` - Marked for removal or shimming
> - \`shim\` - Redirects to canonical path
> - \`duplicate\` - Redundant with another entry

## Summary

- **Total Entries:** ${classified.length}
- **Canonical:** ${byStatus.canonical || 0}
- **Active:** ${byStatus.active || 0}
- **Deprecated:** ${byStatus.deprecated || 0}
- **Duplicate:** ${byStatus.duplicate || 0}
- **Shim:** ${byStatus.shim || 0}
- **Untriaged:** ${byStatus.untriaged || 0}

## Catalog (with Scores)

| ID | Entry | Type | Status | Refs | Recent | Boot | Overlap | Platform | Replaced By |
|----|-------|------|--------|------|--------|------|---------|----------|-------------|
`;

  // Sort by ID
  classified.sort((a, b) => a.id.localeCompare(b.id));
  
  classified.forEach(entry => {
    const entryDisplay = entry.entry.length > 30 
      ? entry.entry.substring(0, 27) + '...' 
      : entry.entry;
    
    const scores = entry.scores || {};
    const refs = scores.refs !== undefined ? scores.refs : '-';
    const recent = scores.recent !== undefined ? (scores.recent === 9999 ? 'N/A' : `${scores.recent}d`) : '-';
    const boot = scores.boot !== undefined ? scores.boot : '-';
    const overlap = scores.overlap !== undefined ? `${scores.overlap}%` : '-';
    const platform = scores.platform || '-';
    const replacedBy = entry.replacedBy ? entry.replacedBy : '-';
    
    md += `| ${entry.id} | \`${entryDisplay}\` | ${entry.type} | ${entry.newStatus} | ${refs} | ${recent} | ${boot} | ${overlap} | ${platform} | ${replacedBy} |\n`;
  });

  md += `\n## Summary by Status

`;

  Object.entries(byStatus).sort().forEach(([status, count]) => {
    md += `### ${status} (${count} entries)\n\n`;
    
    const entriesOfStatus = classified.filter(e => e.newStatus === status);
    entriesOfStatus.forEach(entry => {
      md += `- **${entry.id}**: \`${entry.entry}\` (${entry.type}) - ${entry.referencedBy}\n`;
    });
    md += '\n';
  });

  md += `---

## Score Legend

- **Refs**: Number of references in repo/docs/CI (git grep)
- **Recent**: Days since last change (lower = more recent)
- **Boot**: 1 if 60-sec smoke test succeeds, 0 otherwise
- **Overlap**: % overlap with canonical commands (higher = more redundant)
- **Platform**: \`cross\` (works everywhere) or \`win-only\` (Windows specific)

## Classification Rules

- **canonical**: Uniquely needed and widely referenced
- **active**: Useful supporting scripts/commands
- **deprecated**: Has overlap + low refs/recent or legacy
- **duplicate**: Exact duplicate of another path (e.g., volume definitions)
- **shim**: Win-only convenience forwarding to canonical

`;

  return md;
}

function main() {
  console.log('📊 Regenerating catalog with scores\n');
  
  try {
    const classified = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf8'));
    console.log(`Processing ${classified.length} entries\n`);
    
    const markdown = generateMarkdown(classified);
    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
    
    console.log(`✅ Catalog updated: ${OUTPUT_FILE}\n`);
    
    // Print summary
    const byStatus = {};
    classified.forEach(e => {
      byStatus[e.newStatus] = (byStatus[e.newStatus] || 0) + 1;
    });
    
    console.log('Summary by Status:');
    console.log('─────────────────────────');
    Object.entries(byStatus).sort().forEach(([status, count]) => {
      console.log(`  ${status.padEnd(12)} ${count}`);
    });
    console.log(`  ${'TOTAL'.padEnd(12)} ${classified.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


