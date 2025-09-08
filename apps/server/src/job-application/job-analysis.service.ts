import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";
import { PrismaService } from "nestjs-prisma";

import { EmbeddingService } from "@/server/embedding/embedding.service";
import { LLMService } from "@/server/llm/llm.service";

export interface JobAnalysisResult {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  extractedTags: string[];
  location?: string;
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
}

export interface JobEmbeddingResult {
  embedding: number[];
  hash: string;
}

/**
 * Service responsible for analyzing job postings
 * Handles job description parsing, tag extraction, and embedding generation
 */
@Injectable()
export class JobAnalysisService {
  private readonly logger = new Logger(JobAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Analyze a job posting using LLM to extract structured information
   */
  async analyzeJobPosting(jobText: string, userId?: string): Promise<JobAnalysisResult> {
    this.logger.debug("Analyzing job posting with LLM");

    try {
      // Use LLM to analyze the job posting
      const analysisResult = userId
        ? await this.llmService.analyzeJobPostingForUser(userId, jobText)
        : await this.llmService.analyzeJobPosting(jobText);

      if (!analysisResult.success || !analysisResult.data) {
        throw new Error(analysisResult.error || "Failed to analyze job posting");
      }

      const jobData = analysisResult.data;

      // Extract tags from job description
      const extractedTags = await this.extractJobTags(jobData.description, userId);

      return {
        ...jobData,
        extractedTags,
      };
    } catch (error) {
      this.logger.error(
        `Job analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Extract relevant tags from job description
   */
  async extractJobTags(jobDescription: string, userId?: string): Promise<string[]> {
    try {
      const tags = await this.llmService.extractJobTags(jobDescription, userId);
      this.logger.debug(`Extracted ${tags.length} tags from job description`);
      return tags;
    } catch (error) {
      this.logger.warn(
        `Failed to extract tags: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return [];
    }
  }

  /**
   * Generate embedding for a job posting
   */
  async generateJobEmbedding(
    title: string,
    company: string,
    description: string,
    requirements: string[],
  ): Promise<JobEmbeddingResult> {
    const jobEmbeddingText = this.createJobEmbeddingText(title, company, description, requirements);
    
    try {
      const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
      const embeddingHash = this.createEmbeddingHash(jobEmbeddingText);

      this.logger.log(
        `Generated embedding for job: ${title} at ${company} (hash: ${embeddingHash.slice(0, 8)}...)`,
      );

      return {
        embedding: embeddingResult.embedding,
        hash: embeddingHash,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Create text representation of job for embedding generation
   */
  createJobEmbeddingText(
    title: string,
    company: string,
    description: string,
    requirements: string[] | string,
  ): string {
    const requirementsText = Array.isArray(requirements)
      ? requirements.join(" ")
      : typeof requirements === "string"
        ? requirements
        : "";

    return `${title} ${company} ${description} ${requirementsText}`.trim();
  }

  /**
   * Create hash of job embedding text for change detection
   */
  createEmbeddingHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  /**
   * Check if job embedding needs regeneration
   */
  async shouldRegenerateEmbedding(
    jobApplicationId: string,
    newTitle: string,
    newCompany: string,
    newDescription: string,
    newRequirements: string[] | string,
  ): Promise<boolean> {
    const currentJob = await this.prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      select: { embeddingHash: true },
    });

    if (!currentJob || !currentJob.embeddingHash) {
      return true;
    }

    const newEmbeddingText = this.createJobEmbeddingText(
      newTitle,
      newCompany,
      newDescription,
      newRequirements,
    );
    const newHash = this.createEmbeddingHash(newEmbeddingText);

    return currentJob.embeddingHash !== newHash;
  }

  /**
   * Parse job requirements from various formats
   */
  parseRequirements(requirements: any): string[] {
    if (Array.isArray(requirements)) {
      return requirements.map(r => String(r));
    }
    
    if (typeof requirements === "string") {
      try {
        const parsed = JSON.parse(requirements);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // If not JSON, split by common delimiters
        return requirements
          .split(/[;,\n]/)
          .map(r => r.trim())
          .filter(r => r.length > 0);
      }
    }
    
    return [];
  }

  /**
   * Analyze job market trends for a specific role
   * Useful for understanding competitive landscape
   */
  async analyzeJobMarketTrends(
    jobTitle: string,
    location?: string,
  ): Promise<{
    averageSalary?: string;
    demandLevel?: "high" | "medium" | "low";
    commonSkills?: string[];
    growthTrend?: string;
  }> {
    this.logger.debug(`Analyzing market trends for: ${jobTitle}`);

    // TODO: Integrate with job market APIs
    // - Indeed API
    // - Glassdoor API
    // - LinkedIn Jobs API
    // - Bureau of Labor Statistics API

    return {
      demandLevel: "medium",
      commonSkills: [],
      growthTrend: "stable",
    };
  }

  /**
   * Score job match against user profile
   * Returns a compatibility score between 0-100
   */
  async scoreJobMatch(
    jobDescription: string,
    userSkills: string[],
    userExperience: number,
  ): Promise<number> {
    // TODO: Implement sophisticated matching algorithm
    // Consider:
    // - Skill overlap
    // - Experience requirements
    // - Location preferences
    // - Salary expectations
    // - Company culture fit

    return 75; // Placeholder
  }
}
