#!/usr/bin/env node

/**
 * Export OpenAPI Specification
 * 
 * Creates a temporary NestJS app instance to extract Swagger document
 * and saves it to docs/20-backend/openapi.json
 */

const fs = require('fs');
const path = require('path');

console.log('📖 OpenAPI Export Script\n');
console.log('⚠️  Note: This requires the server to be built first\n');
console.log('Alternative: Start server with NODE_ENV=development and run:');
console.log('  curl http://localhost:3000/docs-json > docs/20-backend/openapi.json\n');
console.log('Creating placeholder OpenAPI spec...\n');

// Ensure output directory exists
const outputDir = path.join(__dirname, '../../docs/20-backend');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create placeholder OpenAPI spec (will be generated when server starts)
const placeholderSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ReactiveResumeTracker API',
    description: 'API documentation for ReactiveResumeTracker. To generate full spec, start the server and visit http://localhost:3000/docs or run: curl http://localhost:3000/docs-json > docs/20-backend/openapi.json',
    version: '4.4.6',
    contact: {
      name: 'ReactiveResumeTracker',
      url: 'https://github.com/your-repo/ReactiveResumeTracker'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development'
    }
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['health'],
        summary: 'Health check endpoint',
        description: 'Returns the health status of the application and its dependencies',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    info: { type: 'object' },
                    error: { type: 'object' },
                    details: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {},
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'Authentication'
      }
    }
  },
  tags: [
    { name: 'resume', description: 'Resume management endpoints' },
    { name: 'job-application', description: 'Job application tracking endpoints' },
    { name: 'content-library', description: 'Content library management endpoints' },
    { name: 'llm', description: 'LLM integration endpoints' },
    { name: 'cover-letter', description: 'Cover letter generation endpoints' },
    { name: 'auth', description: 'Authentication endpoints' },
    { name: 'health', description: 'Health check endpoints' }
  ],
  _note: 'This is a placeholder. For full API spec, start the server and visit /docs or run: pnpm dev (in another terminal), then curl http://localhost:3000/docs-json > docs/20-backend/openapi.json'
};

const outputPath = path.join(outputDir, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(placeholderSpec, null, 2), 'utf8');

console.log(`✅ Placeholder OpenAPI specification created: ${outputPath}`);
console.log(`\n📝 To generate full spec:`);
console.log(`   1. Start server: pnpm dev`);
console.log(`   2. In another terminal: curl http://localhost:3000/docs-json > docs/20-backend/openapi.json`);
console.log(`   OR visit: http://localhost:3000/docs (Swagger UI)\n`);

process.exit(0);

