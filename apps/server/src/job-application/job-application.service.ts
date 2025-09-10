// import * as fs from "node:fs";
// import path from "node:path";

import { Injectable, Logger } from "@nestjs/common";
// import { createId } from "@paralleldrive/cuid2";
import { JobApplication } from "@prisma/client";
import { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { CompanyService } from "@/server/company/company.service";
import { CompanyResearchService } from "@/server/company/company-research.service";
import { ContactMessageService } from "@/server/contact-message/contact-message.service";
import { ContentLibraryService } from "@/server/content-library/content-library.service";
// import { ContentMatchingService } from "@/server/content-matching/content-matching.service";
import { CoverLetterService } from "@/server/cover-letter/cover-letter.service";
// import { DebugLoggerService } from "@/server/debug/debug-logger.service";
import { EmbeddingService } from "@/server/embedding/embedding.service";
import { LLMService } from "@/server/llm/llm.service";

import { JobAnalysisService, type JobAnalysisResult } from "./job-analysis.service";
import { ResumeGenerationService } from "./resume-generation.service";

@Injectable()
export class JobApplicationService {
  private readonly logger = new Logger(JobApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly contentLibraryService: ContentLibraryService,
    private readonly coverLetterService: CoverLetterService,
    private readonly embeddingService: EmbeddingService,
    private readonly companyService: CompanyService,
    private readonly companyResearchService: CompanyResearchService,
    private readonly contactMessageService: ContactMessageService,
    private readonly jobAnalysisService: JobAnalysisService,
    private readonly resumeGenerationService: ResumeGenerationService,
  ) {}


  async create(
    userId: string,
    createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.prisma.jobApplication.create({
      data: {
        title: createJobApplicationDto.title,
        companyName: createJobApplicationDto.companyName,
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
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    // Get the current job application to check if embedding needs updating
    const currentJob = await this.findOne(id, userId);
    if (!currentJob) {
      throw new Error("Job application not found");
    }

    // Convert DTO to Prisma update format
    const updateData: any = {};

    // Copy basic fields
    if (updateJobApplicationDto.title !== undefined)
      updateData.title = updateJobApplicationDto.title;
    if (updateJobApplicationDto.companyName !== undefined)
      updateData.companyName = updateJobApplicationDto.companyName;
    if (updateJobApplicationDto.description !== undefined)
      updateData.description = updateJobApplicationDto.description;
    if (updateJobApplicationDto.url !== undefined) updateData.url = updateJobApplicationDto.url;
    if (updateJobApplicationDto.notes !== undefined)
      updateData.notes = updateJobApplicationDto.notes;
    if (updateJobApplicationDto.status !== undefined)
      updateData.status = updateJobApplicationDto.status;
    if (updateJobApplicationDto.appliedDate !== undefined)
      updateData.appliedDate = updateJobApplicationDto.appliedDate;

    // Convert arrays to JSON strings for database storage
    if (updateJobApplicationDto.requirements !== undefined) {
      updateData.requirements = JSON.stringify(updateJobApplicationDto.requirements);
    }
    if (updateJobApplicationDto.extractedTags !== undefined) {
      updateData.extractedTags = JSON.stringify(updateJobApplicationDto.extractedTags);
    }

    // Check if embedding-relevant fields have changed
    const embeddingFieldsChanged =
      updateJobApplicationDto.title !== undefined ||
      updateJobApplicationDto.companyName !== undefined ||
      updateJobApplicationDto.description !== undefined ||
      updateJobApplicationDto.requirements !== undefined ||
      updateJobApplicationDto.extractedTags !== undefined;

    if (embeddingFieldsChanged) {
      try {
        // Create new job embedding text with updated data
        const newTitle = updateJobApplicationDto.title ?? currentJob.title;
        const newCompany = updateJobApplicationDto.companyName ?? currentJob.companyName;
        const newDescription = updateJobApplicationDto.description ?? currentJob.description ?? "";
        const newRequirements =
          updateJobApplicationDto.requirements ?? JSON.parse(currentJob.requirements || "[]");
        const newExtractedTags =
          updateJobApplicationDto.extractedTags ?? JSON.parse(currentJob.extractedTags || "[]");

        const jobEmbeddingText = this.createJobEmbeddingText(
          newTitle,
          newCompany,
          newDescription,
          newRequirements,
          newExtractedTags,
        );

        // Check if we need to regenerate embedding
        const newHash = this.embeddingService.generateHash(jobEmbeddingText);

        if (!currentJob.embeddingHash || currentJob.embeddingHash !== newHash) {
          this.logger.log(
            `Job data changed, regenerating embedding for job: ${newTitle} at ${newCompany}`,
          );

          const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
          updateData.embedding = this.embeddingService.serializeEmbedding(
            embeddingResult.embedding,
          );
          updateData.embeddingHash = embeddingResult.hash;

          this.logger.log(
            `Updated embedding for job (hash: ${embeddingResult.hash.slice(0, 8)}...)`,
          );
        } else {
          this.logger.log(
            `Job data unchanged, keeping existing embedding (hash: ${newHash.slice(0, 8)}...)`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Failed to update embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        // Continue without updating embedding
      }
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
   * Extract company information from job posting and match/create company record
   */
  private async extractAndMatchCompany(
    companyName: string,
    jobDescription: string,
    jobUrl?: string,
  ): Promise<{ companyId: string; isNew: boolean; analysisStatus: "pending" | "completed" }> {
    // Delegate to CompanyResearchService
    return this.companyResearchService.extractAndMatchCompany(
      companyName,
      jobDescription,
      jobUrl,
    );
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

    // Use JobAnalysisService for job posting analysis
    const analysisResult = await this.jobAnalysisService.analyzeJobPosting(jobText);

    return {
      analysisResult,
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

    // Extract and match company
    const companyResult = await this.extractAndMatchCompany(
      analysisData.company,
      analysisData.description,
      url,
    );

    // Generate embedding for the job data
    let embedding: string | null = null;
    let embeddingHash: string | null = null;

    try {
      const jobEmbeddingText = this.createJobEmbeddingText(
        analysisData.title,
        analysisData.company,
        analysisData.description,
        analysisData.requirements ?? [],
        analysisData.extractedTags ?? [],
      );

      // Check if we need to generate embedding (always generate for new jobs)
      const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
      embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
      embeddingHash = embeddingResult.hash;

      this.logger.log(
        `Generated embedding for job: ${analysisData.title} at ${analysisData.company} (hash: ${embeddingHash.slice(0, 8)}...)`,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to generate embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      // Continue without embedding - the system should still work
    }

    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: analysisData.title,
        companyName: analysisData.company,
        description: analysisData.description,
        requirements: JSON.stringify(analysisData.requirements ?? []),
        extractedTags: JSON.stringify(analysisData.extractedTags ?? []),
        url: url ?? "",
        embedding,
        embeddingHash,
        userId,
        companyId: companyResult.companyId, // Link to company
      },
    });

    this.logger.log(
      `Created job application with company link: ${jobApplication.id} -> ${companyResult.companyId} (${companyResult.isNew ? "new" : "existing"} company)`,
    );

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

    // Step 1: Analyze the job posting with LLM using user's settings
    const analysisResult = await this.llmService.analyzeJobPostingForUser(userId, jobText);

    if (!analysisResult.success) {
      throw new Error(`Job analysis failed: ${analysisResult.error}`);
    }

    const jobData = analysisResult.data!;

    // Step 2: Extract and match company
    const companyResult = await this.extractAndMatchCompany(
      jobData.company,
      jobData.description,
      url,
    );

    // Step 3: Generate embedding for the job data
    let embedding: string | null = null;
    let embeddingHash: string | null = null;

    try {
      const jobEmbeddingText = this.createJobEmbeddingText(
        jobData.title,
        jobData.company,
        jobData.description,
        jobData.requirements,
        jobData.extractedTags,
      );

      const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
      embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
      embeddingHash = embeddingResult.hash;

      this.logger.log(`Generated embedding for job: ${jobData.title} at ${jobData.company}`);
    } catch (error) {
      this.logger.warn(
        `Failed to generate embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      // Continue without embedding - the system should still work
    }

    // Step 4: Create the job application with embedding and company link
    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: jobData.title,
        companyName: jobData.company,
        description: jobData.description,
        requirements: JSON.stringify(jobData.requirements),
        extractedTags: JSON.stringify(jobData.extractedTags),
        url: url || "",
        embedding,
        embeddingHash,
        userId,
        companyId: companyResult.companyId, // Link to company
      },
    });

    this.logger.log(
      `Created job application with company link: ${jobApplication.id} -> ${companyResult.companyId} (${companyResult.isNew ? "new" : "existing"} company)`,
    );

    // Step 5: Get user's content library
    const userContent = await this.contentLibraryService.findAll(userId);

    // Step 5: Match content to job requirements using RAG-based matching
    const contentMatches = await this.llmService.matchContentToJobRAG(
      userId,
      jobData.requirements,
      jobData.description,
    );

    // Analysis and content matching completed - no need to store generated content records

    return {
      jobApplication,
      analysisResult: jobData,
      contentMatches: contentMatches.success ? contentMatches.data! : [],
    };
  }

  /**
   * Generate tailored resume - CLEAN DELEGATION to ResumeGenerationService
   * JobApplicationService provides job context, ResumeGenerationService handles sophisticated logic
   */
  async generateTailoredResume(
    jobApplicationId: string,
    userId: string,
  ): Promise<{
    resume: any;
    selectedContent: any[];
    suggestions: string[];
    tailoringResult?: any;
  }> {
    this.logger.log(`Generating tailored resume for job application ${jobApplicationId} (delegating to ResumeGenerationService)`);

    // Get job application context (JobApplicationService responsibility)
    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Delegate sophisticated logic to ResumeGenerationService (no service-within-service)
    return this.resumeGenerationService.generateTailoredResume(jobApplication, userId);
  }


  /**
   * Create consistent embedding text from job data
   * This text will be used to generate embeddings for job applications
   */
  private createJobEmbeddingText(
    title: string,
    company: string,
    description: string,
    requirements: string[],
    extractedTags: string[],
  ): string {
    // Create a comprehensive text representation of the job
    const parts: string[] = [];

    // Add job title and company
    parts.push(`Job Title: ${title}`, `Company: ${company}`);

    // Add description (truncate if too long)
    if (description) {
      const truncatedDescription =
        description.length > 1000 ? description.slice(0, 1000) + "..." : description;
      parts.push(`Description: ${truncatedDescription}`);
    }

    // Add requirements
    if (requirements.length > 0) {
      parts.push(`Requirements: ${requirements.join(". ")}`);
    }

    // Add extracted tags/skills
    if (extractedTags.length > 0) {
      parts.push(`Key Skills: ${extractedTags.join(", ")}`);
    }

    return parts.join("\n\n");
  }




  /**
   * Generate Tailored Cover Letter following the mass-production workflow
   * This implements the token-based template approach from the cover letter content library document
   */
  async generateTailoredCoverLetter(
    jobApplicationId: string,
    userId: string,
    options?: {
      templateName?: string;
      tone?: string;
      maxParagraphs?: number;
      selectedStoryIds?: string[];
    },
  ): Promise<{
    coverLetter: any; // Enhanced CoverLetter object with metadata
    usedContent: any[];
    companyThemes: string[];
    selectedParagraphs: any[];
    template: string;
    tone: string;
    metadata: {
      companyValueAlignment: number;
      contentDiversity: number;
      overallFitScore: number;
    };
  }> {
    // Delegate to CoverLetterService for generation and database persistence
    return this.coverLetterService.generateTailoredCoverLetter(jobApplicationId, userId, options);
  }




  /**
   * Generate Contact Messages for Job Application
   */
  async generateContactMessages(
    jobApplicationId: string,
    userId: string,
    contactId: string,
    messageType: "email" | "linkedin" | "general",
    customInstructions?: string,
  ): Promise<{
    message: string;
    type: string;
    contactInfo: any;
  }> {
    this.logger.debug(`Generating contact message for job application ${jobApplicationId}`);

    try {
      const jobApplication = await this.findOne(jobApplicationId, userId);
      if (!jobApplication) {
        throw new Error("Job application not found");
      }

      // Delegate to ContactMessageService which owns LLM generation and persistence
      const created = await this.contactMessageService.generateMessage(
        userId,
        contactId,
        messageType,
        customInstructions,
      );

      return {
        message: created.content,
        type: created.type,
        contactInfo: created.contact
          ? { name: created.contact.name, email: created.contact.email }
          : null,
      };
    } catch (error) {
      this.logger.error(
        `Contact message generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Analyze Company for Job Application
   */
  async analyzeCompanyForJob(
    jobApplicationId: string,
    userId: string,
  ): Promise<{
    culture: string;
    values: string[];
    mission: string;
    industry: string;
    reputation: string;
    growth: string;
    technology: string;
    benefits: string;
    opportunities: string;
  }> {
    this.logger.debug(`Analyzing company for job application ${jobApplicationId}`);

    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Use CompanyResearchService for company analysis
    const result = await this.companyResearchService.analyzeCompanyForJob(
      jobApplication.companyId,
      jobApplication.companyName || "Unknown Company",
      jobApplication.url || undefined,
      jobApplication.description || undefined,
    );

    // If no company was linked, create the link
    if (!jobApplication.companyId && result) {
      // Try to find the company that was created during analysis
      const company = await this.companyService.findByName(jobApplication.companyName || "");
      if (company) {
        await this.update(jobApplicationId, userId, {
          companyId: company.id,
        });
      }
    }

    return result;
  }

  /**
   * Get Job Application with Enhanced Data
   */
  async findOneWithEnhancedData(id: string, userId: string): Promise<any> {
    const jobApplication = await this.findOne(id, userId);
    if (!jobApplication) {
      return null;
    }

    // Get company information
    let company = null;
    if (jobApplication.companyId) {
      company = await this.prisma.company.findUnique({
        where: { id: jobApplication.companyId },
      });
    }

    // Get contacts
    const contacts = await this.prisma.contact.findMany({
      where: { jobApplicationId: id, userId },
      include: {
        company: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Get questions
    const questions = await this.prisma.jobApplicationQuestion.findMany({
      where: { jobApplicationId: id },
      orderBy: { priority: "asc" },
    });

    // Get cover letter content
    const coverLetterContent = await this.prisma.coverLetterContent.findMany({
      where: { userId },
      include: {
        content: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return {
      ...jobApplication,
      company,
      contacts,
      questions,
      coverLetterContent,
    };
  }
}
