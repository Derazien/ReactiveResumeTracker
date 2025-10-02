#!/usr/bin/env node

/**
 * Export OpenAPI Specification (Robust Fallback)
 * 
 * This is the fallback script when build+dist and tsx exports fail.
 * Generates OpenAPI (Swagger) JSON from NestJS server.
 * Output: docs/20-backend/openapi.json
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_PATH = path.join(WORKSPACE_ROOT, 'docs/20-backend/openapi.json');
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/docs-json`;
const SERVER_SRC_DIR = path.join(WORKSPACE_ROOT, 'apps/server/src');

console.log('📖 OpenAPI Export Script (Fallback)\n');

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Get the latest modification time of server source files
 */
function getLatestServerModTime() {
  try {
    let latestTime = 0;
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          checkDir(fullPath);
        } else if (file.name.endsWith('.ts')) {
          const stat = fs.statSync(fullPath);
          if (stat.mtimeMs > latestTime) {
            latestTime = stat.mtimeMs;
          }
        }
      }
    };
    checkDir(SERVER_SRC_DIR);
    return latestTime;
  } catch (err) {
    return 0;
  }
}

/**
 * Check if OpenAPI file is up-to-date
 */
function isUpToDate() {
  if (!fs.existsSync(OUTPUT_PATH)) return false;
  
  try {
    const outputStat = fs.statSync(OUTPUT_PATH);
    const latestServerMod = getLatestServerModTime();
    
    return outputStat.mtimeMs > latestServerMod;
  } catch (err) {
    return false;
  }
}

/**
 * Check if server is running
 */
function isServerRunning() {
  return new Promise(resolve => {
    http.get(API_URL, res => resolve(res.statusCode === 200))
      .on('error', () => resolve(false));
  });
}

/**
 * Fetch OpenAPI spec from server
 */
function fetchSpec() {
  return new Promise((resolve, reject) => {
    http.get(API_URL, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Server returned ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const spec = JSON.parse(data);
          resolve(spec);
        } catch (err) {
          reject(new Error(`Failed to parse JSON: ${err.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Wait for server to be ready (poll up to maxWaitMs)
 */
async function waitForServer(maxWaitMs = 20000) {
  const startTime = Date.now();
  const pollInterval = 1000;
  let lastDot = 0;
  
  process.stdout.write('Waiting for server');
  
  while (Date.now() - startTime < maxWaitMs) {
    if (await isServerRunning()) {
      process.stdout.write(' ✓\n');
      return true;
    }
    
    // Print a dot every second
    const elapsed = Date.now() - startTime;
    if (elapsed - lastDot >= 1000) {
      process.stdout.write('.');
      lastDot = elapsed;
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
  
  process.stdout.write(' ✗\n');
  return false;
}

/**
 * Spawn server temporarily and fetch spec
 */
async function spawnServerAndFetch() {
  const isWindows = process.platform === 'win32';
  const pnpmCmd = isWindows ? 'pnpm.cmd' : 'pnpm';
  
  // Clean dist to avoid stale build issues
  const distServerPath = path.join(WORKSPACE_ROOT, 'dist/apps/server');
  if (fs.existsSync(distServerPath)) {
    console.log('🧹 Cleaning stale dist/apps/server...\n');
    fs.rmSync(distServerPath, { recursive: true, force: true });
  }
  
  console.log('🚀 Starting temporary server instance (pnpm dev:server)...\n');
  
  const serverProcess = spawn(pnpmCmd, ['dev:server'], {
    cwd: WORKSPACE_ROOT,
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'pipe',
    shell: isWindows
  });
  
  let serverOutput = '';
  let serverError = '';
  
  serverProcess.stdout.on('data', data => {
    serverOutput += data.toString();
  });
  
  serverProcess.stderr.on('data', data => {
    serverError += data.toString();
  });
  
  try {
    // Wait for server to be ready
    const ready = await waitForServer(60000);
    
    if (!ready) {
      throw new Error('Server failed to start within 20 seconds');
    }
    
    console.log('\n📥 Fetching OpenAPI specification...\n');
    
    const spec = await fetchSpec();
    
    // Kill the server
    if (isWindows) {
      // On Windows, need to kill the entire process tree
      spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { stdio: 'ignore' });
    } else {
      serverProcess.kill('SIGTERM');
    }
    
    return spec;
  } catch (err) {
    // Kill the server on error
    if (isWindows) {
      spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t'], { stdio: 'ignore' });
    } else {
      serverProcess.kill('SIGTERM');
    }
    
    if (serverError) {
      console.error('\nServer stderr (last 500 chars):', serverError.slice(-500));
    }
    throw err;
  }
}

/**
 * Print first N lines of a file
 */
function printFirstLines(filePath, n = 20) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log('\n📄 First 20 lines of openapi.json:\n');
  console.log('─'.repeat(70));
  lines.slice(0, n).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3, ' ')} | ${line}`);
  });
  console.log('─'.repeat(70));
  console.log(`... (${lines.length} total lines)\n`);
}

/**
 * Main execution
 */
async function main() {
  // Check if file is up-to-date
  if (isUpToDate()) {
    console.log('✅ OpenAPI spec is up-to-date\n');
    console.log(`📍 Location: ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)}\n`);
    printFirstLines(OUTPUT_PATH);
    return;
  }
  
  let spec = null;
  
  // Try fetching from running server
  if (await isServerRunning()) {
    console.log('✅ Server is already running\n');
    console.log('📥 Fetching OpenAPI specification...\n');
    
    try {
      spec = await fetchSpec();
    } catch (err) {
      console.log(`⚠️  Failed to fetch from running server: ${err.message}\n`);
    }
  }
  
  // If not running or fetch failed, spawn server temporarily
  if (!spec) {
    console.log('⚠️  Server is not running, spawning temporarily...\n');
    try {
      spec = await spawnServerAndFetch();
    } catch (err) {
      console.error(`❌ Error spawning server: ${err.message}\n`);
      console.error('💡 Troubleshooting:');
      console.error('   1. Ensure all dependencies are installed: pnpm install');
      console.error('   2. Check that .env file has valid configuration');
      console.error('   3. Try running manually: pnpm dev\n');
      process.exit(1);
    }
  }
  
  // Save the spec
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2), 'utf8');
  
  console.log(`✅ OpenAPI specification exported successfully\n`);
  console.log(`📍 Location: ${path.relative(WORKSPACE_ROOT, OUTPUT_PATH)}`);
  console.log(`📊 Endpoints: ${Object.keys(spec.paths || {}).length}`);
  console.log(`📚 Schemas: ${Object.keys(spec.components?.schemas || {}).length}\n`);
  
  // Print first 20 lines
  printFirstLines(OUTPUT_PATH);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

module.exports = {};
