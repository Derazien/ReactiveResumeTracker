#!/usr/bin/env node
/**
 * Documentation Integrity Checker
 * 
 * Validates that all scripts and services are documented in Run-Paths-Catalog.md
 * and that deprecated scripts are not referenced in documentation.
 * 
 * Usage:
 *   node scripts/audit/check-doc-integrity.js
 *   pnpm check:docs
 * 
 * Exit Codes:
 *   0 - All checks passed
 *   1 - Integrity violations found
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ROOT = path.resolve(__dirname, '../..');
const CATALOG_PATH = path.join(ROOT, 'docs/50-ops/Run-Paths-Catalog.md');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const DOCS_DIR = path.join(ROOT, 'docs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(title, 'cyan');
  log('='.repeat(60), 'cyan');
}

// Read and parse Run-Paths-Catalog.md
function parseCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    log(`❌ Run-Paths-Catalog.md not found at ${CATALOG_PATH}`, 'red');
    process.exit(1);
  }

  const content = fs.readFileSync(CATALOG_PATH, 'utf-8');
  const entries = [];
  const deprecated = [];

  // Parse catalog entries (format: | ID | Entry | Type | Status | ...)
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('| RP')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 4) {
        const [id, entry, type, status] = parts;
        entries.push({ id, entry, type, status });
        
        if (status === 'deprecated') {
          deprecated.push(entry);
        }
      }
    }
  }

  return { entries, deprecated };
}

// Get all npm scripts from package.json
function getNpmScripts() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  return Object.keys(packageJson.scripts || {});
}

// Get all script files from scripts directory
function getScriptFiles() {
  const scripts = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!['node_modules', 'dist', '.git'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (['.sh', '.ps1', '.js', '.ts'].includes(ext)) {
          const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');
          scripts.push(relativePath);
        }
      }
    }
  }
  
  walkDir(SCRIPTS_DIR);
  return scripts;
}

// Check if a script is documented in catalog
function isDocumented(scriptName, catalogEntries) {
  // Remove backticks and clean up script name
  const cleanName = scriptName.replace(/`/g, '');
  
  return catalogEntries.some(entry => {
    const cleanEntry = entry.entry.replace(/`/g, '');
    return cleanEntry === cleanName || cleanEntry.includes(cleanName) || cleanName.includes(cleanEntry);
  });
}

// Search for deprecated script references in docs
function findDeprecatedReferences(deprecatedScripts) {
  const violations = [];
  
  function searchInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    for (const deprecated of deprecatedScripts) {
      const cleanScript = deprecated.replace(/`/g, '');
      
      // Skip if this is the catalog file itself (it's allowed to list deprecated items)
      if (filePath === CATALOG_PATH) continue;
      
      // Skip if this is in _archive directory
      if (filePath.includes('_archive')) continue;
      
      // Check if deprecated script is referenced
      if (content.includes(cleanScript)) {
        const lines = content.split('\n');
        const lineNumbers = [];
        
        lines.forEach((line, idx) => {
          if (line.includes(cleanScript)) {
            lineNumbers.push(idx + 1);
          }
        });
        
        if (lineNumbers.length > 0) {
          violations.push({
            file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
            script: cleanScript,
            lines: lineNumbers,
          });
        }
      }
    }
  }
  
  function walkDocs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDocs(fullPath);
      } else if (stat.isFile() && fullPath.endsWith('.md')) {
        searchInFile(fullPath);
      }
    }
  }
  
  walkDocs(DOCS_DIR);
  return violations;
}

// Main execution
function main() {
  logSection('📋 Documentation Integrity Check');
  
  let hasErrors = false;
  
  // Parse catalog
  log('\n📖 Parsing Run-Paths-Catalog.md...', 'gray');
  const { entries, deprecated } = parseCatalog();
  log(`   Found ${entries.length} catalog entries`, 'gray');
  log(`   Found ${deprecated.length} deprecated entries`, 'gray');
  
  // Check 1: npm scripts documentation
  logSection('✅ Check 1: npm Scripts Documentation');
  const npmScripts = getNpmScripts();
  const undocumentedNpm = npmScripts.filter(script => !isDocumented(script, entries));
  
  if (undocumentedNpm.length === 0) {
    log('✅ All npm scripts are documented', 'green');
  } else {
    hasErrors = true;
    log(`❌ Found ${undocumentedNpm.length} undocumented npm scripts:`, 'red');
    undocumentedNpm.forEach(script => {
      log(`   • ${script}`, 'red');
    });
    log('\n💡 Fix: Add these to docs/50-ops/Run-Paths-Catalog.md', 'yellow');
  }
  
  // Check 2: script files documentation
  logSection('✅ Check 2: Script Files Documentation');
  const scriptFiles = getScriptFiles();
  const undocumentedFiles = scriptFiles.filter(file => {
    // Extract just the filename for checking
    const basename = path.basename(file);
    return !isDocumented(basename, entries) && !isDocumented(file, entries);
  });
  
  if (undocumentedFiles.length === 0) {
    log('✅ All script files are documented', 'green');
  } else {
    // This is a warning, not an error (some utility scripts don't need documentation)
    log(`⚠️  Found ${undocumentedFiles.length} potentially undocumented script files:`, 'yellow');
    undocumentedFiles.slice(0, 10).forEach(file => {
      log(`   • ${file}`, 'yellow');
    });
    if (undocumentedFiles.length > 10) {
      log(`   ... and ${undocumentedFiles.length - 10} more`, 'yellow');
    }
    log('\n💡 Note: Utility/audit scripts may not need catalog entries', 'gray');
  }
  
  // Check 3: deprecated script references
  logSection('✅ Check 3: Deprecated Script References');
  const deprecatedRefs = findDeprecatedReferences(deprecated);
  
  if (deprecatedRefs.length === 0) {
    log('✅ No deprecated scripts found in documentation', 'green');
  } else {
    hasErrors = true;
    log(`❌ Found ${deprecatedRefs.length} references to deprecated scripts in docs:`, 'red');
    deprecatedRefs.forEach(({ file, script, lines }) => {
      log(`   • ${file}:${lines.join(',')} → "${script}"`, 'red');
    });
    log('\n💡 Fix: Update these docs to reference canonical commands', 'yellow');
  }
  
  // Summary
  logSection('📊 Summary');
  
  if (hasErrors) {
    log('❌ Documentation integrity check FAILED', 'red');
    log('\nPlease fix the issues above and run:', 'yellow');
    log('   pnpm check:docs', 'cyan');
    log('\nAfter fixing, regenerate documentation:', 'yellow');
    log('   pnpm docs:all', 'cyan');
    process.exit(1);
  } else {
    log('✅ All documentation integrity checks PASSED', 'green');
    log('\n📚 Documentation is up-to-date and consistent!', 'cyan');
    process.exit(0);
  }
}

// Run
try {
  main();
} catch (error) {
  log(`\n❌ Error during integrity check: ${error.message}`, 'red');
  log(error.stack, 'gray');
  process.exit(1);
}







