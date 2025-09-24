// 🎯 AUTOMATION ENDPOINTS FOR AUTOMATION CONTROLLER
// Add these endpoints to apps/server/src/automation-integration.controller.ts

// First, update the DTO to include the automation flag
// Add this to libs/dto/src/job-application/create.ts
const UPDATED_CREATE_JOB_APPLICATION_SCHEMA = `
export const createJobApplicationSchema = z.object({
  title: z.string().min(1),
  companyName: z.string().min(1),
  companyId: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  status: z
    .enum([
      "DRAFT",
      "APPLIED", 
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "OFFER_RECEIVED",
      "REJECTED",
      "ACCEPTED",
      "WITHDRAWN",
    ])
    .default("DRAFT"),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  extractedTags: z.array(z.string()).default([]),
  // 🎯 NEW AUTOMATION FIELD
  createdViaAutomation: z.boolean().default(false),
  // Additional optional fields for automation
  location: z.string().optional(),
  salary: z.string().optional(),
  industry: z.string().optional(),
});
`;

// Add these endpoints to AutomationIntegrationController
const AUTOMATION_ENDPOINTS = `
  @Post('create-single-job-application')
  @ApiOperation({ 
    summary: 'Create single job application via automation with company detection',
    description: 'Creates job application with automation flag, checks for existing company and contacts, returns full relationship data'
  })
  async createSingleJobApplication(@User("id") userId: string, @Body() jobData: any) {
    try {
      console.log('🤖 Creating automated job application:', { 
        title: jobData.title, 
        company: jobData.companyName,
        userId 
      });

      // Extract job application data and ensure automation flag is set
      const jobApplicationData = {
        title: jobData.title,
        companyName: jobData.companyName,
        description: jobData.description || null,
        requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
        extractedTags: Array.isArray(jobData.extractedTags) ? jobData.extractedTags : [],
        url: jobData.url || null,
        status: jobData.status || "DRAFT",
        location: jobData.location || null,
        salary: jobData.salary || null,
        industry: jobData.industry || null,
        notes: jobData.notes || null,
        createdViaAutomation: true  // 🎯 AUTOMATION FLAG
      };

      // Use Prisma transaction for consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Check if company exists
        let existingCompany = await tx.company.findFirst({
          where: {
            userId: userId,
            name: {
              equals: jobData.companyName,
              mode: 'insensitive'
            }
          },
          include: {
            contacts: true  // Include existing contacts
          }
        });

        let company = existingCompany;
        let isNewCompany = false;

        // 2. Create company if it doesn't exist
        if (!existingCompany) {
          console.log(\`📢 Creating new company: \${jobData.companyName}\`);
          
          company = await this.companyService.create(userId, {
            name: jobData.companyName,
            description: \`Company entry created via LinkedIn automation for \${jobData.title} position\`,
            industry: jobData.industry || null,
            website: jobData.url ? new URL(jobData.url).origin : null,
          });
          
          isNewCompany = true;
        } else {
          console.log(\`✅ Using existing company: \${existingCompany.name} (ID: \${existingCompany.id})\`);
        }

        // 3. Create job application with company link
        const jobApplication = await this.jobApplicationService.create(
          userId,
          {
            ...jobApplicationData,
            companyId: company.id,
            companyName: company.name,
          },
          { skipEmbeddings: true } // Skip embeddings for automation speed
        );

        // 4. Get contacts associated with this company
        const contacts = await tx.contact.findMany({
          where: {
            companyId: company.id,
            userId: userId
          }
        });

        return {
          jobApplication,
          company: {
            ...company,
            isNew: isNewCompany,
            existingContacts: contacts.length
          },
          contacts,
          metadata: {
            isNewCompany,
            existingContactsCount: contacts.length,
            automationCreated: true
          }
        };
      }, {
        maxWait: 10000,
        timeout: 20000,
      });

      console.log(\`✅ Automated job application created: "\${result.jobApplication.title}" at "\${result.company.name}"\`);

      return {
        success: true,
        message: \`Created automated job application "\${result.jobApplication.title}" at "\${result.company.name}"\`,
        data: {
          jobApplication: result.jobApplication,
          company: result.company,
          contacts: result.contacts,
          // 🎯 DECISION DATA FOR WORKFLOW
          actionableData: {
            companyExists: !result.metadata.isNewCompany,
            hasContacts: result.contacts.length > 0,
            companyId: result.company.id,
            jobApplicationId: result.jobApplication.id,
            contactCount: result.contacts.length,
            // Suggested next actions based on data
            suggestedActions: {
              shouldSearchContacts: result.contacts.length === 0,
              shouldUpdateCompanyInfo: result.metadata.isNewCompany,
              shouldGenerateCoverLetter: true,
              shouldScheduleFollowUp: result.contacts.length > 0
            }
          }
        }
      };

    } catch (error) {
      console.error('❌ Failed to create automated job application:', error);
      return {
        success: false,
        error: 'Failed to create automated job application',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  @Get('job-applications/stats')
  @ApiOperation({ 
    summary: 'Get automation statistics for user',
    description: 'Returns stats on automated vs manual job applications, company creation, etc.'
  })
  async getAutomationStats(@User("id") userId: string) {
    try {
      const [
        totalJobs,
        automatedJobs,
        totalCompanies,
        automatedJobsWithContacts,
      ] = await Promise.all([
        this.prisma.jobApplication.count({
          where: { userId }
        }),
        this.prisma.jobApplication.count({
          where: { userId, createdViaAutomation: true }
        }),
        this.prisma.company.count({
          where: { userId }
        }),
        this.prisma.jobApplication.count({
          where: { 
            userId, 
            createdViaAutomation: true,
            company: {
              contacts: {
                some: {}
              }
            }
          }
        }),
      ]);

      const manualJobs = totalJobs - automatedJobs;
      const automationPercentage = totalJobs > 0 ? (automatedJobs / totalJobs) * 100 : 0;

      return {
        success: true,
        data: {
          jobApplications: {
            total: totalJobs,
            automated: automatedJobs,
            manual: manualJobs,
            automationPercentage: Math.round(automationPercentage * 100) / 100
          },
          companies: {
            total: totalCompanies,
            withAutomatedJobs: automatedJobsWithContacts
          },
          insights: {
            averageJobsPerCompany: totalCompanies > 0 ? Math.round((totalJobs / totalCompanies) * 100) / 100 : 0,
            automationEffectiveness: automatedJobsWithContacts > 0 ? 
              Math.round((automatedJobsWithContacts / automatedJobs) * 100) : 0
          }
        }
      };

    } catch (error) {
      console.error('❌ Failed to get automation stats:', error);
      return {
        success: false,
        error: 'Failed to get automation statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Post('batch-job-applications')
  @ApiOperation({ 
    summary: 'Create multiple job applications from automation workflow',
    description: 'Processes array of job applications from workflow, handles company detection and contact relationships'
  })
  async createBatchJobApplications(@User("id") userId: string, @Body() batchData: any) {
    try {
      console.log(\`🤖 Creating batch of \${batchData.jobs?.length || 0} automated job applications for user \${userId}\`);

      if (!Array.isArray(batchData.jobs) || batchData.jobs.length === 0) {
        return {
          success: false,
          error: 'Invalid request',
          message: 'Jobs array is required and must not be empty'
        };
      }

      const results = [];
      const errors = [];

      // Process each job application
      for (const jobData of batchData.jobs) {
        try {
          const singleResult = await this.createSingleJobApplication(userId, jobData);
          if (singleResult.success) {
            results.push(singleResult.data);
          } else {
            errors.push({
              job: \`\${jobData.title} at \${jobData.companyName}\`,
              error: singleResult.message
            });
          }
        } catch (error) {
          errors.push({
            job: \`\${jobData.title} at \${jobData.companyName}\`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      console.log(\`✅ Batch processing complete: \${results.length} successful, \${errors.length} failed\`);

      return {
        success: true,
        message: \`Processed \${batchData.jobs.length} job applications: \${results.length} successful, \${errors.length} failed\`,
        data: {
          successful: results,
          failed: errors,
          summary: {
            totalProcessed: batchData.jobs.length,
            successful: results.length,
            failed: errors.length,
            successRate: Math.round((results.length / batchData.jobs.length) * 100)
          }
        }
      };

    } catch (error) {
      console.error('❌ Failed to process batch job applications:', error);
      return {
        success: false,
        error: 'Failed to process batch job applications',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
`;

