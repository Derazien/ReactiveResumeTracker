import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { JobApplication } from "@prisma/client";
import type { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";

// TEMPORARILY COMMENTED OUT FOR TESTING - REMOVE WHEN ADDING AUTH BACK
// import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
// import { User } from "@/server/user/decorators/user.decorator";

import { JobApplicationService } from "./job-application.service";

// TODO: Temporary mock user ID for testing - replace with actual auth when ready
const MOCK_USER_ID = "mock-user-123";

@ApiTags("Job Applications")
@Controller("job-applications")
// TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
// @UseGuards(TwoFactorGuard)
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new job application" })
  create(
    // TEMPORARILY USING MOCK USER - RESTORE @User() user: UserEntity WHEN ADDING AUTH BACK
    @Body() createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationService.create(MOCK_USER_ID, createJobApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all job applications for the authenticated user" })
  findAll(): Promise<JobApplication[]> {
    return this.jobApplicationService.findAll(MOCK_USER_ID);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a specific job application" })
  findOne(@Param("id") id: string): Promise<JobApplication | null> {
    return this.jobApplicationService.findOne(id, MOCK_USER_ID);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a job application" })
  update(
    @Param("id") id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.jobApplicationService.update(id, MOCK_USER_ID, updateJobApplicationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a job application" })
  remove(@Param("id") id: string): Promise<JobApplication> {
    return this.jobApplicationService.remove(id, MOCK_USER_ID);
  }

  // LLM-Powered Endpoints

  @Post("analyze-from-text")
  @ApiOperation({ summary: "Analyze job posting text and create application with LLM" })
  async analyzeFromText(@Body() body: { jobText: string; url?: string }) {
    return this.jobApplicationService.analyzeAndCreateFromJobPosting(
      MOCK_USER_ID,
      body.jobText,
      body.url,
    );
  }

  @Post(":id/generate-resume")
  @ApiOperation({ summary: "Generate tailored resume for job application" })
  async generateTailoredResume(
    @Param("id") id: string,
    @Body() body: { selectedContentIds?: string[] },
  ) {
    return this.jobApplicationService.generateTailoredResume(id, MOCK_USER_ID, body.selectedContentIds);
  }

  @Post(":id/generate-cover-letter")
  @ApiOperation({ summary: "Generate personalized cover letter" })
  async generateCoverLetter(
    @Param("id") id: string,
    @Body() body: { selectedContentIds?: string[] },
  ) {
    const coverLetter = await this.jobApplicationService.generateCoverLetter(
      id,
      MOCK_USER_ID,
      body.selectedContentIds,
    );
    return { coverLetter };
  }

  @Post(":id/generate-interview-questions")
  @ApiOperation({ summary: "Generate interview practice questions" })
  async generateInterviewQuestions(@Param("id") id: string) {
    const questions = await this.jobApplicationService.generateInterviewQuestions(id, MOCK_USER_ID);
    return { questions };
  }
}
