import { Injectable, Logger } from "@nestjs/common";
import { JobApplication } from "@prisma/client";
import { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { LLMService } from "@/server/llm/llm.service";

export type JobAnalysisResult = {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  extractedTags: string[];
  location?: string;
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
};

@Injectable()
export class JobApplicationService {
  private readonly logger = new Logger(JobApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly contentLibraryService: ContentLibraryService,
  ) {}

  async create(
    userId: string,
    createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.prisma.jobApplication.create({
      data: {
        title: createJobApplicationDto.title,
        company: createJobApplicationDto.company,
        description: createJobApplicationDto.description ?? "",
        url: createJobApplicationDto.url,
        notes: createJobApplicationDto.notes,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<JobApplication[]> {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resumes: true,
        coverLetters: true,
        interviews: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<JobApplication | null> {
    return this.prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        resumes: true,
        coverLetters: true,
        interviews: true,
        generatedContent: true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    // Convert DTO to Prisma update format
    const updateData: any = {};
    
    // Copy basic fields
    if (updateJobApplicationDto.title !== undefined) updateData.title = updateJobApplicationDto.title;
    if (updateJobApplicationDto.company !== undefined) updateData.company = updateJobApplicationDto.company;
    if (updateJobApplicationDto.description !== undefined) updateData.description = updateJobApplicationDto.description;
    if (updateJobApplicationDto.url !== undefined) updateData.url = updateJobApplicationDto.url;
    if (updateJobApplicationDto.notes !== undefined) updateData.notes = updateJobApplicationDto.notes;
    if (updateJobApplicationDto.status !== undefined) updateData.status = updateJobApplicationDto.status;
    if (updateJobApplicationDto.appliedDate !== undefined) updateData.appliedDate = updateJobApplicationDto.appliedDate;
    
    // Convert arrays to JSON strings for database storage
    if (updateJobApplicationDto.requirements !== undefined) {
      updateData.requirements = JSON.stringify(updateJobApplicationDto.requirements);
    }
    if (updateJobApplicationDto.extractedTags !== undefined) {
      updateData.extractedTags = JSON.stringify(updateJobApplicationDto.extractedTags);
    }

    return this.prisma.jobApplication.update({
      where: { id, userId },
      data: updateData,
    });
  }

  async remove(id: string, userId: string): Promise<JobApplication> {
    return this.prisma.jobApplication.delete({
      where: { id, userId },
    });
  }

  /**
   * Analyze a job posting URL or text - ONLY analysis, no creation
   */
  async analyzeJobPosting(
    jobText: string,
    url?: string,
  ): Promise<{
    analysisResult: JobAnalysisResult;
  }> {
    this.logger.log(`Analyzing job posting text`);

    // Only analyze the job posting with LLM
    const analysisResult = await this.llmService.analyzeJobPosting(jobText);

    if (!analysisResult.success || !analysisResult.data) {
      throw new Error(`Job analysis failed: ${analysisResult.error ?? 'Unknown error'}`);
    }

    return {
      analysisResult: analysisResult.data,
    };
  }

  /**
   * Create job application from analyzed data
   */
  async createFromAnalysis(
    userId: string,
    analysisData: JobAnalysisResult,
    url?: string,
  ): Promise<JobApplication> {
    this.logger.log(`Creating job application from analysis for user ${userId}`);

    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: analysisData.title,
        company: analysisData.company,
        description: analysisData.description,
        requirements: JSON.stringify(analysisData.requirements ?? []),
        extractedTags: JSON.stringify(analysisData.extractedTags ?? []),
        url: url ?? "",
        userId,
      },
    });

    // Store the analysis record (without content matching)
    await this.prisma.generatedContent.create({
      data: {
        type: "job_analysis",
        prompt: `Analyze job posting: ${analysisData.title} at ${analysisData.company}`,
        response: JSON.stringify(analysisData),
        llmProvider: "ANTHROPIC",
        model: "claude-3-5-sonnet",
        contentIds: JSON.stringify([]), // Empty - no content matching at this stage
        jobApplicationId: jobApplication.id,
      },
    });

    return jobApplication;
  }

  /**
   * Analyze a job posting URL or text and create/update a job application
   */
  async analyzeAndCreateFromJobPosting(
    userId: string,
    jobText: string,
    url?: string,
  ): Promise<{
    jobApplication: JobApplication;
    analysisResult: any;
    contentMatches: any[];
  }> {
    this.logger.log(`Analyzing job posting for user ${userId}`);

    // Step 1: Analyze the job posting with LLM
    const analysisResult = await this.llmService.analyzeJobPosting(jobText);

    if (!analysisResult.success) {
      throw new Error(`Job analysis failed: ${analysisResult.error}`);
    }

    const jobData = analysisResult.data!;

    // Step 2: Create the job application
    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requirements: JSON.stringify(jobData.requirements),
        extractedTags: JSON.stringify(jobData.extractedTags),
        url: url || "",
        userId,
      },
    });

    // Step 3: Get user's content library
    const userContent = await this.contentLibraryService.findAll(userId);

    // Step 4: Match content to job requirements
    const contentMatches = await this.llmService.matchContentToJob(
      jobData.requirements,
      userContent,
      jobData.description,
    );

    // Step 5: Store the generated content record
    await this.prisma.generatedContent.create({
      data: {
        type: "job_analysis",
        prompt: `Analyze job posting: ${jobText.slice(0, 200)}...`,
        response: JSON.stringify(jobData),
        llmProvider: "ANTHROPIC", // This should come from the service
        model: "claude-3-5-sonnet", // This should come from the service
        contentIds: JSON.stringify(contentMatches.success ? contentMatches.data!.map((m) => m.contentId) : []),
        jobApplicationId: jobApplication.id,
      },
    });

    return {
      jobApplication,
      analysisResult: jobData,
      contentMatches: contentMatches.success ? contentMatches.data! : [],
    };
  }

  /**
   * Generate a tailored resume for a specific job application
   */
  async generateTailoredResume(
    jobApplicationId: string,
    userId: string,
    selectedContentIds?: string[],
  ): Promise<{
    resumeSummary: string;
    selectedContent: any[];
    suggestions: string[];
  }> {
    this.logger.log(`Generating tailored resume for job application ${jobApplicationId}`);

    // Get job application
    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get user's content
    let selectedContent: any[] = [];

    if (selectedContentIds?.length) {
      // Use user-selected content
      for (const contentId of selectedContentIds) {
        const content = await this.contentLibraryService.findOne(contentId, userId);
        if (content) {
          selectedContent.push(content);
        }
      }
    } else {
      // Auto-select best matching content
      const allContent = await this.contentLibraryService.findAll(userId);
      const contentMatches = await this.llmService.matchContentToJob(
        JSON.parse(jobApplication.requirements || "[]"),
        allContent,
        jobApplication.description || "",
      );

      if (contentMatches.success) {
        // Select content with score >= 70
        const highScoreMatches = contentMatches.data!.filter((match) => match.score >= 70);
        selectedContent = allContent.filter((content) =>
          highScoreMatches.some((match) => match.contentId === content.id),
        );
      }
    }

    // Get user profile (you'll need to implement this)
    const userProfile = { name: "User", email: "user@example.com" }; // TODO: Get real user profile

    // Generate resume summary
    const summaryResult = await this.llmService.generateResumeSummary(
      jobApplication.description || "",
      selectedContent,
      userProfile,
    );

    if (!summaryResult.success) {
      throw new Error(`Resume generation failed: ${summaryResult.error}`);
    }

    // Store the generated content
    await this.prisma.generatedContent.create({
      data: {
        type: "resume_summary",
        prompt: `Generate resume summary for ${jobApplication.title} at ${jobApplication.company}`,
        response: summaryResult.data!,
        llmProvider: "ANTHROPIC",
        model: "claude-3-5-sonnet",
        contentIds: JSON.stringify(selectedContent.map((c) => c.id)),
        jobApplicationId: jobApplication.id,
      },
    });

    return {
      resumeSummary: summaryResult.data!,
      selectedContent,
      suggestions: [
        "Consider adding quantified achievements",
        "Highlight relevant technical skills",
        "Tailor keywords to match job description",
      ],
    };
  }

  /**
   * Generate a personalized cover letter
   */
  async generateCoverLetter(
    jobApplicationId: string,
    userId: string,
    selectedContentIds?: string[],
  ): Promise<string> {
    this.logger.log(`Generating cover letter for job application ${jobApplicationId}`);

    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get selected content (similar logic to resume generation)
    const selectedContent: any[] = [];
    if (selectedContentIds?.length) {
      for (const contentId of selectedContentIds) {
        const content = await this.contentLibraryService.findOne(contentId, userId);
        if (content) {
          selectedContent.push(content);
        }
      }
    }

    const userProfile = { name: "User", email: "user@example.com" }; // TODO: Get real user profile

    const coverLetterResult = await this.llmService.generateCoverLetter(
      jobApplication.description || "",
      jobApplication.company,
      userProfile,
      selectedContent,
    );

    if (!coverLetterResult.success) {
      throw new Error(`Cover letter generation failed: ${coverLetterResult.error}`);
    }

    // Save cover letter
    await this.prisma.coverLetter.create({
      data: {
        content: coverLetterResult.data!,
        jobApplicationId: jobApplication.id,
      },
    });

    // Store generation record
    await this.prisma.generatedContent.create({
      data: {
        type: "cover_letter",
        prompt: `Generate cover letter for ${jobApplication.title} at ${jobApplication.company}`,
        response: coverLetterResult.data!,
        llmProvider: "ANTHROPIC",
        model: "claude-3-5-sonnet",
        contentIds: JSON.stringify(selectedContent.map((c) => c.id)),
        jobApplicationId: jobApplication.id,
      },
    });

    return coverLetterResult.data!;
  }

  /**
   * Generate interview questions for practice
   */
  async generateInterviewQuestions(jobApplicationId: string, userId: string): Promise<string[]> {
    this.logger.log(`Generating interview questions for job application ${jobApplicationId}`);

    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    const userContent = await this.contentLibraryService.findAll(userId);

    const questionsResult = await this.llmService.generateInterviewQuestions(
      jobApplication.description || "",
      userContent,
    );

    if (!questionsResult.success) {
      throw new Error(`Interview questions generation failed: ${questionsResult.error}`);
    }

    return questionsResult.data!;
  }
}
