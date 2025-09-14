import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Automation Integration')
@Controller('automation')
export class AutomationIntegrationController {
  
  @Get('status')
  @ApiOperation({ summary: 'Check automation system status' })
  async getAutomationStatus() {
    try {
      // Check if Skyvern is running by testing the root endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const skyvernResponse = await fetch('http://localhost:8000/', {
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
          : 'Start automation system with: docker-compose -f docker-compose.automation.yml up -d'
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
  @ApiOperation({ summary: 'Execute complete LinkedIn automation workflow' })
  async executeLinkedInWorkflow(@Body() body: {
    jobKeywords: string;
    location: string;
    remoteStatus?: string;
    timePeriod?: string;
    maxJobs?: number;
    includeCompanyResearch?: boolean;
    includeContactExtraction?: boolean;
    waitForUserLogin?: boolean;
  }) {
    try {
      // Build LinkedIn search URL with filters
      const searchParams = new URLSearchParams({
        keywords: body.jobKeywords,
        location: body.location
      });

      // Add remote status filter
      if (body.remoteStatus && body.remoteStatus !== 'any') {
        searchParams.append('f_WT', '2'); // Remote work filter
        if (body.remoteStatus === 'remote') {
          searchParams.append('f_WT', '2'); // Remote only
        } else if (body.remoteStatus === 'on-site') {
          searchParams.append('f_WT', '1'); // On-site only
        } else if (body.remoteStatus === 'hybrid') {
          searchParams.append('f_WT', '3'); // Hybrid
        }
      }

      // Add time period filter
      if (body.timePeriod && body.timePeriod !== 'any') {
        const timeFilters: Record<string, string> = {
          'past24h': 'r86400', // Past 24 hours
          'pastWeek': 'r604800', // Past week
          'pastMonth': 'r2592000' // Past month
        };
        if (timeFilters[body.timePeriod]) {
          searchParams.append('f_TPR', timeFilters[body.timePeriod]);
        }
      }

      const linkedinSearchUrl = `https://www.linkedin.com/jobs/search/?${searchParams.toString()}`;

      // Step 1: Create job search task
      const jobSearchTask = {
        url: linkedinSearchUrl,
        navigation_goal: `Search LinkedIn Jobs for "${body.jobKeywords}" in "${body.location}". ${body.waitForUserLogin ? 'Wait for user to login if needed.' : ''}`,
        data_extraction_goal: `
          Extract job listings with:
          - Job title, company name, description, URL, location, salary
          - Company LinkedIn page URL
          - Limit to ${body.maxJobs || 5} jobs
          - Remote status: ${body.remoteStatus || 'any'}
          - Time period: ${body.timePeriod || 'any'}
        `,
        extracted_information_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              job_title: { type: 'string' },
              company_name: { type: 'string' },
              job_description: { type: 'string' },
              job_url: { type: 'string' },
              location: { type: 'string' },
              salary: { type: 'string' },
              company_linkedin_url: { type: 'string' }
            }
          }
        },
        max_steps: 50,
        max_retries_per_step: 3,
        model: 'ANTHROPIC_CLAUDE3.5_SONNET',
        webhook_callback_url: 'http://localhost:3000/api/automation/linkedin-job-search-callback'
      };

      // Get API key from environment or use placeholder
      const apiKey = process.env.SKYVERN_API_KEY || 'PLACEHOLDER_API_KEY';
      
      if (apiKey === 'PLACEHOLDER_API_KEY') {
        return {
          success: false,
          error: 'Skyvern API key not configured',
          message: 'Please get your API key from Skyvern UI (http://localhost:8081) and set SKYVERN_API_KEY environment variable',
          instructions: {
            step1: 'Open Skyvern UI: http://localhost:8081',
            step2: 'Create account or login',
            step3: 'Go to Settings and copy your API key',
            step4: 'Set environment variable: SKYVERN_API_KEY=your_api_key_here',
            step5: 'Restart the server'
          }
        };
      }

      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(jobSearchTask)
      });

      const result = await response.json();
      
      console.log('Skyvern API Response Status:', response.status);
      console.log('Skyvern API Response:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Skyvern API call failed',
          message: result.detail || result.message || `HTTP ${response.status}: ${response.statusText}`,
          skyvernResponse: result,
          workflowConfig: body
        };
      }
      
      return {
        success: true,
        taskId: result.task_id,
        message: 'LinkedIn automation workflow started',
        monitorUrl: `http://localhost:8081/tasks/${result.task_id}`,
        workflowConfig: body
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to start LinkedIn automation workflow',
        message: error.message
      };
    }
  }

  @Post('execute-job-search')
  @ApiOperation({ summary: 'Execute job search automation via Skyvern API' })
  async executeJobSearch(@Body() body: {
    instruction: string;
    targetUrl?: string;
    maxJobs?: number;
  }) {
    try {
      // Simplified extraction schema - let your APIs handle the complex logic
      const linkedinJobExtractionSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // Basic job data for API calls
            job_title: { 
              type: 'string',
              description: 'The job title from the posting'
            },
            company_name: { 
              type: 'string',
              description: 'The company name'
            },
            job_description: { 
              type: 'string',
              description: 'Full job description text'
            },
            job_url: { 
              type: 'string',
              description: 'Direct URL to the job posting'
            },
            location: { 
              type: 'string',
              description: 'Job location (e.g., "Remote", "San Francisco, CA")'
            },
            salary: { 
              type: 'string',
              description: 'Salary range if available (e.g., "$120,000 - $150,000")'
            },
            industry: { 
              type: 'string',
              description: 'Company industry (e.g., "Technology", "Healthcare")'
            },
            
            // Company data for API calls
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
              description: 'Company industry'
            },
            company_linkedin: { 
              type: 'string',
              description: 'Company LinkedIn page URL'
            },
            
            // Contact data for API calls
            contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { 
                    type: 'string',
                    description: 'Contact person name'
                  },
                  title: { 
                    type: 'string',
                    description: 'Contact person job title'
                  },
                  linkedin_url: { 
                    type: 'string',
                    description: 'LinkedIn profile URL'
                  },
                  email: { 
                    type: 'string',
                    description: 'Email if available'
                  }
                }
              }
            }
          }
        }
      };

      // Direct call to Skyvern API
      const skyvernTask = {
        url: body.targetUrl || 'https://linkedin.com/jobs',
        navigation_goal: `Search for jobs based on instruction: ${body.instruction}`,
        data_extraction_goal: `
          For each job posting found:
          1. Extract job details: title, company, description, URL, salary, location, industry
          2. Extract job requirements and skills as arrays
          3. Navigate to company page and extract company information
          4. Find 2-3 relevant contacts (HR, Engineering Manager, Recruiter)
          5. Extract contact details: name, title, LinkedIn profile, bio, connection level
        `,
        extracted_information_schema: linkedinJobExtractionSchema
      };

      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.SKYVERN_API_KEY || 'PLACEHOLDER_API_KEY'
        },
        body: JSON.stringify(skyvernTask)
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        taskId: result.task_id,
        message: response.ok ? 'Job search automation started' : 'Failed to start automation',
        skyvernResult: result,
        monitorUrl: `http://localhost:8080/tasks/${result.task_id}` // Skyvern UI to monitor
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Failed to execute job search automation',
        message: error.message,
        hint: 'Make sure Skyvern is running on port 8000'
      };
    }
  }

  @Post('linkedin-job-search-callback')
  @ApiOperation({ summary: 'Handle LinkedIn job search results and trigger company research' })
  async handleLinkedInJobSearchCallback(@Body() data: any) {
    try {
      console.log('Received LinkedIn job search results:', data.extracted_information?.length, 'jobs');
      
      if (data.extracted_information && Array.isArray(data.extracted_information)) {
        for (const job of data.extracted_information) {
          console.log('Processing job:', job.job_title, 'at', job.company_name);
          
          // TODO: Replace with actual service calls
          // 1. Create job application via your existing API
          // const jobApp = await this.jobApplicationService.create({
          //   title: job.job_title,
          //   companyName: job.company_name,
          //   description: job.job_description,
          //   url: job.job_url,
          //   location: job.location,
          //   salary: job.salary,
          //   status: 'DRAFT'
          // });

          // For now, just log the job data
          console.log('Job data:', {
            title: job.job_title,
            company: job.company_name,
            description: job.job_description,
            url: job.job_url,
            location: job.location,
            salary: job.salary,
            companyLinkedInUrl: job.company_linkedin_url
          });

          // 2. Check if company exists (simulated)
          // let company = await this.companyService.findByName(job.company_name);
          
          // For now, assume company doesn't exist and trigger research
          if (job.company_linkedin_url) {
            console.log('Triggering company research for:', job.company_name);
            
            // 3. Create company research task
            const companyResearchTask = {
              url: job.company_linkedin_url,
              navigation_goal: `Research company: ${job.company_name}`,
              data_extraction_goal: `
                Extract company information:
                - Company description, industry, size, location
                - Company website URL
                - Company values, mission, culture
                - List of employees with their LinkedIn profiles
              `,
              extracted_information_schema: {
                type: 'object',
                properties: {
                  company_name: { type: 'string' },
                  company_description: { type: 'string' },
                  company_website: { type: 'string' },
                  industry: { type: 'string' },
                  size: { type: 'string' },
                  location: { type: 'string' },
                  values: { type: 'string' },
                  mission: { type: 'string' },
                  culture: { type: 'string' },
                  company_linkedin_url: { type: 'string' },
                  employees: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        title: { type: 'string' },
                        linkedin_url: { type: 'string' }
                      }
                    }
                  }
                }
              },
              max_steps: 30,
              max_retries_per_step: 3,
              model: 'ANTHROPIC_CLAUDE3.5_SONNET',
              webhook_callback_url: `http://localhost:3000/api/automation/company-research-callback?jobTitle=${encodeURIComponent(job.job_title)}&jobUrl=${encodeURIComponent(job.job_url)}`
            };

            const researchResponse = await fetch('http://localhost:8000/api/v1/tasks', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ5MDI1NTMwOTYsInN1YiI6Im9fNDM3Njk5NjY3MDcwNzMyMjAwIn0.M4EvUYDiR9Sr1FWbvB-EMNOAT8WWovNS47g-sxZqZec'
              },
              body: JSON.stringify(companyResearchTask)
            });

            const researchResult = await researchResponse.json();
            console.log('Company research task created:', researchResult.task_id);
          }
        }
      }
      
      return { 
        success: true, 
        message: 'LinkedIn job search results processed',
        processedJobs: data.extracted_information?.length || 0
      };
    } catch (error) {
      console.error('Error processing LinkedIn job search callback:', error);
      return { success: false, error: error.message };
    }
  }

  @Post('company-research-callback')
  @ApiOperation({ summary: 'Handle company research results' })
  async handleCompanyResearchCallback(@Body() data: any, @Query('jobTitle') jobTitle?: string, @Query('jobUrl') jobUrl?: string) {
    try {
      console.log('Received company research results for:', data.company_name);
      
      // TODO: Replace with actual service calls
      // Create company
      // const company = await this.companyService.create({
      //   name: data.company_name,
      //   description: data.company_description,
      //   website: data.company_website,
      //   industry: data.industry,
      //   size: data.size,
      //   location: data.location,
      //   values: data.values,
      //   mission: data.mission,
      //   culture: data.culture,
      //   linkedinUrl: data.company_linkedin_url
      // });

      // For now, just log the company data
      console.log('Company data:', {
        name: data.company_name,
        description: data.company_description,
        website: data.company_website,
        industry: data.industry,
        size: data.size,
        location: data.location,
        values: data.values,
        mission: data.mission,
        culture: data.culture,
        linkedinUrl: data.company_linkedin_url,
        relatedJobTitle: jobTitle,
        relatedJobUrl: jobUrl
      });

      // Create contacts if employees were found
      if (data.employees && Array.isArray(data.employees)) {
        console.log('Found employees:', data.employees.length);
        for (const employee of data.employees) {
          console.log('Employee:', employee.name, employee.title, employee.linkedin_url);
          // TODO: Create contact via your existing ContactService
          // await this.contactService.create({
          //   name: employee.name,
          //   title: employee.title,
          //   linkedinUrl: employee.linkedin_url,
          //   companyId: company.id,
          //   jobApplicationId: jobApp.id
          // });
        }
      }

      return { 
        success: true, 
        message: 'Company research completed',
        companyName: data.company_name,
        employeesFound: data.employees?.length || 0
      };
    } catch (error) {
      console.error('Error processing company research callback:', error);
      return { success: false, error: error.message };
    }
  }

  @Post('webhook-callback')
  @ApiOperation({ summary: 'Receive data from Skyvern automation (legacy)' })
  async handleSkyvernCallback(@Body() data: any) {
    try {
      console.log('Received data from Skyvern:', JSON.stringify(data, null, 2));
      
      // Process extracted job data
      if (data.extracted_information && Array.isArray(data.extracted_information)) {
        for (const job of data.extracted_information) {
          console.log('Processing job:', job.job_title, 'at', job.company_name);
          
          // TODO: Integrate with your existing JobApplicationService
          // await this.jobApplicationService.create({
          //   title: job.job_title,
          //   company: job.company_name,
          //   description: job.job_description,
          //   url: job.job_url,
          //   salary: job.salary,
          //   location: job.location,
          //   status: 'discovered'
          // });
          
          // Process contacts if available
          if (job.contacts && Array.isArray(job.contacts)) {
            for (const contact of job.contacts) {
              console.log('Processing contact:', contact.name, contact.title);
              // TODO: Integrate with your existing ContactService
            }
          }
        }
      }
      
      return { 
        success: true, 
        message: 'Data processed successfully',
        processedJobs: data.extracted_information?.length || 0
      };
    } catch (error) {
      console.error('Error processing Skyvern callback:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Failed to process Skyvern data'
      };
    }
  }

  @Post('test-automation')
  @ApiOperation({ summary: 'Test automation with a simple task' })
  async testAutomation() {
    try {
      // Simple test task with webhook callback
      const testTask = {
        url: 'https://jobs.lever.co/leverdemo',
        navigation_goal: 'Navigate to the demo job board and find available positions',
        data_extraction_goal: 'Extract the titles and descriptions of available job listings',
        extracted_information_schema: {
          type: 'array',
          items: {
            type: 'object', 
            properties: {
              job_title: { type: 'string' },
              company_name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        webhook_callback_url: 'http://localhost:3000/api/automation/webhook-callback' // Your webhook endpoint
      };

      const response = await fetch('http://localhost:8000/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.SKYVERN_API_KEY || 'PLACEHOLDER_API_KEY'
        },
        body: JSON.stringify(testTask)
      });

      const result = await response.json();
      
      return {
        success: response.ok,
        taskId: result.task_id,
        message: 'Test automation task started with webhook callback',
        monitorUrl: `http://localhost:8081/tasks/${result.task_id}`,
        testResult: result
      };
      
    } catch (error) {
      return {
        success: false,
        error: 'Automation test failed',
        message: error.message
      };
    }
  }
}