console.log('🎯 AUTOMATION ENDPOINTS FOR AUTOMATION CONTROLLER');
console.log('=================================================');
console.log('');
console.log('📋 DTO UPDATE REQUIRED:');
console.log('File: libs/dto/src/job-application/create.ts');
console.log(UPDATED_CREATE_JOB_APPLICATION_SCHEMA);
console.log('');
console.log('🚀 AUTOMATION CONTROLLER ENDPOINTS:');
console.log('File: apps/server/src/automation-integration.controller.ts');
console.log(AUTOMATION_ENDPOINTS);
console.log('');
console.log('✅ KEY FEATURES:');
console.log('• Uses automation controller exclusively');
console.log('• Sets createdViaAutomation: true automatically');
console.log('• Returns company and contacts data');
console.log('• Detects existing companies to avoid duplicates');
console.log('• Provides actionable data for workflow decisions');
console.log('• Matches existing automation controller patterns');
console.log('• Includes batch processing endpoint');
console.log('• Comprehensive automation statistics');
console.log('');
console.log('📊 RESPONSE STRUCTURE:');
console.log('• jobApplication: Full job application data');
console.log('• company: Company data (with isNew flag)');
console.log('• contacts: Array of existing contacts');
console.log('• actionableData: Decision data for workflow');
console.log('  - companyExists: boolean');
console.log('  - hasContacts: boolean');
console.log('  - suggestedActions: object with next steps');

module.exports = {
  UPDATED_CREATE_JOB_APPLICATION_SCHEMA,
  AUTOMATION_ENDPOINTS
};











