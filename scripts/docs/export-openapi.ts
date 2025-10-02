#!/usr/bin/env ts-node

/**
 * Export OpenAPI Specification
 * 
 * Starts the NestJS server briefly to extract the Swagger/OpenAPI document
 * and saves it to docs/20-backend/openapi.json
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../../apps/server/src/app.module';
import { patchNestJsSwagger } from 'nestjs-zod';

patchNestJsSwagger();

async function exportOpenAPI() {
  console.log('🚀 Exporting OpenAPI specification...\n');

  // Create NestJS application without listening
  const app = await NestFactory.create(AppModule, {
    logger: false, // Suppress logs during export
  });

  // Build Swagger document (matching main.ts config)
  const config = new DocumentBuilder()
    .setTitle('ReactiveResumeTracker API')
    .setDescription(
      'ReactiveResumeTracker is an enhanced fork of Reactive Resume with AI-powered job application tracking, smart content library, RAG-based content matching, and automated cover letter generation.',
    )
    .addCookieAuth('Authentication', { type: 'http', in: 'cookie', scheme: 'Bearer' })
    .setVersion('4.4.6')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.example.com', 'Production')
    .addTag('resume', 'Resume management endpoints')
    .addTag('job-application', 'Job application tracking endpoints')
    .addTag('content-library', 'Content library management endpoints')
    .addTag('llm', 'LLM integration endpoints')
    .addTag('cover-letter', 'Cover letter generation endpoints')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ensure output directory exists
  const outputDir = path.resolve(__dirname, '../../docs/20-backend');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write OpenAPI JSON
  const outputPath = path.join(outputDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');

  console.log(`✅ OpenAPI specification exported to: ${outputPath}`);
  console.log(`📊 Endpoints: ${Object.keys(document.paths || {}).length}`);
  console.log(`📦 Schemas: ${Object.keys(document.components?.schemas || {}).length}\n`);

  await app.close();
  process.exit(0);
}

exportOpenAPI().catch((err) => {
  console.error('❌ Failed to export OpenAPI:', err);
  process.exit(1);
});

