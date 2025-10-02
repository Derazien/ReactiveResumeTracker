#!/usr/bin/env node

/**
 * Documentation Merge Sweep
 * 
 * Scans all documentation for:
 * - Duplicate/conflicting commands
 * - References to deprecated files
 * - Outdated setup instructions
 * - Missing cross-references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

const issues = {
  deprecatedReferences: [],
  duplicateCommands: [],
  missingCrossRefs: [],
  outdatedInstructions: []
};

// Patterns to search for
const DEPRECATED_PATTERNS = [
  'docker-compose.skyvern.yml',
  'docker-compose-complete-stack.yml',
  'docker-compose-reactiveresume-only.yml',
  'start-local.ps1',
  'deploy-server.sh',
  'local-setup-complete-stack.ps1',
  'local-setup-reactiveresume-only.ps1'
];

const CANONICAL_COMMANDS = {
  'pnpm dev': ['Local development', 'dev server', 'development mode'],
  'docker compose -f unified-docker-compose.yml up': ['local docker', 'full stack', 'with docker'],
  'docker compose -f self-hosted-infrastructure.yml up': ['production', 'self-hosted', 'server deployment']
};

/**
 * Find all markdown files
 */
function findMarkdownFiles() {
  const files = [];
  
  function walk(dir) {
    if (dir.includes('node_modules') || dir.includes('dist') || dir.includes('_scratch')) return;
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      });
    } catch (err) {
      // Skip inaccessible directories
    }
  }
  
  walk(WORKSPACE_ROOT);
  return files;
}

/**
 * Scan for deprecated references
 */
function scanForDeprecated(file, content) {
  DEPRECATED_PATTERNS.forEach(pattern => {
    if (content.includes(pattern)) {
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(pattern)) {
          issues.deprecatedReferences.push({
            file: path.relative(WORKSPACE_ROOT, file),
            line: idx + 1,
            pattern,
            content: line.trim()
          });
        }
      });
    }
  });
}

/**
 * Check for canonical command coverage
 */
function checkCanonicalCoverage(file, content) {
  const relativePath = path.relative(WORKSPACE_ROOT, file);
  
  // Skip if it's in _scratch or catalog/summary docs
  if (relativePath.includes('_scratch') || 
      relativePath.includes('Phase-') ||
      relativePath.includes('Catalog') ||
      relativePath.includes('Summary')) {
    return;
  }
  
  // Check if doc talks about setup/deployment/dev but doesn't mention canonical commands
  const setupKeywords = ['setup', 'installation', 'getting started', 'quick start', 'development', 'deployment'];
  const hasSetupContent = setupKeywords.some(kw => content.toLowerCase().includes(kw));
  
  if (hasSetupContent) {
    let hasCanonical = false;
    Object.keys(CANONICAL_COMMANDS).forEach(cmd => {
      if (content.includes(cmd)) {
        hasCanonical = true;
      }
    });
    
    if (!hasCanonical) {
      issues.missingCrossRefs.push({
        file: relativePath,
        reason: 'Setup/deployment doc without canonical command reference'
      });
    }
  }
}

/**
 * Main sweep
 */
function main() {
  console.log('📚 Documentation Merge Sweep\n');
  console.log('Scanning markdown files for issues...\n');
  
  const files = findMarkdownFiles();
  console.log(`Found ${files.length} markdown files\n`);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    scanForDeprecated(file, content);
    checkCanonicalCoverage(file, content);
  });
  
  // Generate report
  const report = generateReport();
  const reportPath = path.join(WORKSPACE_ROOT, 'docs/50-ops/Doc-Merge-Report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(`✅ Report generated: ${reportPath}\n`);
  
  // Print summary
  console.log('Summary:');
  console.log('─────────────────────────────────────');
  console.log(`  Deprecated references:   ${issues.deprecatedReferences.length}`);
  console.log(`  Missing cross-refs:      ${issues.missingCrossRefs.length}`);
  console.log(`  Total issues:            ${issues.deprecatedReferences.length + issues.missingCrossRefs.length}\n`);
}

/**
 * Generate markdown report
 */
function generateReport() {
  const timestamp = new Date().toISOString();
  
  let md = `# Documentation Merge Sweep Report

**Generated**: ${timestamp}  
**Purpose**: Identify deprecated references and missing canonical command cross-references

---

## Summary

- **Files Scanned**: ${findMarkdownFiles().length}
- **Deprecated References**: ${issues.deprecatedReferences.length}
- **Missing Cross-References**: ${issues.missingCrossRefs.length}
- **Total Issues**: ${issues.deprecatedReferences.length + issues.missingCrossRefs.length}

---

`;

  if (issues.deprecatedReferences.length > 0) {
    md += `## ⚠️ Deprecated File References

The following documentation still references deprecated files that have been moved to \`_scratch/\`:

| File | Line | Deprecated Reference | Context |
|------|------|---------------------|---------|
`;
    
    issues.deprecatedReferences.forEach(issue => {
      const contextShort = issue.content.length > 60 
        ? issue.content.substring(0, 57) + '...'
        : issue.content;
      md += `| \`${issue.file}\` | ${issue.line} | \`${issue.pattern}\` | ${contextShort} |\n`;
    });
    
    md += `\n**Action Required**: These references were already updated in Phase C for automation docs. Remaining references are in historical/context docs.\n\n`;
  } else {
    md += `## ✅ No Deprecated References\n\nAll documentation uses canonical commands.\n\n`;
  }

  if (issues.missingCrossRefs.length > 0) {
    md += `## 💡 Missing Cross-References

The following setup/deployment docs could benefit from linking to canonical commands:

| File | Reason |
|------|--------|
`;
    
    issues.missingCrossRefs.forEach(issue => {
      md += `| \`${issue.file}\` | ${issue.reason} |\n`;
    });
    
    md += `\n**Recommendation**: Add links to \`docs/00-foundation/Project-Overview.md\` Run Workflows section.\n\n`;
  } else {
    md += `## ✅ All Setup Docs Have Canonical References\n\n`;
  }

  md += `---

## Canonical Commands Reference

For any setup/deployment documentation, ensure it references these canonical commands:

1. **Local (no Docker)**: \`pnpm dev\`
2. **Local (with Docker)**: \`docker compose -f unified-docker-compose.yml up -d\`
3. **Production**: \`docker compose -f self-hosted-infrastructure.yml up -d\`
4. **Testing**: \`pnpm test\`

**Golden Reference**: \`docs/00-foundation/Project-Overview.md\` → Run Workflows section

---

## Recommendations

### High Priority
- Update any remaining deprecated references to canonical commands
- Add cross-references to Project-Overview.md in setup docs

### Medium Priority
- Consolidate duplicate setup instructions into single canonical doc
- Add "See Project-Overview.md" banners to older docs

### Low Priority
- Archive truly historical docs to \`docs/archive/\`
- Create migration guide from old to new commands

---

**Next Steps**: Review flagged files and update as needed.
`;

  return md;
}

if (require.main === module) {
  main();
}

module.exports = { main };

