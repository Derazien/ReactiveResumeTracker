const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs').promises;
const Anthropic = require('@anthropic-ai/sdk');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const dbPath = path.resolve(__dirname, '../apps/server/prisma/dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let cohere = null;
let CohereClient = null;

try {
  const cohereApiKey = process.env.COHERE_API_KEY || process.env.CO_API_KEY;
  
  if (!cohereApiKey) {
    console.error('❌ FATAL: Cohere API key required!');
    process.exit(1);
  }
  
  CohereClient = require('cohere-ai').CohereClient;
  cohere = new CohereClient({
    apiKey: cohereApiKey,
  });
  console.log('✅ Cohere client initialized');
} catch (error) {
  console.error('❌ FATAL: Cohere package not installed!');
  process.exit(1);
}

class JobEmbeddingService {
  constructor() {
    this.transformedData = [];
    this.errors = [];
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      errors: 0,
      dbUpdates: 0
    };
  }

  async run(dryRun = true, testMode = true) {
    console.log('🚀 Starting Job Application Embedding Setup');
    console.log('📁 Database:', dbPath);
    console.log('🧪 Test Mode:', testMode ? 'ON (processing first 5 jobs)' : 'OFF (processing all jobs)');
    console.log('💾 Dry Run:', dryRun ? 'ON (no database updates)' : 'OFF (will update database)');
    
    try {
      await this.addEmbeddingColumns();
      
      const jobApplications = await this.loadJobApplications(testMode);
      this.stats.total = jobApplications.length;
      
      console.log(`\n📋 Found ${jobApplications.length} job applications to process`);
      
      for (const job of jobApplications) {
        await this.processJobApplication(job);
        this.stats.processed++;
      }
      
      await this.saveResultsToJson();
      
      if (!dryRun) {
        await this.updateDatabase();
      } else {
        console.log('\n🔍 DRY RUN MODE - No database updates performed');
      }
      
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Fatal error:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  async addEmbeddingColumns() {
    console.log('\n📝 Adding embedding columns to JobApplication table...');
    
    const columns = [
      { name: 'structuredData', sql: 'ALTER TABLE JobApplication ADD COLUMN structuredData TEXT' },
      { name: 'embedding', sql: 'ALTER TABLE JobApplication ADD COLUMN embedding TEXT' },
      { name: 'embeddingHash', sql: 'ALTER TABLE JobApplication ADD COLUMN embeddingHash TEXT' },
      { name: 'transformationDate', sql: 'ALTER TABLE JobApplication ADD COLUMN transformationDate DATETIME' },
      { name: 'transformationNotes', sql: 'ALTER TABLE JobApplication ADD COLUMN transformationNotes TEXT' }
    ];
    
    for (const column of columns) {
      try {
        await prisma.$executeRawUnsafe(column.sql);
        console.log(`✅ Added "${column.name}" column`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Column "${column.name}" already exists`);
        } else {
          throw error;
        }
      }
    }
  }

  async loadJobApplications(testMode = true) {
    console.log('\n📂 Loading job applications...');
    
    const query = {
      orderBy: { createdAt: 'desc' }
    };
    
    if (testMode) {
      query.take = 5;
    }
    
    const jobs = await prisma.jobApplication.findMany(query);
    console.log(`📋 Loaded ${jobs.length} job applications`);
    
    return jobs;
  }

  async processJobApplication(job) {
    try {
      console.log(`\n🔄 Processing: ${job.title || job.company || `Job ${job.id}`}`);
      
      const structuredData = await this.llmTransform(job);
      const embedding = await this.generateEmbedding(job, structuredData);
      
      const result = {
        id: job.id,
        title: job.title,
        company: job.company,
        originalData: this.extractJobData(job),
        structuredData: structuredData,
        embedding: embedding,
        embeddingHash: this.generateEmbeddingHash(job),
        transformationDate: new Date().toISOString(),
        transformationNotes: `Transformed job application for content matching using LLM`
      };
      
      this.transformedData.push(result);
      this.stats.success++;
      
      console.log(`✅ Processed: ${job.title || job.company || `Job ${job.id}`}`);
      
    } catch (error) {
      console.error(`❌ Error processing job ${job.id}:`, error.message);
      this.errors.push({
        id: job.id,
        title: job.title || job.company || `Job ${job.id}`,
        error: error.message
      });
      this.stats.errors++;
    }
  }

  async llmTransform(job) {
    const prompt = `Transform this job application into a structured format optimized for matching with candidate content.

JOB APPLICATION DATA:
${JSON.stringify(this.extractJobData(job), null, 2)}

INSTRUCTIONS:
1. Extract and structure all relevant job information
2. Focus on skills, requirements, responsibilities, and qualifications
3. Create a comprehensive structure that can be matched against candidate content
4. Include job details, requirements, and preferences
5. Format in a way that enables semantic matching with candidate skills and experience
6. CRITICAL: Return ONE single JSON object (not an array of objects). Internal arrays within the object are expected and correct.

EXPECTED STRUCTURE:
{
  "title": "Job title",
  "company": "Company name",
  "location": "Job location",
  "type": "Full-time/Part-time/Contract",
  "requirements": {
    "skills": ["skill1", "skill2", "skill3"],
    "technologies": ["tech1", "tech2"],
    "languages": ["language1", "language2"],
    "certifications": ["cert1", "cert2"],
    "experience": "X years of experience",
    "education": "Required education level"
  },
  "responsibilities": [
    "Responsibility 1",
    "Responsibility 2",
    "Responsibility 3"
  ],
  "preferences": {
    "niceToHave": ["preference1", "preference2"],
    "industry": "Industry focus",
    "remote": "Remote work policy"
  },
  "summary": "Brief job description for matching"
}

RESPONSE FORMAT:
Return ONLY a single JSON object that matches the structure above. Do NOT return an array of multiple objects. Internal arrays within the object are expected and correct. Do not include any other text or explanation.`;

    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    let content = response.content[0].text.trim();
    
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      return JSON.parse(content.trim());
    } catch (parseError) {
      throw new Error(`LLM response parsing failed: ${parseError.message}`);
    }
  }

  async generateEmbedding(job, structuredData) {
    const textToEmbed = this.prepareTextForEmbedding(job, structuredData);
    
    try {
      const response = await cohere.embed({
        texts: [textToEmbed],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
        embedding_types: ['float']
      });
      
      return response.embeddings.float[0];
    } catch (error) {
      try {
        const fallbackResponse = await cohere.embed({
          texts: [textToEmbed],
          model: 'embed-v4.0',
          input_type: 'search_document',
          embedding_types: ['float']
        });
        return fallbackResponse.embeddings.float[0];
      } catch (fallbackError) {
        throw new Error(`Embedding generation failed: ${fallbackError.message}`);
      }
    }
  }

  prepareTextForEmbedding(job, structuredData) {
    const extractText = (obj, depth = 0) => {
      if (depth > 3) return '';
      
      const texts = [];
      for (const [key, value] of Object.entries(obj || {})) {
        if (typeof value === 'string' && value.length > 0) {
          const cleanValue = value.replace(/<[^>]*>/g, ' ').trim();
          if (cleanValue.length > 0) {
            texts.push(cleanValue);
          }
        } else if (Array.isArray(value)) {
          texts.push(value.join(', '));
        } else if (typeof value === 'object' && value !== null) {
          texts.push(extractText(value, depth + 1));
        }
      }
      return texts.filter(Boolean).join(' ');
    };
    
    const textFields = [
      job.title,
      job.company,
      job.description,
      job.requirements,
      job.location,
      extractText(structuredData)
    ].filter(Boolean);
    
    return textFields.join(' | ');
  }

  generateEmbeddingHash(job) {
    const crypto = require('crypto');
    const hashData = JSON.stringify({
      id: job.id,
      title: job.title,
      company: job.company,
      updatedAt: job.updatedAt
    });
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  extractJobData(job) {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary: job.salary,
      type: job.type,
      status: job.status,
      url: job.url,
      notes: job.notes,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  async updateDatabase() {
    console.log('\n💾 Updating database...');
    
    for (const item of this.transformedData) {
      try {
        console.log(`🔄 Updating database for: ${item.title}`);
        
        await prisma.jobApplication.update({
          where: { id: item.id },
          data: {
            embedding: JSON.stringify(item.embedding),
            embeddingHash: item.embeddingHash
          }
        });
        
        this.stats.dbUpdates++;
        console.log(`✅ Updated database for: ${item.title}`);
        
      } catch (error) {
        console.error(`❌ Database update failed for ${item.title}:`, error.message);
        this.errors.push({
          id: item.id,
          title: item.title,
          error: `Database update failed: ${error.message}`,
          phase: 'database_update'
        });
      }
    }
    
    console.log(`📋 Database updates completed: ${this.stats.dbUpdates}/${this.transformedData.length} successful`);
  }

  async saveResultsToJson() {
    console.log('\n💾 Saving results to JSON file...');
    
    const cleanedTransformedData = this.transformedData.map(item => {
      const { embedding, ...cleanItem } = item;
      return cleanItem;
    });
    
    const outputData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalJobs: this.stats.total,
        successfulTransformations: this.stats.success,
        errors: this.stats.errors,
        llmModel: process.env.ANTHROPIC_MODEL,
        embeddingModel: 'embed-english-v3.0 or embed-v4.0',
        purpose: 'Job application embedding for content matching',
        note: 'Embeddings stored in database only (not in JSON to reduce file size)'
      },
      transformedData: cleanedTransformedData,
      errors: this.errors,
      stats: this.stats
    };
    
    const outputPath = path.join(__dirname, 'job-embedding-results.json');
    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
    
    const fileSizeKB = (await fs.stat(outputPath)).size / 1024;
    console.log(`✅ Results saved to: ${outputPath}`);
    console.log(`📊 File size: ${fileSizeKB.toFixed(1)} KB`);
  }

  displaySummary() {
    console.log('\n📊 JOB EMBEDDING SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📋 Total jobs processed: ${this.stats.total}`);
    console.log(`✅ Successful transformations: ${this.stats.success}`);
    console.log(`❌ Errors: ${this.stats.errors}`);
    console.log(`💾 Database updates: ${this.stats.dbUpdates}`);
    console.log(`🧠 LLM Model: ${process.env.ANTHROPIC_MODEL}`);
    console.log(`🔍 Embedding Model: embed-english-v3.0 (fallback: embed-v4.0)`);
    
    if (this.stats.success > 0) {
      console.log('\n✅ SUCCESS DETAILS:');
      console.log('   - Jobs structured for content matching');
      console.log('   - Generated embeddings: 1024 dimensions');
      console.log('   - Ready for RAG-based job-content matching');
      console.log('   - Embeddings stored in database only');
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => {
        console.log(`   - ${error.title}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Review the JSON output file for quality');
    console.log('   2. If satisfied, run with dryRun=false to update database');
    console.log('   3. Implement RAG matching logic between jobs and content');
    console.log('   4. Test job-content matching functionality');
  }
}

async function main() {
  const service = new JobEmbeddingService();
  
  const dryRun = false;  // Set to false to update database
  const testMode = true;  // Set to false to process all jobs
  
  await service.run(dryRun, testMode);
}

if (require.main === module) {
  main().catch(console.error);
} 