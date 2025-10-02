#!/usr/bin/env node

/**
 * Run Paths Catalog Generator
 * 
 * Generates an inventory of all run paths in the repository:
 * - package.json scripts (all workspaces)
 * - docker-compose files with yml extension and services/profiles
 * - script files with common extensions (sh, bash, zsh, js, ts, py, ps1)
 * - code blocks in README and docs markdown files referencing commands
 * 
 * Output: docs/50-ops/Run-Paths-Catalog.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_FILE = path.join(WORKSPACE_ROOT, 'docs/50-ops/Run-Paths-Catalog.md');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let idCounter = 1;
const catalog = [];

/**
 * Add entry to catalog
 */
function addEntry(entry, type, referencedBy, command = null, description = null) {
  catalog.push({
    id: `RP${String(idCounter++).padStart(4, '0')}`,
    entry,
    type,
    referencedBy,
    command,
    description,
    status: 'untriaged' // Will be updated by classification
  });
}

/**
 * Apply classification to catalog
 */
function applyClassification() {
  const classifyScript = path.join(__dirname, 'classify-runpaths.js');
  const { classifyEntry } = require(classifyScript);
  
  catalog.forEach(entry => {
    entry.status = classifyEntry(entry);
  });
}

/**
 * Find all package.json files
 */
function findPackageJsonFiles() {
  console.log('📦 Scanning package.json files...');
  
  const packageFiles = [
    'package.json',
    'apps/server/package.json',
    'apps/client/package.json', 
    'apps/artboard/package.json',
    'libs/dto/package.json',
    'libs/hooks/package.json',
    'libs/parser/package.json',
    'libs/schema/package.json',
    'libs/ui/package.json',
    'libs/utils/package.json',
    'services/skyvern/skyvern-frontend/package.json',
    'services/skyvern/integrations/n8n/package.json'
  ];

  packageFiles.forEach(file => {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(fullPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (pkg.scripts) {
          Object.entries(pkg.scripts).forEach(([scriptName, scriptCommand]) => {
            addEntry(
              scriptName,
              'npm-script',
              file,
              scriptCommand,
              `Script from ${file}`
            );
          });
        }
      } catch (err) {
        console.warn(`  ⚠️  Failed to parse ${file}: ${err.message}`);
      }
    }
  });
}

/**
 * Parse docker-compose files
 */
function parseDockerComposeFiles() {
  console.log('🐳 Scanning docker-compose*.yml files...');
  
  const composeFiles = [
    'docker-compose.skyvern.yml',
    'unified-docker-compose.yml',
    'self-hosted-infrastructure.yml',
    'scripts/docker/docker-compose-complete-stack.yml',
    'scripts/docker/docker-compose-reactiveresume-only.yml',
    'services/skyvern/docker-compose.yml'
  ];

  composeFiles.forEach(file => {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Simple regex-based parsing (not YAML parser, but sufficient for our needs)
        const serviceMatches = content.matchAll(/^\s{0,2}(\w[\w-]*):(?=\s*$)/gm);
        
        for (const match of serviceMatches) {
          const serviceName = match[1];
          // Skip known YAML keys that aren't services
          if (!['version', 'volumes', 'networks', 'configs', 'secrets'].includes(serviceName)) {
            addEntry(
              serviceName,
              'docker-service',
              file,
              `docker compose -f ${file} up ${serviceName}`,
              `Service from ${file}`
            );
          }
        }
        
        // Look for profiles
        const profileMatches = content.matchAll(/profiles:\s*\n\s*-\s*["']?(\w+)["']?/g);
        for (const match of profileMatches) {
          addEntry(
            match[1],
            'docker-profile',
            file,
            `docker compose -f ${file} --profile ${match[1]} up`,
            `Profile from ${file}`
          );
        }
      } catch (err) {
        console.warn(`  ⚠️  Failed to parse ${file}: ${err.message}`);
      }
    }
  });
}

/**
 * Find all scripts in scripts directory
 */
function findScriptFiles() {
  console.log('📜 Scanning scripts/**/* files...');
  
  const extensions = ['.sh', '.bash', '.zsh', '.js', '.ts', '.py', '.ps1'];
  
  function walkDir(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const scriptPath = `scripts/${relPath}`;
          addEntry(
            entry.name,
            `script-${ext.slice(1)}`,
            scriptPath,
            scriptPath,
            `Script file: ${scriptPath}`
          );
        }
      }
    });
  }
  
  const scriptsDir = path.join(WORKSPACE_ROOT, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    walkDir(scriptsDir);
  }
}

/**
 * Find root-level scripts
 */
function findRootScripts() {
  console.log('🔧 Scanning root-level scripts...');
  
  const rootScripts = [
    'start-local.ps1',
    'deploy-server.sh',
    'test-import.ps1',
    'test-local-postgres.ps1',
    'copy-arc-to-docker.ps1'
  ];

  rootScripts.forEach(file => {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(fullPath)) {
      const ext = path.extname(file).slice(1);
      addEntry(
        file,
        `root-script-${ext}`,
        '.',
        `./${file}`,
        `Root-level script: ${file}`
      );
    }
  });
}

/**
 * Parse markdown files for command references
 */
