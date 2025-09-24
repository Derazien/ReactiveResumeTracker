import { Controller, Post, Body, Get, Query, UseGuards, Delete, Param, Headers, BadRequestException, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiHeader } from '@nestjs/swagger';
import { CreateAutomatedJobDto, CreateAutomationJobApplicationDto, CreateAutomationCompanyContactsDto } from '@reactive-resume/dto';
import { PrismaService } from 'nestjs-prisma';
import type { Contact } from '@prisma/client';
import * as crypto from 'crypto';
import { Request } from 'express';

import { TwoFactorGuard } from '@/server/auth/guards/two-factor.guard';
import { Public } from '@/server/auth/decorators/public.decorator';
import { User } from '@/server/user/decorators/user.decorator';
import { JobApplicationService } from '@/server/job-application/job-application.service';
import { CompanyService } from '@/server/company/company.service';
import { ContactService } from '@/server/contact/contact.service';

@ApiTags('Automation Integration')
@Controller('automation')
@UseGuards(TwoFactorGuard)
export class AutomationIntegrationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobApplicationService: JobApplicationService,
    private readonly companyService: CompanyService,
    private readonly contactService: ContactService,
  ) {}

  @Post('create-job-application')
  @ApiOperation({ 
    summary: 'Create complete job application with company and contacts in single transaction',
    description: 'Atomic operation that creates company, job application, and contacts together. Follows company-first workflow for automation.'
  })
  async createAutomatedJobApplication(@Body() createAutomatedJobDto: CreateAutomatedJobDto) {
    try {
      // Use Prisma transaction with extended timeout for automation processing
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Create company first (company-first workflow)
        const company = await this.companyService.create(
          createAutomatedJobDto.userId,
          createAutomatedJobDto.company
        );

        // 2. Create job application with company link (skip embeddings for automation speed)
        const jobApplication = await this.jobApplicationService.create(
          createAutomatedJobDto.userId,
          {
            ...createAutomatedJobDto.jobApplication,
            companyName: company.name,
            companyId: company.id,
          },
          { skipEmbeddings: true } // Skip embeddings for automation performance
        );

        // 3. Create contacts linked to both company and job
        const contacts = await Promise.all(
          createAutomatedJobDto.contacts.map((contactData: any) =>
            this.contactService.create(createAutomatedJobDto.userId, {
              ...contactData,
              companyId: company.id,
              jobApplicationId: jobApplication.id,
            })
          )
        );

        return {
          company,
          jobApplication,
          contacts,
          summary: {
            companyId: company.id,
            jobApplicationId: jobApplication.id,
            contactIds: contacts.map((c: Contact) => c.id),
            totalContacts: contacts.length,
          }
        };
      }, {
        maxWait: 15000, // Maximum time to wait for transaction to start (15 seconds)
        timeout: 30000, // Maximum time transaction can run (30 seconds)
      });

      return {
        success: true,
        message: `Created job application "${result.jobApplication.title}" at "${result.company.name}" with ${result.contacts.length} contacts`,
        data: result,
      };

    } catch (error) {
      console.error('Failed to create automated job application:', error);
      return {
        success: false,
        error: 'Failed to create automated job application',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 🔧 SKYVERN API KEY VALIDATION
  private async validateSkyvernApiKey(apiKey?: string): Promise<{ isValid: boolean; userId?: string }> {
    console.log('🔍 Starting API key validation...');
    console.log(`🔑 API Key received: ${apiKey ? 'YES' : 'NO'}`);
    console.log(`🔑 API Key length: ${apiKey?.length || 0}`);
    
    if (!apiKey || apiKey.trim().length === 0) {
      console.log('❌ API key is empty or missing');
      return { isValid: false };
    }

    try {
      // Decode the JWT to get organization info
      const parts = apiKey.split('.');
      console.log(`🔍 JWT parts count: ${parts.length}`);
      if (parts.length !== 3) {
        console.log('❌ Invalid JWT format');
        return { isValid: false };
      }

      const payload = parts[1];
      const padding = 4 - (payload.length % 4);
      const paddedPayload = padding !== 4 ? payload + '='.repeat(padding) : payload;
      const decoded = Buffer.from(paddedPayload, 'base64').toString('utf-8');
      const parsedPayload = JSON.parse(decoded);
      const organizationId = parsedPayload.sub;

      if (!organizationId) {
        return { isValid: false };
      }

      // 🧪 TEMPORARY: For testing, use hardcoded user ID
      // TODO: Remove this when user has API key saved in settings
      const TEMP_USER_ID = "cmcfcpf8e0000u4lg7u0i3bsh";
      
      console.log(`🧪 TEMP: Using hardcoded user ID for testing: ${TEMP_USER_ID}`);
      console.log(`🔑 API Key organization: ${organizationId}`);
      
      return { 
        isValid: true, 
        userId: TEMP_USER_ID 
      };

      /* ORIGINAL CODE - Uncomment when user has API key in settings
      // Find user with this Skyvern API key
      const userSettings = await this.prisma.userLLMSettings.findFirst({
        where: { 
          skyvernApiKey: apiKey,
          skyvernEnabled: true 
        },
        select: { 
          userId: true,
          skyvernApiKey: true 
        }
      });

      if (!userSettings) {
        console.log(`❌ No user found with Skyvern API key: ${apiKey.slice(0, 20)}...`);
        return { isValid: false };
      }

      console.log(`✅ Valid Skyvern API key for user: ${userSettings.userId}`);
      return { 
        isValid: true, 
        userId: userSettings.userId 
      };
      */

    } catch (error) {
      console.error('Error validating Skyvern API key:', error);
      return { isValid: false };
    }
  }

  @Public()
  @Post('job-application')
  @ApiOperation({
    summary: 'Create job application via automation',
    description: 'Creates job application and assesses if company/contacts need to be created. Returns decision data for workflow logic.'
  })
  @ApiHeader({
    name: 'x-skyvern-api-key',
    description: 'Skyvern API key for automation access',
    required: true,
  })
  async createJobApplication(
    @Headers('x-skyvern-api-key') apiKey: string,
    @Body() jobData: CreateAutomationJobApplicationDto
  ) {
    // Validate Skyvern API key and get user ID
    const authResult = await this.validateSkyvernApiKey(apiKey);
    if (!authResult.isValid || !authResult.userId) {
      throw new BadRequestException('Invalid or missing Skyvern API key');
    }

    // Use the authenticated user ID instead of the one from request body
    const authenticatedUserId = authResult.userId;

    try {
      console.log('🎯 Creating automated job application:', {
        title: jobData.title,
        company: jobData.companyName,
        userId: authenticatedUserId
      });

      // 1. Check if company exists and get user's contacts
      const existingCompany = await this.prisma.company.findFirst({
        where: { 
          name: {
            equals: jobData.companyName
          }
        },
        include: {
          contacts: {
            where: { userId: authenticatedUserId }
          }
        }
      });

      // 2. Prepare job application data
      const jobApplicationData = {
        title: jobData.title,
        companyName: jobData.companyName,
        description: jobData.description || undefined,
        requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
        extractedTags: Array.isArray(jobData.extractedTags) ? jobData.extractedTags : [],
        url: jobData.url || undefined,
        status: jobData.status || "DRAFT",
        location: jobData.location || undefined,
        salary: jobData.salary || undefined,
        industry: jobData.industry || undefined,
        notes: jobData.notes || undefined,
        createdViaAutomation: true,
        companyId: existingCompany?.id || undefined
      };

      // 3. Create job application
      const jobApplication = await this.jobApplicationService.create(
        authenticatedUserId,
        jobApplicationData,
        { skipEmbeddings: true }
      );

      console.log(`✅ Job application created: "${jobApplication.title}"`);

      // 4. Return assessment data for workflow decision-making
      return {
        success: true,
        data: {
          jobApplication,
          companyAssessment: {
            companyExists: !!existingCompany,
            companyId: existingCompany?.id || null,
            companyName: jobData.companyName,
            hasContacts: (existingCompany?.contacts?.length || 0) > 0,
            contactCount: existingCompany?.contacts?.length || 0,
            // 🎯 WORKFLOW DECISION FLAGS
            needsCompanyCreation: !existingCompany,
            needsContactExtraction: !existingCompany || (existingCompany.contacts?.length || 0) === 0,
            suggestedNextActions: {
              createCompany: !existingCompany,
              extractContacts: !existingCompany || (existingCompany.contacts?.length || 0) === 0,
              generateCoverLetter: true
            }
          }
        }
      };

    } catch (error) {
      console.error('❌ Failed to create job application:', error);
      return {
        success: false,
        error: 'Failed to create job application',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Public()
  @Post('company-contacts')
  @ApiOperation({
    summary: 'Create or update company and contacts',
    description: 'Creates company if needed and adds contacts. Used when job application assessment indicates company/contacts are needed.'
  })
  @ApiHeader({
    name: 'x-skyvern-api-key',
    description: 'Skyvern API key for automation access',
    required: true,
  })
  async createCompanyContacts(
    @Headers('x-skyvern-api-key') apiKey: string,
    @Body() companyData: CreateAutomationCompanyContactsDto
  ) {
    // Validate Skyvern API key and get user ID
    const authResult = await this.validateSkyvernApiKey(apiKey);
    if (!authResult.isValid || !authResult.userId) {
      throw new BadRequestException('Invalid or missing Skyvern API key');
    }

    // Use the authenticated user ID instead of the one from request body
    const authenticatedUserId = authResult.userId;

    try {
      console.log('🏢 Creating/updating company and contacts:', {
        company: companyData.companyName,
        contactCount: companyData.contacts?.length || 0,
        userId: authenticatedUserId
      });

      // 🔧 SIMPLIFIED: Remove transaction to avoid SQLite timeout issues
      try {
        // 1. Check if company exists (direct query, no transaction)
        let company = await this.prisma.company.findFirst({
          where: { 
            name: {
              equals: companyData.companyName
            }
          },
          include: { contacts: true }
        });

        let isNewCompany = false;

        // 2. Create company if it doesn't exist (direct query, no transaction)
        if (!company) {
          console.log(`📢 Creating new company: ${companyData.companyName}`);
          
          company = await this.companyService.create(authenticatedUserId, {
            name: companyData.companyName,
            description: companyData.companyDescription || `Company created via automation`,
            industry: companyData.industry,
            website: companyData.website,
            location: companyData.location,
            values: '[]'
          }) as any;

          isNewCompany = true;
        }

        // 3. Create contacts (direct queries, no transaction)
        const createdContacts = [];
        if (companyData.contacts && companyData.contacts.length > 0 && company) {
          for (const contactData of companyData.contacts) {
            const contact = await this.contactService.create(authenticatedUserId, {
              name: contactData.name,
              title: contactData.title,
              email: contactData.email,
              linkedinUrl: contactData.linkedinUrl,
              phone: contactData.phone,
              companyId: company.id
            });
            createdContacts.push(contact);
          }
        }

        console.log(`✅ Company and contacts processed: ${createdContacts.length} contacts created`);

        return {
          success: true,
          data: {
            company: {
              ...company,
              isNew: isNewCompany
            },
            contacts: createdContacts,
            summary: {
              companyCreated: isNewCompany,
              contactsCreated: createdContacts.length,
              companyId: company?.id || ''
            }
          }
        };

      } catch (dbError) {
        console.error('❌ Database error in company/contacts creation:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('❌ Failed to create company/contacts:', error);
      return {
        success: false,
        error: 'Failed to create company and contacts',
        message: error instanceof Error ? error.message : 'Unknown error'
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
          where: { 
            userId,
            createdViaAutomation: true
          }
        }),
        this.prisma.company.count({}),  // Count all companies (platform-wide)
        this.prisma.jobApplication.count({
          where: { 
            userId, 
            createdViaAutomation: true,
            companyId: {
              not: null
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

  
  @Get('status')
  @ApiOperation({ summary: 'Check automation system status for authenticated user' })
  async getAutomationStatus(@User("id") userId: string) {
    // Get user's Skyvern settings
    const userSettings = await this.getUserSkyvernSettings(userId);
    
    if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
      return {
        skyvern: {
          status: 'not_configured',
          message: 'User has not configured Skyvern automation'
        },
        userConfigured: false,
        message: 'Configure your Skyvern API key in Settings to enable automation'
      };
    }
    try {
      // Check if Skyvern is running by testing the root endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const skyvernResponse = await fetch(userSettings.skyvernBaseUrl || 'http://localhost:8000/', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      // Skyvern is running if we get any response (even 404)
      const skyvernStatus = skyvernResponse.status < 500 ? 'running' : 'down';
      
      return {
        skyvern: {
          status: skyvernStatus,
          url: 'http://localhost:8000',
          uiUrl: 'http://localhost:8081'
        },
        message: skyvernStatus === 'running' 
          ? 'Automation system is ready for job automation' 
          : 'Start automation system with: docker-compose -f docker-compose.automation.yml up -d',
        userConfigured: true,
        userApiKey: userSettings.skyvernApiKey ? 'Configured' : 'Not configured'
      };
    } catch (error) {
      return {
        skyvern: {
          status: 'down',
          url: 'http://localhost:8000',
          uiUrl: 'http://localhost:8080'
        },
        message: 'Automation system is not running',
        error: error.message
      };
    }
  }

  @Post('execute-linkedin-workflow')
  @ApiOperation({ 
    summary: 'Execute advanced LinkedIn workflow with credential management and dynamic assistance',
    description: 'Uses Skyvern workflows with login blocks, credential management, and dynamic user prompting when obstacles are encountered.'
  })
  async executeLinkedInWorkflow(
    @User("id") userId: string,
    @Body() body: {
    jobKeywords: string;
    location: string;
    remoteStatus?: string;
    timePeriod?: string;
    maxJobs?: number;
    includeCompanyResearch?: boolean;
    includeContactExtraction?: boolean;
    waitForUserLogin?: boolean;
      linkedinUsername?: string;
      linkedinPassword?: string;
    },
  ) {
    // Get user's Skyvern settings
    const userSettings = await this.getUserSkyvernSettings(userId);
    if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
      return {
        success: false,
        error: 'Skyvern not configured',
        message: 'Please configure your Skyvern API key in Settings to use automation',
        configurationRequired: true
      };
    }
    try {
      // Build LinkedIn search URL with filters
      const searchParams = new URLSearchParams({
        keywords: body.jobKeywords,
        location: body.location,
      });

      // Add remote status filter
      if (body.remoteStatus && body.remoteStatus !== 'any') {
        const remoteFilters: Record<string, string> = {
          'remote': '2',
          'on-site': '1', 
          'hybrid': '3'
        };
        const filterValue = remoteFilters[body.remoteStatus];
        if (filterValue) {
          searchParams.append('f_WT', filterValue);
        }
      }

      // Add time period filter
      if (body.timePeriod && body.timePeriod !== 'any') {
        const timeFilters: Record<string, string> = {
          'past24h': 'r86400',
          'pastWeek': 'r604800', 
          'pastMonth': 'r2592000'
        };
        if (timeFilters[body.timePeriod]) {
          searchParams.append('f_TPR', timeFilters[body.timePeriod]);
        }
      }

      const linkedinSearchUrl = `https://www.linkedin.com/jobs/search/?${searchParams.toString()}`;

      // Comprehensive extraction schema that matches our CreateAutomatedJobDto
      const extractionSchema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
            // Job Application Data (exact format for our API)
            job_title: { 
              type: 'string',
              description: 'Exact job title from posting'
            },
            job_description: { 
              type: 'string',
              description: 'Complete job description text'
            },
            job_url: { 
              type: 'string',
              description: 'Direct URL to job posting'
            },
            job_requirements: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of job requirements extracted from posting'
            },
            job_skills: {
              type: 'array', 
              items: { type: 'string' },
              description: 'Technical skills and technologies mentioned'
            },
            job_location: { 
              type: 'string',
              description: 'Job location or "Remote"'
            },
            job_salary: { 
              type: 'string',
              description: 'Salary range if available'
            },
            
            // Company Data (exact format for our API)
            company_name: { 
              type: 'string',
              description: 'Official company name'
            },
            company_description: { 
              type: 'string',
              description: 'Company description from LinkedIn page'
            },
            company_website: { 
              type: 'string',
              description: 'Company website URL'
            },
            company_industry: { 
              type: 'string',
              description: 'Company industry/sector'
            },
            company_size: { 
              type: 'string',
              description: 'Company size (e.g., "100-500 employees")'
            },
            company_location: { 
              type: 'string',
              description: 'Company headquarters location'
            },
            company_linkedin_url: { 
              type: 'string',
              description: 'Company LinkedIn page URL'
            },
            
            // Contact Data (exact format for our API)
            contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    description: 'Contact full name'
                  },
                  title: { 
                    type: 'string',
                    description: 'Job title/position'
                  },
                  linkedin_url: { 
                    type: 'string',
                    description: 'LinkedIn profile URL'
                  },
                  email: { 
                    type: 'string',
                    description: 'Email address if available'
                  }
                }
              },
              description: 'List of relevant contacts (hiring managers, recruiters, team leads)'
            }
          }
        }
      };

      const automationTask = {
        url: linkedinSearchUrl,
        navigation_goal: `
          1. Navigate to LinkedIn job search
          2. ${body.waitForUserLogin ? 'LOGIN STRATEGY: If login popup appears, attempt to click "Sign in" button automatically. If automation cannot complete login, pause the task and notify user that manual login is required via LinkedIn directly (user should login to LinkedIn in a separate browser tab, then restart this automation).' : 'Proceed with available access'}
          3. After successful login, search for "${body.jobKeywords}" jobs in "${body.location}"
          4. For each job found (max ${body.maxJobs || 5}):
             - Extract complete job details from posting
             - Navigate to company LinkedIn page  
             - Extract comprehensive company information
             - If company website exists, visit it for additional details
             - Find and extract relevant contact information
          5. IMPORTANT: If login is required, try to automate the login process, but if unsuccessful, provide feedback to user about manual login requirements
        `,
        data_extraction_goal: `
          For each job posting found:
          
          STEP 1 - JOB EXTRACTION:
          - Extract job title, description, URL, requirements, skills, location, salary
          - Parse requirements and skills into separate arrays
          
          STEP 2 - COMPANY RESEARCH:
          - Navigate to company LinkedIn page
          - Extract company name, description, industry, size, location
          - If company website is available, visit it to extract additional details
          - Look for company mission, culture, values
          
          STEP 3 - CONTACT EXTRACTION:
          - Find 3-5 relevant contacts from company page
          - Focus on: hiring managers, recruiters, engineering managers, team leads
          - Extract name, title, LinkedIn URL, email if available
          
          Format data EXACTLY as specified in the schema to match our API structure.
        `,
        extracted_information_schema: extractionSchema,
        max_steps: 200, // More steps for comprehensive extraction + manual login time
        max_retries_per_step: 5, // More retries to handle login pauses
        llm_key: 'ANTHROPIC_CLAUDE3_HAIKU',
        webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${encodeURIComponent(userId)}`,
        max_steps_per_run: 100
      };

      // Use user's configured API key
      const apiKey = userSettings.skyvernApiKey!;
      const skyvernBaseUrl = userSettings.skyvernBaseUrl || 'http://localhost:8000';
      
      console.log(`Starting LinkedIn workflow for user ${userId}:`, apiKey.slice(0, 20) + '...');

      // Create workflow run with parameters
      const workflowParameters = {
        job_keywords: body.jobKeywords,
        location: body.location,
        max_jobs: body.maxJobs || 5,
        linkedin_username: body.linkedinUsername || '', // User can provide credentials
        linkedin_password: body.linkedinPassword || '', // Or we'll prompt dynamically
        webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${encodeURIComponent(userId)}`
      };

      // For now, use task API with workflow-like behavior
      // TODO: Switch to workflow API when workflow is uploaded to Skyvern
      const response = await fetch(`${skyvernBaseUrl}/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify({
          ...automationTask,
          // Add workflow-like parameters
          title: `LinkedIn Job Search: ${body.jobKeywords} in ${body.location}`,
          navigation_goal: `
            ADVANCED LINKEDIN AUTOMATION WITH DYNAMIC ASSISTANCE:
            
            1. Navigate to LinkedIn job search
            2. If login is required:
               - Look for stored credentials for LinkedIn
               - If no credentials, pause and ask user: "Please provide LinkedIn username and password, or login manually and I'll continue"
               - Handle 2FA if required
            3. Search for "${body.jobKeywords}" jobs in "${body.location}"
            4. If search page doesn't load correctly, pause and ask: "I'm having trouble with the job search page. What should I do next?"
            5. For each job found:
               - Extract job details
               - Navigate to company page
               - If company page inaccessible, ask: "Cannot access company page. Should I skip this job or try alternative approach?"
               - Extract company and contact data
            6. If any step fails, pause and request specific user guidance
            
            IMPORTANT: When in doubt, ASK THE USER for guidance instead of failing silently.
          `,
          data_extraction_goal: `
            INTELLIGENT DATA EXTRACTION WITH USER ASSISTANCE:
            
            Extract comprehensive job data, but if any extraction step fails:
            1. Describe what went wrong
            2. Ask user for specific guidance
            3. Wait for user response
            4. Execute user instructions
            5. Continue with extraction
            
            This ensures no data is missed and user stays in control.
          `,
          // Enhanced parameters for workflow-like behavior
          max_steps: 500, // Allow for many user interaction steps
          max_retries_per_step: 10, // More retries for dynamic guidance
          include_user_guidance: true, // Custom parameter for our workflow
          dynamic_assistance: true,
          credential_management: body.linkedinUsername ? true : false
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
      return {
          success: false,
          error: 'Skyvern API call failed',
          message: result.detail || result.message || `HTTP ${response.status}: ${response.statusText}`,
          skyvernResponse: result
        };
      }
      
      return {
        success: true,
        taskId: result.task_id,
        message: `LinkedIn automation started for "${body.jobKeywords}" in "${body.location}"`,
        monitorUrl: `http://localhost:8081/tasks/${result.task_id}`,
        extractedJobsWillBePostedTo: `/api/automation/process-linkedin-jobs?userId=${userId}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to start LinkedIn automation workflow',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Public()
  @Post('process-linkedin-jobs')
  @ApiOperation({ summary: 'Process LinkedIn job extraction results using combined automation API' })
  async processLinkedInJobs(
    @Req() request: Request,
    @Body() data: any, 
    @Query('userId') userId?: string,
    @Headers('x-skyvern-signature') signature?: string
  ) {
    try {
      console.log('Processing LinkedIn automation results:', data.extracted_information?.length || 0, 'jobs');
      
      if (!userId) {
        return {
          success: false,
          error: 'User ID required',
          message: 'userId query parameter is required'
        };
      }

      // 🔓 TEMPORARILY DISABLED WEBHOOK SIGNATURE FOR DEBUGGING
      console.log('🔍 Webhook signature temporarily disabled for debugging');
      console.log('🔑 Signature received:', signature ? 'Present' : 'Missing');
      
      // Get user settings for later use
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      console.log('✅ Webhook authentication bypassed for debugging');

      if (!data.extracted_information || !Array.isArray(data.extracted_information)) {
      return { 
          success: false,
          error: 'No job data received',
          message: 'extracted_information array not found in webhook data'
        };
      }

      let processedCount = 0;
      let errorCount = 0;

      // Process each job using our combined automation API
      for (const jobData of data.extracted_information) {
        try {
          console.log(`Processing job: ${jobData.job_title} at ${jobData.company_name}`);
          
          // Transform Skyvern data to our API format
          const automatedJobData = {
            userId,
            company: {
              name: jobData.company_name,
              description: jobData.company_description || '',
              website: jobData.company_website || undefined,
              industry: jobData.company_industry || undefined,
              size: jobData.company_size || undefined,
              location: jobData.company_location || undefined,
              linkedinUrl: jobData.company_linkedin_url || undefined,
              values: '[]', // Default empty values
            },
            jobApplication: {
              title: jobData.job_title,
              description: jobData.job_description || '',
              url: jobData.job_url || undefined,
              requirements: jobData.job_requirements || [],
              extractedTags: jobData.job_skills || [],
              notes: `Automated import from LinkedIn. Salary: ${jobData.job_salary || 'Not specified'}`,
              status: 'DRAFT' as const,
              createdViaAutomation: true
            },
            contacts: (jobData.contacts || []).map((contact: any) => ({
              name: contact.name,
              title: contact.title || undefined,
              linkedinUrl: contact.linkedin_url || undefined,
              email: contact.email || undefined,
            }))
          };

          // Call our combined automation API
          const result = await this.createAutomatedJobApplication(automatedJobData);
          
          if (result.success && result.data) {
            processedCount++;
            console.log(`✅ Successfully processed: ${jobData.job_title} at ${jobData.company_name}`);
          } else {
            errorCount++;
            console.error(`❌ Failed to process: ${jobData.job_title} at ${jobData.company_name} - ${result.message}`);
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errorCount++;
          console.error(`💥 Exception processing job: ${jobData.job_title || 'Unknown'} - ${errorMsg}`);
        }
      }
      
      // 🎯 MINIMAL WEBHOOK RESPONSE - Fixes 413 "request entity too large"
      return { 
        success: true,
        processed: processedCount,
        errors: errorCount,
        total: data.extracted_information.length,
        message: `Processed ${data.extracted_information.length} jobs: ${processedCount} successful, ${errorCount} failed`
      };
      
    } catch (error) {
      console.error('Error processing LinkedIn jobs:', error);
      return {
        success: false,
        error: 'Failed to process LinkedIn jobs',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user's Skyvern settings from database
   */
  private async getUserSkyvernSettings(userId: string) {
    const userSettings = await this.prisma.userLLMSettings.findFirst({
      where: { userId },
      select: {
        skyvernApiKey: true,
        skyvernBaseUrl: true,
        skyvernEnabled: true,
      }
    });

      return { 
      skyvernApiKey: userSettings?.skyvernApiKey || null,
      skyvernBaseUrl: userSettings?.skyvernBaseUrl || 'http://localhost:8000',
      skyvernEnabled: userSettings?.skyvernEnabled || false,
    };
  }

  @Post('test-skyvern-connection')
  @ApiOperation({ summary: 'Test user\'s Skyvern API key and connection' })
  async testSkyvernConnection(@User("id") userId: string) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernApiKey) {
        return {
          success: false,
          error: 'No API key configured',
          message: 'Please set your Skyvern API key in settings'
        };
      }

      // Test the API key by getting organizations
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/organizations`, {
        method: 'GET',
        headers: {
          'X-API-Key': userSettings.skyvernApiKey
        }
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'Skyvern API key is valid and working',
          organizations: result.organizations || [],
          skyvernVersion: response.headers.get('skyvern-version') || 'Unknown'
        };
      } else {
        return {
          success: false,
          error: 'Invalid API key',
          message: result.detail || 'Failed to authenticate with Skyvern',
          statusCode: response.status
        };
      }

    } catch (error) {
      return { 
        success: false, 
        error: 'Connection failed',
        message: error instanceof Error ? error.message : 'Unable to connect to Skyvern'
      };
    }
  }

  @Post('update-skyvern-settings')
  @ApiOperation({ summary: 'Update user\'s Skyvern automation settings' })
  async updateSkyvernSettings(
    @User("id") userId: string,
    @Body() body: {
      skyvernApiKey?: string;
      skyvernBaseUrl?: string;
      skyvernEnabled?: boolean;
    }
  ) {
    try {
      // Update or create user's LLM settings
      await this.prisma.userLLMSettings.upsert({
        where: { userId },
        update: {
          skyvernApiKey: body.skyvernApiKey,
          skyvernBaseUrl: body.skyvernBaseUrl,
          skyvernEnabled: body.skyvernEnabled,
        },
        create: {
          userId,
          skyvernApiKey: body.skyvernApiKey,
          skyvernBaseUrl: body.skyvernBaseUrl || 'http://localhost:8000',
          skyvernEnabled: body.skyvernEnabled || false,
        }
      });
      
      return { 
        success: true, 
        message: 'Skyvern settings updated successfully'
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to update settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('get-active-tasks')
  @ApiOperation({ summary: 'Get user\'s active automation tasks from Skyvern' })
  async getActiveTasks(@User("id") userId: string) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return {
          success: false,
          tasks: [],
          message: 'Skyvern not configured for this user'
        };
      }

      // Get active tasks from Skyvern API
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/tasks`, {
        method: 'GET',
        headers: {
          'X-API-Key': userSettings.skyvernApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Skyvern API error: ${response.status}`);
      }

      const tasks = await response.json();
      
      // Filter and format tasks for UI
      const activeTasks = tasks
        .filter((task: any) => task.status === 'running' || task.status === 'created')
        .map((task: any) => ({
          taskId: task.task_id,
          instruction: task.navigation_goal || 'Automation task',
          status: task.status,
          createdAt: task.created_at,
          monitorUrl: `http://localhost:8081/tasks/${task.task_id}`,
          url: task.url,
          progress: {
            currentStep: task.current_step || 0,
            totalSteps: task.max_steps_per_run || 100,
            lastAction: task.last_action_description || 'Starting...'
          }
        }));

      return {
        success: true,
        tasks: activeTasks,
        totalTasks: activeTasks.length
      };

    } catch (error) {
      return {
        success: false,
        tasks: [],
        error: error instanceof Error ? error.message : 'Failed to fetch tasks'
      };
    }
  }

  @Post('create-linkedin-workflow-template')
  @ApiOperation({ summary: 'Create LinkedIn job automation workflow template for user' })
  async createLinkedInWorkflowTemplate(
    @User("id") userId: string,
    @User("name") userName: string,
    @Body() body: {
      templateName?: string;
      description?: string;
      linkedinUsername?: string;
      linkedinPassword?: string;
      defaultKeywords?: string;
      defaultLocation?: string;
    }
  ) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return {
          success: false,
          error: 'Skyvern not configured',
          message: 'Please configure your Skyvern API key in Settings first'
        };
      }

      // Create workflow using CORRECT structure (title and workflow_definition at top level)
      const workflowData = {
        title: body.templateName || `LinkedIn Jobs - ${userName}`,
        description: body.description || 'Automated LinkedIn job search with dynamic assistance and credential management',
        proxy_location: "RESIDENTIAL",
        webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${userId}`,
        persist_browser_session: true,
        browser_session_id: `linkedin-session-${userId}`,
        workflow_definition: {
          parameters: [
            {
              key: "job_keywords",
              description: "Job search keywords",
              parameter_type: "workflow",
              workflow_parameter_type: "string",
              default_value: body.defaultKeywords || 'Software Developer'
            },
            {
              key: "location", 
              description: "Job location",
              parameter_type: "workflow",
              workflow_parameter_type: "string",
              default_value: body.defaultLocation || 'San Francisco, CA'
            },
      
            {
              key: "max_jobs",
              description: "Maximum jobs to extract", 
              parameter_type: "workflow",
              workflow_parameter_type: "integer",
              default_value: 5
            },
            {
              key: "date_posted",
              description: "When job was posted (any, 24h, week, month)",
              parameter_type: "workflow", 
              workflow_parameter_type: "string",
              default_value: "any"
            },
            {
              key: "remote_type",
              description: "Remote work type (any, on-site, remote, hybrid)",
              parameter_type: "workflow",
              workflow_parameter_type: "string", 
              default_value: "any"
            },
            {
              key: "linkedin_username",
              description: "LinkedIn username/email",
              parameter_type: "workflow",
              workflow_parameter_type: "string",
              default_value: body.linkedinUsername || ''
            },
            {
              key: "linkedin_password", 
              description: "LinkedIn password",
              parameter_type: "workflow",
              workflow_parameter_type: "string",
              default_value: body.linkedinPassword || ''
            }
          ],
          blocks: [
            {
              label: "load_linkedin_job_search_with_filters",
              block_type: "navigation",
              url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}&f_TPR={{date_posted}}&f_WT={{remote_type}}",
              title: "Load LinkedIn Job Search with Pre-Applied Filters",
              engine: "skyvern-1.0",
              continue_on_failure: true,
              max_retries: 3,
              navigation_goal: `Navigate directly to LinkedIn job search page with filters pre-applied:
                        
          1. Load URL with pre-filled search parameters
          2. Keywords: "{{job_keywords}}"
          3. Location: "{{location}}"
          4. Date posted filter: {{date_posted}}
          5. Remote work filter: {{remote_type}}
          6. Wait for search results to load

          Goal is complete when job search results are visible with the specified filters applied.`,
              parameter_keys: [],
              cache_actions: false
            },
            {
              label: "check_login_status",
              block_type: "text_prompt",
              prompt: "I'm on the LinkedIn job search page. Analyze the current page: 1) Am I logged in? (check for profile menu/avatar in top right) 2) Do I see a login form or sign-in button? 3) Are the job search results visible? 4) Are the search filters properly applied? Respond with: 'LOGGED_IN' if logged in and search results visible, 'NEED_LOGIN' if login required, or 'ERROR' with description if there are issues.",
              llm_key: "ANTHROPIC_CLAUDE3_HAIKU"
            },
            {
              label: "login_if_needed", 
              block_type: "login",  // ⭐ SPECIALIZED LOGIN BLOCK!
              url: "https://www.linkedin.com/login",
              title: "LinkedIn Authentication",
              navigation_goal: `Complete LinkedIn login using provided credentials:

          1. Navigate to LinkedIn login page if not already there
          2. Fill username field with {{linkedin_username}}
          3. Fill password field with {{linkedin_password}}
          4. Click Sign In button
          5. Handle any 2FA/security challenges that appear
          6. Wait for successful authentication
          7. Navigate back to job search page with applied filters

          Goal: Successfully logged in and redirected to job search results.`,
              max_retries: 3,
              max_steps_per_run: 15,
              parameter_keys: ["linkedin_username", "linkedin_password"],
              totp_verification_url: null,
              totp_identifier: null,
              cache_actions: false,
              complete_criterion: "Profile menu/avatar visible indicating successful login",
              terminate_criterion: "Multiple login failures or account locked",
              engine: "skyvern-1.0"
            },
            {
              label: "verify_search_filters",
              block_type: "navigation",
              url: "https://www.linkedin.com/jobs/search/?keywords={{job_keywords}}&location={{location}}&f_TPR={{date_posted}}&f_WT={{remote_type}}",
              title: "Verify and Apply Search Filters",
              engine: "skyvern-1.0", 
              continue_on_failure: true,
              navigation_goal: `Ensure job search filters are correctly applied:

          1. Verify search keywords: "{{job_keywords}}"
          2. Verify location: "{{location}}" 
          3. Check date posted filter: {{date_posted}}
          4. Check remote work filter: {{remote_type}}
          5. If filters not applied, manually set them
          6. Wait for filtered results to load

          Goal is complete when search results show jobs matching all specified criteria.`,
              parameter_keys: [],
              cache_actions: false
            },
            {
              label: "extract_job_listings_array",
              block_type: "extraction",
              url: "",
              title: "Extract Job Listings for Loop Processing",
              continue_on_failure: true,
              max_retries: 2,
              data_extraction_goal: `Extract basic job listing information from LinkedIn search results page:

GOAL: Create an array of job identifiers that can be looped over.

EXTRACTION PROCESS:
1. Identify all job cards/listings visible on the search results page (up to {{max_jobs}} jobs)
2. For each job listing, extract basic information:
   - Job title text (for identification)
   - Company name
   - Job listing position/index on the page
   - Basic job card identifier or selector info

IMPORTANT: This is just to create the loop array. Detailed extraction will happen inside the FOR_LOOP.`,
              data_schema: {
                type: "array",
                items: {
                  type: "object",
                properties: {
                    job_title: { type: "string", description: "Job title for identification" },
                    company_name: { type: "string", description: "Company name" },
                    search_result_position: { type: "number", description: "Position in search results (1, 2, 3, etc)" },
                    job_card_identifier: { type: "string", description: "CSS selector or identifier for the job card" }
                  },
                  required: ["job_title", "company_name", "search_result_position"]
                }
              },
              parameter_keys: [],
              cache_actions: false
            },
            {
              label: "process_each_job",
              block_type: "for_loop",
              loop_over: "extract_job_listings_array",
              loop_variable_reference: "current_job",
              complete_if_empty: true,
              loop_blocks: [
                {
                  label: "navigate_to_job_details",
                  block_type: "navigation",
                  url: "",
                  title: "Navigate to Current Job Details",
                  engine: "skyvern-1.0",
                  continue_on_failure: true,
                  navigation_goal: `Navigate to the detailed view of the current job:

CURRENT JOB: {{current_job.job_title}} at {{current_job.company_name}} (Position: {{current_job.search_result_position}})

1. Locate the job card for this specific job using position {{current_job.search_result_position}}
2. Click on the job title or job card to open the detailed view
3. Wait for the job details page to fully load
4. Ensure all job information is visible: description, requirements, company details

Goal: Job detail page is loaded and ready for comprehensive data extraction.`,
                  parameter_keys: [],
                  cache_actions: false
                },
                {
                  label: "extract_detailed_job_info",
                  block_type: "extraction",
                  url: "",
                  title: "Extract Complete Job Information",
                  continue_on_failure: true,
                  max_retries: 2,
                  data_extraction_goal: `Extract comprehensive information for the current job:

CURRENT JOB: {{current_job.job_title}} at {{current_job.company_name}}

REQUIRED EXTRACTION:
1. Complete job title and full job description
2. Company name, description, and company website
3. Detailed job requirements and qualifications
4. Technical skills mentioned in the job posting
5. Job location and work arrangement (remote/hybrid/on-site)
6. Salary information (if visible)
7. CRITICAL: Click the "Share" button to get the canonical LinkedIn job URL
8. Any visible contact information or hiring manager details

SHARE URL: Must click the Share button/icon to extract the proper LinkedIn job URL for applications.`,
                  data_schema: {
                    type: "object",
                    properties: {
                      job_title: { type: "string" },
                      job_description: { type: "string" },
                      job_url: { type: "string", description: "URL from Share button - REQUIRED" },
                      job_location: { type: "string" },
                      job_requirements: { 
                        type: "array", 
                        items: { type: "string" }
                      },
                      job_skills: {
                        type: "array",
                        items: { type: "string" }
                      },
                      company_name: { type: "string" },
                      company_description: { type: "string" },
                      company_website: { type: "string" },
                      job_salary: { type: "string" },
                      work_type: { type: "string" },
                      contacts: {
                        type: "array",
                    items: {
                          type: "object",
                      properties: {
                            name: { type: "string" },
                            title: { type: "string" },
                            linkedin_url: { type: "string" }
                          }
                        }
                      }
                    },
                    required: ["job_title", "company_name", "job_url"]
                  },
                  parameter_keys: [],
                  cache_actions: false
                }
              ]
            },
            {
              label: "send_extracted_jobs_to_webhook",
              block_type: "http_request",  // ⭐ HTTP_REQUEST BLOCK FOR GUARANTEED DELIVERY!
              method: "POST",
              url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${userId}`,
              headers: {
                "Content-Type": "application/json",
                "X-User-Api-Key": userSettings.skyvernApiKey,
                "X-User-Id": userId
              },
              body: {
                extracted_information: "{{process_each_job.output}}",
                workflow_run_id: "{{workflow_run_id}}",
                organization_id: "{{organization_id}}",
                timestamp: "{{current_timestamp}}",
                total_jobs_processed: "{{extract_job_listings_array.length}}",
                workflow_metadata: {
                  search_keywords: "{{job_keywords}}",
                  search_location: "{{location}}",
                  date_posted_filter: "{{date_posted}}",
                  remote_type_filter: "{{remote_type}}"
                }
              },
              timeout: 60,
              follow_redirects: true,
              parameter_keys: [],
              cache_actions: false
            }
          ]
        }
      };

      // 🔍 COMPREHENSIVE LOGGING: Log the exact JSON payload being sent
      console.log('🚀 WORKFLOW CREATION REQUEST:');
      console.log('📍 URL:', `${userSettings.skyvernBaseUrl}/api/v1/workflows`);
      console.log('📍 Headers:', {
        'Content-Type': 'application/json',
        'x-api-key': userSettings.skyvernApiKey ? '[PRESENT]' : '[MISSING]'
      });
      console.log('📦 PAYLOAD (Full JSON):');
      console.log(JSON.stringify(workflowData, null, 2));
      
      // 🔍 SPECIFIC BLOCK ANALYSIS: Log the problematic FOR_LOOP block
      const forLoopBlock = workflowData.workflow_definition.blocks.find(b => b.label === 'process_each_job');
      if (forLoopBlock) {
        console.log('🎯 FOR_LOOP BLOCK DETAILS:');
        console.log('   Label:', forLoopBlock.label);
        console.log('   Block Type:', forLoopBlock.block_type);
        console.log('   Loop Over:', forLoopBlock.loop_over);
        console.log('   Loop Variable Reference:', forLoopBlock.loop_variable_reference);
      }

      // 🔍 EXTRACTION BLOCK ANALYSIS: Log the extraction block it references
      const extractionBlock = workflowData.workflow_definition.blocks.find(b => b.label === 'extract_job_listings_array');
      if (extractionBlock) {
        console.log('📊 EXTRACTION BLOCK DETAILS:');
        console.log('   Label:', extractionBlock.label);
        console.log('   Block Type:', extractionBlock.block_type);
        console.log('   Data Schema Type:', extractionBlock.data_schema?.type);
      }

      // Create workflow in Skyvern using correct API format
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/workflows`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
          'x-api-key': userSettings.skyvernApiKey
        },
        body: JSON.stringify(workflowData)
      });

      const result = await response.json();

      // 🔍 COMPREHENSIVE RESPONSE LOGGING
      console.log('📨 SKYVERN RESPONSE:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
      console.log('   Response Headers:', response.headers);
      console.log('   Response Body:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        console.error('❌ WORKFLOW CREATION FAILED:');
        console.error('   Error Detail:', result.detail);
        console.error('   Full Response:', result);
        
        return {
          success: false,
          error: 'Failed to create workflow',
          message: result.detail || 'Workflow creation failed',
          skyvernResponse: result,
          debugInfo: {
            payloadSent: workflowData,
            httpStatus: response.status,
            responseBody: result
          }
        };
      }

      // Save workflow reference in our database
      await this.prisma.userLLMSettings.update({
        where: { userId },
        data: {
          // Store workflow ID for future reference (we could add a workflows table later)
          skyvernEnabled: true
        }
      });
      
      return { 
        success: true, 
        message: 'LinkedIn workflow template created successfully',
        workflowId: result.workflow_permanent_id, // Use permanent ID for reliability
        temporaryId: result.workflow_id, // Keep temporary ID for reference
        permanentId: result.workflow_permanent_id,
        workflowName: body.templateName || `LinkedIn Jobs - ${userName}`,
        runUrl: `${userSettings.skyvernBaseUrl}/api/v1/workflows/${result.workflow_permanent_id}/run`
      };

    } catch (error) {
      return {
        success: false,
        error: 'Failed to create workflow template',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Get('active-runs')
  @ApiOperation({ summary: 'Get active workflow runs' })
  async getActiveRuns(@User("id") userId: string) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return { success: true, runs: [] };
      }

      // Get active workflow runs from Skyvern
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/workflow_runs`, {
        method: 'GET',
        headers: {
          'x-api-key': userSettings.skyvernApiKey
        }
      });

      const result = await response.json();

      if (response.ok) {
        const activeRuns = result.workflow_runs?.filter((run: any) => 
          run.status === 'running' || run.status === 'created'
        ) || [];

      return { 
        success: true, 
          runs: activeRuns.map((run: any) => ({
            runId: run.workflow_run_id,
            workflowId: run.workflow_permanent_id,
            status: run.status,
            startedAt: run.created_at,
            completedAt: run.completed_at,
            parameters: run.parameters || {}
          }))
        };
      }

      return { success: true, runs: [] };
    } catch (error) {
      return { success: true, runs: [] };
    }
  }

  @Get('list-workflow-templates')
  @ApiOperation({ summary: 'List user\'s workflow templates' })
  async listWorkflowTemplates(@User("id") userId: string) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return {
          success: false,
          workflows: [],
          message: 'Skyvern not configured'
        };
      }

      console.log(`📋 Listing workflows for organization: ${userSettings.skyvernApiKey ? this.extractOrgFromApiKey(userSettings.skyvernApiKey) : 'No API key'}`);
      console.log(`🌐 Using Skyvern base URL: ${userSettings.skyvernBaseUrl}`);

      // Get workflows from Skyvern
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/workflows`, {
        method: 'GET',
        headers: {
          'x-api-key': userSettings.skyvernApiKey
        }
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(`❌ Failed to list workflows:`, error);
        throw new Error(`Skyvern API error: ${response.status} - ${error.detail || 'Unknown error'}`);
      }

      const workflows = await response.json();
      console.log(`✅ Found ${workflows.length} workflows`);
      
      const mappedWorkflows = workflows.map((w: any) => ({
        workflowId: w.workflow_permanent_id || w.workflow_id,
        permanentId: w.workflow_permanent_id,
        temporaryId: w.workflow_id,
        title: w.title,
        description: w.description,
        workflowName: w.title,
        platform: w.title?.includes('LinkedIn') ? 'LinkedIn' : 'Custom',
        createdAt: w.created_at,
        lastRun: w.last_run_at,
        parameters: w.workflow_definition?.parameters || [],
        // Debug info to help identify organization mismatches
        debug: {
          workflowPermanentId: w.workflow_permanent_id,
          workflowTempId: w.workflow_id,
          organization: userSettings.skyvernApiKey ? this.extractOrgFromApiKey(userSettings.skyvernApiKey) : 'No API key'
        }
      }));
      
      return { 
        success: true, 
        workflows: mappedWorkflows,
        organizationContext: {
          currentOrganization: userSettings.skyvernApiKey ? this.extractOrgFromApiKey(userSettings.skyvernApiKey) : 'No API key',
          apiKeyPrefix: userSettings.skyvernApiKey ? userSettings.skyvernApiKey.slice(0, 20) + '...' : 'No API key',
          skyvernUrl: userSettings.skyvernBaseUrl
        }
      };

    } catch (error) {
      return { 
        success: false, 
        workflows: [],
        error: error instanceof Error ? error.message : 'Failed to fetch workflows'
      };
    }
  }

  @Post('run-workflow-template')
  @ApiOperation({ summary: 'Run a workflow template with parameters' })
  async runWorkflowTemplate(
    @User("id") userId: string,
    @Body() body: {
      workflowId: string;
      parameters: Record<string, any>;
    }
  ) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return {
          success: false,
          error: 'Skyvern not configured'
        };
      }

      // Add small delay to ensure workflow is fully registered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run workflow with parameters (using permanent ID)
      const response = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/workflows/${body.workflowId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userSettings.skyvernApiKey
        },
        body: JSON.stringify({
          data: body.parameters,
          webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${userId}`
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
      return {
          success: false,
          error: 'Failed to run workflow',
          message: result.detail || 'Workflow execution failed'
        };
      }

      return {
        success: true,
        message: 'Workflow execution started',
        workflowRunId: result.workflow_run_id,
        monitorUrl: `http://localhost:8081/workflows/${result.workflow_run_id}`,
        status: result.status
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to run workflow',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @Delete('delete-workflow-template/:workflowId')
  @ApiOperation({ summary: 'Delete a workflow template' })
  async deleteWorkflowTemplate(
    @User("id") userId: string,
    @Param('workflowId') workflowId: string
  ) {
    try {
      const userSettings = await this.getUserSkyvernSettings(userId);
      
      if (!userSettings.skyvernEnabled || !userSettings.skyvernApiKey) {
        return {
          success: false,
          error: 'Skyvern not configured'
        };
      }

      console.log(`🔍 Attempting to delete workflow: ${workflowId}`);
      console.log(`🔑 Using API key org: ${userSettings.skyvernApiKey ? this.extractOrgFromApiKey(userSettings.skyvernApiKey) : 'No API key'}`);
      console.log(`🌐 Skyvern base URL: ${userSettings.skyvernBaseUrl}`);

      // First, verify the workflow exists and can be accessed
      const checkResponse = await fetch(`${userSettings.skyvernBaseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'GET',
        headers: {
          'x-api-key': userSettings.skyvernApiKey
        }
      });

      if (!checkResponse.ok) {
        const checkResult = await checkResponse.json();
        console.log(`❌ Workflow not accessible:`, checkResult);
        return {
          success: false,
          error: 'Workflow not found or not accessible',
          message: `Cannot access workflow ${workflowId}. This might be a workflow from a different organization or created with a different API key.`,
          details: checkResult,
          troubleshooting: {
            workflowId,
            currentOrganization: userSettings.skyvernApiKey ? this.extractOrgFromApiKey(userSettings.skyvernApiKey) : 'No API key',
            suggestion: 'Check if this workflow was created manually in Skyvern UI or with a different API key'
          }
        };
      }

      const workflowInfo = await checkResponse.json();
      console.log(`✅ Workflow found:`, workflowInfo);

      // Try multiple delete endpoint formats (Skyvern API may have different patterns)
      const deleteEndpoints = [
        `${userSettings.skyvernBaseUrl}/api/v1/workflows/${workflowId}`,
        `${userSettings.skyvernBaseUrl}/api/v1/workflows/${workflowId}/delete`,
      ];

      let deleteResponse = null;
      let deleteResult = null;

      for (const endpoint of deleteEndpoints) {
        console.log(`🔧 Trying DELETE endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'x-api-key': userSettings.skyvernApiKey
          }
        });

        if (response.ok) {
          deleteResponse = response;
          console.log(`✅ Delete successful with endpoint: ${endpoint}`);
          break;
        } else {
          const error = await response.json();
          console.log(`❌ Delete failed with ${response.status} at ${endpoint}:`, error);
          deleteResult = error;
        }
      }

      if (!deleteResponse) {
        return {
          success: false,
          error: 'Failed to delete workflow',
          message: deleteResult?.detail || 'All delete endpoints failed',
          details: deleteResult,
          workflowInfo,
          troubleshooting: {
            attempted_endpoints: deleteEndpoints,
            workflow_status: workflowInfo.status,
            suggestion: 'Workflow exists but deletion endpoints are not responding correctly. This may be a Skyvern API issue or the workflow might be protected.'
          }
        };
      }

      // If we reach here, deletion was successful
      console.log(`🗑️ Workflow deleted successfully: ${workflowId}`);

      return {
        success: true,
        message: 'Workflow template deleted successfully'
      };

    } catch (error) {
      console.error(`💥 Delete workflow error:`, error);
      return {
        success: false,
        error: 'Failed to delete workflow',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper method to extract organization from API key
  private extractOrgFromApiKey(apiKey: string): string {
    try {
      const parts = apiKey.split('.');
      if (parts.length !== 3) return 'Invalid JWT format';
      
      const payload = parts[1];
      const padding = 4 - (payload.length % 4);
      const paddedPayload = padding !== 4 ? payload + '='.repeat(padding) : payload;
      
      const decoded = Buffer.from(paddedPayload, 'base64').toString('utf-8');
      const parsedPayload = JSON.parse(decoded);
      return parsedPayload.sub || 'Unknown organization';
    } catch (error) {
      return 'Failed to decode API key';
    }
  }

  @Post('generate-api-key')
  @ApiOperation({ summary: 'Generate a new Skyvern API key for the user' })
  async generateSkyvernApiKey(@User("id") userId: string, @User("name") userName: string) {
    try {
      // Create a user-specific organization in Skyvern
      const orgName = `ReactiveResume-${userName}-${Date.now()}`;
      
      const response = await fetch('http://localhost:8000/internal/create-organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          organization_name: orgName,
          webhook_callback_url: `http://host.docker.internal:3000/api/automation/process-linkedin-jobs?userId=${userId}`
        })
      });

      if (!response.ok) {
        // Fallback: Use Docker exec to create organization
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const { stdout } = await execAsync(
          `docker exec skyvern-api python scripts/create_organization.py "${orgName}"`
        );
        
        // Extract API token from output
        const tokenMatch = stdout.match(/token='([^']+)'/);
        if (!tokenMatch) {
          throw new Error('Failed to extract API token from organization creation');
        }
        
        const apiKey = tokenMatch[1];
        
        // Save to user's settings
        await this.prisma.userLLMSettings.upsert({
          where: { userId },
          update: {
            skyvernApiKey: apiKey,
            skyvernEnabled: true,
          },
          create: {
            userId,
            skyvernApiKey: apiKey,
            skyvernBaseUrl: 'http://localhost:8000',
            skyvernEnabled: true,
          }
        });
      
      return {
          success: true,
          message: 'Skyvern API key generated and configured successfully',
          apiKey: apiKey.slice(0, 20) + '...', // Don't return full key in response
          organizationName: orgName
        };
      }
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate API key',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure Skyvern is running on localhost:8000'
      };
    }
  }

}


