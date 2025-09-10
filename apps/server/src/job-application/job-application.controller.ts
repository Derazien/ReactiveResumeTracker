import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { JobApplication } from "@prisma/client";
import type { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { type JobAnalysisResult } from "./job-analysis.service";
import { JobApplicationService } from "./job-application.service";

@ApiTags("Job Applications")
@Controller("job-applications")
@UseGuards(TwoFactorGuard)
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new job application" })
  create(
    @User("id") userId: string,
    @Body() createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationService.create(userId, createJobApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all job applications for the authenticated user" })
  findAll(@User("id") userId: string): Promise<JobApplication[]> {
    return this.jobApplicationService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific job application" })
  findOne(@User("id") userId: string, @Param("id") id: string): Promise<JobApplication | null> {
    return this.jobApplicationService.findOne(id, userId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a job application" })
  update(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationService.update(id, userId, updateJobApplicationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a job application" })
  remove(@User("id") userId: string, @Param("id") id: string): Promise<JobApplication> {
    return this.jobApplicationService.remove(id, userId);
  }

  // LLM-Powered Endpoints

  @Post("analyze")
  @ApiOperation({ summary: "Analyze job posting text using LLM - NO creation" })
  async analyzeJobPosting(
    @Body() body: { jobText: string; url?: string },
  ): Promise<{ analysisResult: JobAnalysisResult }> {
    return this.jobApplicationService.analyzeJobPosting(body.jobText, body.url);
  }

  @Post("create-from-analysis")
  @ApiOperation({ summary: "Create job application from previously analyzed data" })
  async createFromAnalysis(
    @User("id") userId: string,
    @Body() body: { analysisData: JobAnalysisResult; url?: string },
  ): Promise<JobApplication> {
    return this.jobApplicationService.createFromAnalysis(userId, body.analysisData, body.url);
  }

  @Post(":id/generate-resume")
  @ApiOperation({
    summary: "Generate tailored resume for job application - includes content matching",
  })
  async generateTailoredResume(@User("id") userId: string, @Param("id") id: string) {
    return this.jobApplicationService.generateTailoredResume(id, userId);
  }

  @Post(":id/generate-cover-letter")
  @ApiOperation({ summary: "Generate tailored cover letter following blueprint" })
  async generateCoverLetter(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() body: { 
      templateName?: string; 
      tone?: string;
      maxParagraphs?: number;
      selectedStoryIds?: string[];
    },
  ) {
    return this.jobApplicationService.generateTailoredCoverLetter(
      id,
      userId,
      {
        templateName: body.templateName,
        tone: body.tone,
        maxParagraphs: body.maxParagraphs,
        selectedStoryIds: body.selectedStoryIds,
      },
    );
  }


  @Post(":id/generate-contact-message")
  @ApiOperation({ summary: "Generate contact message for job application" })
  async generateContactMessages(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body()
    body: {
      contactId: string;
      messageType: "email" | "linkedin" | "general";
      customInstructions?: string;
    },
  ) {
    return this.jobApplicationService.generateContactMessages(
      id,
      userId,
      body.contactId,
      body.messageType,
      body.customInstructions,
    );
  }

  @Post(":id/analyze-company")
  @ApiOperation({ summary: "Analyze company for job application" })
  async analyzeCompanyForJob(@User("id") userId: string, @Param("id") id: string) {
    return this.jobApplicationService.analyzeCompanyForJob(id, userId);
  }

  @Get(":id/enhanced")
  @ApiOperation({
    summary:
      "Get job application with enhanced data (company, contacts, questions, cover letter content)",
  })
  async findOneWithEnhancedData(@User("id") userId: string, @Param("id") id: string) {
    return this.jobApplicationService.findOneWithEnhancedData(id, userId);
  }
}
