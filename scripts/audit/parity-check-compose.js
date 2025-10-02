#!/usr/bin/env node

/**
 * Docker Compose Parity Check
 * 
 * Compares deprecated compose files with canonical ones to ensure
 * no services, env vars, ports, volumes, or healthchecks are lost
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');

const comparisons = [
  {
    deprecated: 'docker-compose.skyvern.yml',
    canonical: 'unified-docker-compose.yml',
    type: 'dev'
  },
  {
    deprecated: 'scripts/docker/docker-compose-complete-stack.yml',
    canonical: 'unified-docker-compose.yml',
    type: 'dev'
  },
  {
    deprecated: 'scripts/docker/docker-compose-reactiveresume-only.yml',
    canonical: 'unified-docker-compose.yml',
    type: 'dev'
  },
  {
    deprecated: 'services/skyvern/docker-compose.yml',
    canonical: 'unified-docker-compose.yml',
    type: 'dev'
  }
];

function parseYamlServices(yamlContent) {
  const services = {};
  const lines = yamlContent.split('\n');
  
  let currentService = null;
  let inServices = false;
  
  for (const line of lines) {
    if (line.match(/^services:\s*$/)) {
      inServices = true;
      continue;
    }
    
    if (inServices && line.match(/^[a-z]/)) {
      inServices = false; // New top-level section
    }
    
    if (inServices && line.match(/^  ([a-zA-Z0-9_-]+):\s*$/)) {
      currentService = line.match(/^  ([a-zA-Z0-9_-]+):\s*$/)[1];
      if (!['volumes', 'networks'].includes(currentService)) {
        services[currentService] = { name: currentService, ports: [], env: [], volumes: [], healthcheck: false };
      }
    }
    
    if (currentService && services[currentService]) {
      if (line.includes('ports:') || line.match(/^\s+- ["']?\d+:\d+/)) {
        const portMatch = line.match(/["']?(\d+:\d+)/);
        if (portMatch) {
          services[currentService].ports.push(portMatch[1]);
        }
      }
      
      if (line.includes('environment:') || line.match(/^\s+- [A-Z_]+=/) || line.match(/^\s+[A-Z_]+:/)) {
        const envMatch = line.match(/[A-Z_][A-Z0-9_]*(?:=|:)/);
        if (envMatch) {
          const envKey = envMatch[0].replace(/[=:]$/, '');
          if (!services[currentService].env.includes(envKey)) {
            services[currentService].env.push(envKey);
          }
        }
      }
      
      if (line.includes('healthcheck:')) {
        services[currentService].healthcheck = true;
      }
    }
  }
  
  return services;
}

function compareCompose(deprecatedPath, canonicalPath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Comparing: ${deprecatedPath}`);
  console.log(`Against:   ${canonicalPath}`);
  console.log('='.repeat(80));
  
  const depFile = path.join(WORKSPACE_ROOT, deprecatedPath);
  const canFile = path.join(WORKSPACE_ROOT, canonicalPath);
  
  if (!fs.existsSync(depFile)) {
    console.log(`⚠️  Deprecated file not found: ${deprecatedPath}`);
    return { missing: [], extra: [] };
  }
  
  const depContent = fs.readFileSync(depFile, 'utf8');
  const canContent = fs.readFileSync(canFile, 'utf8');
  
  const depServices = parseYamlServices(depContent);
  const canServices = parseYamlServices(canContent);
  
  const depNames = Object.keys(depServices);
  const canNames = Object.keys(canServices);
  
  const missing = depNames.filter(s => !canNames.includes(s));
  const extra = canNames.filter(s => !depNames.includes(s));
  const common = depNames.filter(s => canNames.includes(s));
  
  console.log(`\nServices in deprecated: ${depNames.length}`);
  console.log(`Services in canonical:  ${canNames.length}`);
  console.log(`Missing in canonical:   ${missing.length}`);
  console.log(`Extra in canonical:     ${extra.length}`);
  console.log(`Common services:        ${common.length}`);
  
  if (missing.length > 0) {
    console.log(`\n⚠️  MISSING SERVICES in canonical:`);
    missing.forEach(s => {
      console.log(`  - ${s}`);
      console.log(`    Ports: ${depServices[s].ports.join(', ') || 'none'}`);
      console.log(`    Env vars: ${depServices[s].env.length}`);
      console.log(`    Healthcheck: ${depServices[s].healthcheck ? 'yes' : 'no'}`);
    });
  } else {
    console.log(`\n✅ All services present in canonical`);
  }
  
  if (extra.length > 0) {
    console.log(`\n✨ EXTRA SERVICES in canonical (not in deprecated):`);
    extra.forEach(s => console.log(`  - ${s}`));
  }
  
  // Check for config differences in common services
  console.log(`\n📊 Configuration Differences (Common Services):`);
  let diffCount = 0;
  
  common.forEach(serviceName => {
    const dep = depServices[serviceName];
    const can = canServices[serviceName];
    
    const portsDiff = dep.ports.filter(p => !can.ports.includes(p));
    const envDiff = dep.env.filter(e => !can.env.includes(e));
    
    if (portsDiff.length > 0 || envDiff.length > 0 || (dep.healthcheck && !can.healthcheck)) {
      diffCount++;
      console.log(`\n  ${serviceName}:`);
      if (portsDiff.length > 0) {
        console.log(`    Missing ports: ${portsDiff.join(', ')}`);
      }
      if (envDiff.length > 0) {
        console.log(`    Missing env vars: ${envDiff.join(', ')}`);
      }
      if (dep.healthcheck && !can.healthcheck) {
        console.log(`    Missing healthcheck`);
      }
    }
  });
  
  if (diffCount === 0) {
    console.log(`  ✅ No configuration differences found`);
  }
  
  return { missing, extra, diffCount };
}

function main() {
  console.log('🔍 Docker Compose Parity Check\n');
  console.log('Comparing deprecated compose files against canonical files\n');
  
  const results = [];
  
  comparisons.forEach(comp => {
    const result = compareCompose(comp.deprecated, comp.canonical);
    results.push({ ...comp, ...result });
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log('='.repeat(80));
  
  let totalMissing = 0;
  let totalDiffs = 0;
  
  results.forEach(r => {
    console.log(`\n${r.deprecated}:`);
    console.log(`  Missing services: ${r.missing.length}`);
    console.log(`  Config differences: ${r.diffCount}`);
    console.log(`  Status: ${r.missing.length === 0 && r.diffCount === 0 ? '✅ Parity OK' : '⚠️  Review needed'}`);
    
    totalMissing += r.missing.length;
    totalDiffs += r.diffCount;
  });
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`FINAL: ${totalMissing === 0 && totalDiffs === 0 ? '✅ ALL FILES HAVE PARITY' : '⚠️  REVIEW NEEDED'}`);
  console.log('='.repeat(80));
  console.log('');
}

if (require.main === module) {
  main();
}

module.exports = { main };