function parseMarkdownFiles() {
  console.log('📝 Scanning markdown files for command references...');
  
  const mdFiles = [
    'README.md',
    'CONTRIBUTING.md',
    ...findMarkdownInDocs()
  ];

  mdFiles.forEach(file => {
    const fullPath = path.join(WORKSPACE_ROOT, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Match code blocks with common shell/command patterns
        const codeBlockRegex = /```(?:bash|sh|shell|powershell|ps1|javascript|js|typescript|ts)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
          const codeBlock = match[1];
          
          // Look for common command patterns
          const commandPatterns = [
            /(?:^|\n)\s*(?:npm|pnpm|yarn)\s+(?:run\s+)?(\S+)/g,
            /(?:^|\n)\s*(?:docker|docker-compose|docker\s+compose)\s+([^\n]+)/g,
            /(?:^|\n)\s*(?:nx)\s+([^\n]+)/g,
            /(?:^|\n)\s*\.\/([^\s\n]+\.(?:sh|ps1|js))/g,
            /(?:^|\n)\s*(?:node|ts-node)\s+([^\s\n]+)/g
          ];
          
          commandPatterns.forEach(pattern => {
            let cmdMatch;
            while ((cmdMatch = pattern.exec(codeBlock)) !== null) {
              addEntry(
                cmdMatch[1].trim(),
                'docs-command',
                file,
                cmdMatch[0].trim(),
                `Command referenced in ${file}`
              );
            }
          });
        }
      } catch (err) {
        console.warn(`  ⚠️  Failed to parse ${file}: ${err.message}`);
      }
    }
  });
}

/**
 * Find all markdown files in docs directory
 */
function findMarkdownInDocs() {
  const result = [];
  
  function walkDir(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        result.push(`docs/${relPath}`);
      }
    });
  }
  
  walkDir(path.join(WORKSPACE_ROOT, 'docs'));
  return result;
}

/**
 * Generate markdown table
 */
function generateMarkdown() {
  console.log('📊 Generating catalog...');
  
  const timestamp = new Date().toISOString();
  
  let md = `# Run Paths Catalog

> **Generated:** ${timestamp}
> 
> **Purpose:** Comprehensive inventory of all executable paths, commands, and services in the repository.
>
> **Status Legend:**
> - \`untriaged\` - Not yet reviewed for canonicalization
> - \`canonical\` - Official, documented entry point
> - \`deprecated\` - Marked for removal or shimming
> - \`shim\` - Redirects to canonical path
> - \`duplicate\` - Redundant with another entry

## Summary

- **Total Entries:** ${catalog.length}
- **NPM Scripts:** ${catalog.filter(e => e.type === 'npm-script').length}
- **Docker Services:** ${catalog.filter(e => e.type === 'docker-service').length}
- **Docker Profiles:** ${catalog.filter(e => e.type === 'docker-profile').length}
- **Script Files:** ${catalog.filter(e => e.type.startsWith('script-')).length}
- **Root Scripts:** ${catalog.filter(e => e.type.startsWith('root-script-')).length}
- **Doc Commands:** ${catalog.filter(e => e.type === 'docs-command').length}

## Catalog

| ID | Entry | Type | Referenced By | Status |
|----|-------|------|---------------|--------|
`;

  catalog.forEach(entry => {
    const entryDisplay = entry.entry.length > 40 
      ? entry.entry.substring(0, 37) + '...' 
      : entry.entry;
    const refDisplay = entry.referencedBy.length > 40 
      ? entry.referencedBy.substring(0, 37) + '...' 
      : entry.referencedBy;
    
    md += `| ${entry.id} | \`${entryDisplay}\` | ${entry.type} | \`${refDisplay}\` | ${entry.status} |\n`;
  });

  md += `\n## Detailed Entries

`;

  // Group by type
  const byType = {};
  catalog.forEach(entry => {
    if (!byType[entry.type]) {
      byType[entry.type] = [];
    }
    byType[entry.type].push(entry);
  });

  Object.entries(byType).sort().forEach(([type, entries]) => {
    md += `### ${type} (${entries.length} entries)\n\n`;
    
    entries.forEach(entry => {
      md += `#### ${entry.id}: \`${entry.entry}\`\n\n`;
      md += `- **Referenced By:** \`${entry.referencedBy}\`\n`;
      if (entry.command) {
        md += `- **Command:** \`${entry.command}\`\n`;
      }
      if (entry.description) {
        md += `- **Description:** ${entry.description}\n`;
      }
      md += `- **Status:** ${entry.status}\n\n`;
    });
  });

  md += `---

## Next Steps (Phase B)

1. Review catalog and identify canonical commands per use-case
2. Mark duplicates and deprecated entries
3. Create shims for backward compatibility
4. Update documentation to reference canonical paths only

`;

  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 Run Paths Catalog Generator\n');
  console.log(`Workspace: ${WORKSPACE_ROOT}\n`);
  
  try {
    // Gather all run paths
    findPackageJsonFiles();
    parseDockerComposeFiles();
    findScriptFiles();
    findRootScripts();
    parseMarkdownFiles();
    
    // Apply classification
    console.log('🔍 Applying classification...\n');
    applyClassification();
    
    // Generate markdown
    const markdown = generateMarkdown();
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, markdown, 'utf8');
    
    console.log(`\n✅ Catalog generated: ${OUTPUT_FILE}`);
    console.log(`📊 Total entries: ${catalog.length}\n`);
    
    // Print summary by status
    console.log('Summary by Status:');
    console.log('─────────────────────────────────────');
    const byStatus = {};
    catalog.forEach(entry => {
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
    });
    Object.entries(byStatus).sort().forEach(([status, count]) => {
      console.log(`  ${status.padEnd(15)} ${count}`);
    });
    
    console.log('\nSummary by Type:');
    console.log('─────────────────────────────────────');
    const byType = {};
    catalog.forEach(entry => {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
    });
    Object.entries(byType).sort().forEach(([type, count]) => {
      console.log(`  ${type.padEnd(25)} ${count}`);
    });
    
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

module.exports = { main };

