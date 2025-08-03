import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { JobApplication } from "@prisma/client";
import type { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { type JobAnalysisResult, JobApplicationService } from "./job-application.service";

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
  @ApiOperation({ summary: "Generate personalized cover letter" })
  async generateCoverLetter(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() body: { selectedContentIds?: string[] },
  ) {
    const coverLetter = await this.jobApplicationService.generateCoverLetter(
      id,
      userId,
      body.selectedContentIds,
    );
    return { coverLetter };
  }

  @Post(":id/generate-interview-questions")
  @ApiOperation({ summary: "Generate interview practice questions" })
  async generateInterviewQuestions(@User("id") userId: string, @Param("id") id: string) {
    const questions = await this.jobApplicationService.generateInterviewQuestions(id, userId);
    return { questions };
  }
}
