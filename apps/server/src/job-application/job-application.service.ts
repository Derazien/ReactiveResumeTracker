import { Injectable, Logger } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import { JobApplication } from "@prisma/client";
import { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { ContentMatchingService } from "@/server/content-matching/content-matching.service";
import { EmbeddingService } from "@/server/embedding/embedding.service";
import { LLMService } from "@/server/llm/llm.service";
import * as fs from 'fs';
import * as path from 'path';

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
    private readonly contentMatchingService: ContentMatchingService,
    private readonly embeddingService: EmbeddingService,
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
    if (updateJobApplicationDto.company !== undefined)
      updateData.company = updateJobApplicationDto.company;
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
      updateJobApplicationDto.company !== undefined ||
      updateJobApplicationDto.description !== undefined ||
      updateJobApplicationDto.requirements !== undefined ||
      updateJobApplicationDto.extractedTags !== undefined;

    if (embeddingFieldsChanged) {
      try {
        // Create new job embedding text with updated data
        const newTitle = updateJobApplicationDto.title ?? currentJob.title;
        const newCompany = updateJobApplicationDto.company ?? currentJob.company;
        const newDescription = updateJobApplicationDto.description ?? currentJob.description ?? "";
        const newRequirements = updateJobApplicationDto.requirements ?? JSON.parse(currentJob.requirements || "[]");
        const newExtractedTags = updateJobApplicationDto.extractedTags ?? JSON.parse(currentJob.extractedTags || "[]");

        const jobEmbeddingText = this.createJobEmbeddingText(
          newTitle,
          newCompany,
          newDescription,
          newRequirements,
          newExtractedTags
        );

        // Check if we need to regenerate embedding
        const newHash = this.embeddingService.generateHash(jobEmbeddingText);
        
        if (!currentJob.embeddingHash || currentJob.embeddingHash !== newHash) {
          this.logger.log(`Job data changed, regenerating embedding for job: ${newTitle} at ${newCompany}`);
          
          const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
          updateData.embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
          updateData.embeddingHash = embeddingResult.hash;

          this.logger.log(`Updated embedding for job (hash: ${embeddingResult.hash.substring(0, 8)}...)`);
        } else {
          this.logger.log(`Job data unchanged, keeping existing embedding (hash: ${newHash.substring(0, 8)}...)`);
        }
      } catch (error) {
        this.logger.warn(`Failed to update embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`);
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
      throw new Error(`Job analysis failed: ${analysisResult.error ?? "Unknown error"}`);
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

    // Generate embedding for the job data
    let embedding: string | null = null;
    let embeddingHash: string | null = null;

    try {
      const jobEmbeddingText = this.createJobEmbeddingText(
        analysisData.title,
        analysisData.company,
        analysisData.description,
        analysisData.requirements ?? [],
        analysisData.extractedTags ?? []
      );

      // Check if we need to generate embedding (always generate for new jobs)
      const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
      embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
      embeddingHash = embeddingResult.hash;

      this.logger.log(`Generated embedding for job: ${analysisData.title} at ${analysisData.company} (hash: ${embeddingHash.substring(0, 8)}...)`);
    } catch (error) {
      this.logger.warn(`Failed to generate embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Continue without embedding - the system should still work
    }

    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: analysisData.title,
        company: analysisData.company,
        description: analysisData.description,
        requirements: JSON.stringify(analysisData.requirements ?? []),
        extractedTags: JSON.stringify(analysisData.extractedTags ?? []),
        url: url ?? "",
        embedding,
        embeddingHash,
        userId,
      },
    });

    // Analysis completed - no need to store generated content records

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

    // Step 2: Generate embedding for the job data
    let embedding: string | null = null;
    let embeddingHash: string | null = null;

    try {
      const jobEmbeddingText = this.createJobEmbeddingText(
        jobData.title,
        jobData.company,
        jobData.description,
        jobData.requirements,
        jobData.extractedTags
      );

      const embeddingResult = await this.embeddingService.generateEmbedding(jobEmbeddingText);
      embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
      embeddingHash = embeddingResult.hash;

      this.logger.log(`Generated embedding for job: ${jobData.title} at ${jobData.company}`);
    } catch (error) {
      this.logger.warn(`Failed to generate embedding for job application: ${error instanceof Error ? error.message : "Unknown error"}`);
      // Continue without embedding - the system should still work
    }

    // Step 3: Create the job application with embedding
    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requirements: JSON.stringify(jobData.requirements),
        extractedTags: JSON.stringify(jobData.extractedTags),
        url: url || "",
        embedding,
        embeddingHash,
        userId,
      },
    });

    // Step 4: Get user's content library
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
   * Generate a tailored resume for a specific job application
   * This creates an actual Resume record with structured data, using content library matching
   * and intelligent LLM-powered tailoring for optimization
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
    let llmInput: any = null;
    let llmOutput: any = null;
    let apiOutput: any = null;
    this.logger.log(`Generating tailored resume for job application ${jobApplicationId}`);

    // Get job application
    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get user's basic info
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, picture: true },
    });

    // Step 1: Auto-select best matching content using structured selection
      const jobRequirements = JSON.parse(jobApplication.requirements ?? "[]");
      
      // Get job embedding if available
      let jobEmbedding: number[] | undefined;
      if (jobApplication.embedding) {
        try {
          jobEmbedding = this.embeddingService.parseEmbedding(jobApplication.embedding);
          this.logger.log("Using stored job embedding for enhanced content matching");
        } catch (error) {
          this.logger.warn(`Failed to parse job embedding: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }

      // Use structured content selection with specific limits for one-page resume
      const structuredSelection = await this.contentMatchingService.selectStructuredContent(
        userId,
        jobRequirements,
        jobApplication.description ?? "",
        {
        useVectorSimilarity: true, // DISABLED: Only use tag matching
          useTagMatching: true,
          vectorWeight: 0.7,
          tagWeight: 0.3,
          minSimilarity: 0, // Only include reasonably relevant content
          maxResults: 100,
          // Structured selection options for one-page resume
          maxExperiences: 5, // LLM will determine if 2 or 3 fit on one page
          maxProjects: 3,
          includeAllInterests: true,
          includeAllLanguages: true,
          includeAllSkills: true,
          includeAllEducation: true,
          includeAllCertificates: true,
          includeAllVolunteer: true,
          includeAllCauses: true,
          // Lower thresholds for content types that should be included regardless
          minSimilarityForLanguages: 5, // Very low threshold for languages
          minSimilarityForSkills: 5, // Very low threshold for skills
          minSimilarityForEducation: 5, // Very low threshold for education
          minSimilarityForCertificates: 5, // Very low threshold for certificates
          minSimilarityForInterests: 5, // Very low threshold for interests
          minSimilarityForVolunteer: 5, // Very low threshold for volunteer
          minSimilarityForCauses: 5, // Very low threshold for causes
        },
        jobEmbedding // Pass job embedding for enhanced matching (will be ignored since vector matching is disabled)
      );

      // Convert structured selection to content objects and add match scores
    const selectedContent: any[] = [];
      
      // Combine all selected content from different sections
      const allSelectedMatches = [
        ...structuredSelection.experiences,
        ...structuredSelection.projects,
        ...structuredSelection.interests,
        ...structuredSelection.languages,
        ...structuredSelection.summary,
        ...structuredSelection.contact,
        ...structuredSelection.skills,
        ...structuredSelection.education,
        ...structuredSelection.certificates,
        ...structuredSelection.volunteer,
        ...structuredSelection.causes,
      ];

      // Remove duplicates and get content details
      const uniqueContentIds = [...new Set(allSelectedMatches.map(match => match.contentId))];
      
      for (const contentId of uniqueContentIds) {
        const content = await this.contentLibraryService.findOne(contentId, userId);
        if (content) {
          const match = allSelectedMatches.find(m => m.contentId === contentId);
          selectedContent.push({
            ...content,
          matchScore: match?.score ?? 0,
            vectorSimilarity: match?.vectorSimilarity,
            tagSimilarity: match?.tagSimilarity,
          matchReasons: match?.reasons ?? [],
          matchSuggestions: match?.suggestions ?? [],
          });
        }
      }

      this.logger.log(
        `Auto-selected ${selectedContent.length} relevant content pieces using structured selection (TAG-ONLY matching)`,
      );
      this.logger.log(`Content breakdown: ${structuredSelection.experiences.length} experiences, ${structuredSelection.projects.length} projects, ${structuredSelection.skills.length} skills, ${structuredSelection.education.length} education items`);

    // Step 2: Create structured resume data (summary and basics generation handled inside)
    const resumeData = await this.buildResumeFromContent(
      user,
      selectedContent,
      jobApplication,
    );

    // Step 4: Apply LLM-powered tailoring to optimize the resume
    let tailoringResult: any = null;
    let finalResumeData = resumeData;
    let enhancedSuggestions: string[] = [];

    try {
      this.logger.log("Applying LLM-powered CV tailoring for ONE-PAGE resume...");

      const jobRequirements = JSON.parse(jobApplication.requirements ?? "[]");

        // --- Capture LLM input ---
        llmInput = {
          userId,
          jobDescription: jobApplication.description ?? "",
          jobRequirements,
          resumeData,
        };

      const tailoringResponse = await this.llmService.tailorResumeContentForUser(
        userId,
          jobApplication.description ?? "",
        jobRequirements,
        resumeData,
      );

      // --- Capture LLM output ---
      llmOutput = tailoringResponse;

      if (tailoringResponse.success && tailoringResponse.data) {
        tailoringResult = tailoringResponse.data;

        // Apply LLM recommendations to the resume data
        finalResumeData = this.applyTailoringToResume(resumeData, tailoringResult);

        // CRITICAL DEBUG: Log the final layout structure to help debug frontend issues
        this.logger.log(
          `Final resume layout structure: ${JSON.stringify(finalResumeData?.metadata?.layout, null, 2)}`,
        );

        enhancedSuggestions = tailoringResult.suggestions || [];

        this.logger.log(
          `LLM tailoring completed. Overall fit score: ${tailoringResult.overallFitScore}/100`,
        );
        this.logger.log(
          `Applied ${tailoringResult.experienceAdjustments?.length || 0} experience adjustments`,
        );
        this.logger.log(
          `Skills to add: ${tailoringResult.skillsToAdd?.length || 0}, Skills to remove: ${tailoringResult.skillsToRemove?.length || 0}`,
        );
      } else {
        this.logger.warn(
          `LLM tailoring failed: ${tailoringResponse.error}. Using basic resume without tailoring.`,
        );
        // CRITICAL DEBUG: Log the basic resume layout structure to help debug
        this.logger.log(
          `Basic resume layout structure (no LLM): ${JSON.stringify(resumeData?.metadata?.layout, null, 2)}`,
        );
        finalResumeData = resumeData;
      }
    } catch (error) {
      this.logger.error(
        `LLM tailoring error: ${error instanceof Error ? error.message : "Unknown error"}. Proceeding with basic resume.`,
      );
      // CRITICAL DEBUG: Log the basic resume layout structure to help debug
      this.logger.log(
        `Basic resume layout structure (error case): ${JSON.stringify(resumeData?.metadata?.layout, null, 2)}`,
      );
      finalResumeData = resumeData;
    }

    // Step 5: Create the resume record with enhanced metadata
    const resumeTitle = `${jobApplication.title} - ${jobApplication.company}`;
    const resumeSlug = `${jobApplication.title.toLowerCase().replace(/[^\da-z]+/g, "-")}-${jobApplication.company.toLowerCase().replace(/[^\da-z]+/g, "-")}-${Date.now()}`;

    // Prepare resume notes with comprehensive content selection info and changes summary
    let resumeNotes = `<h2>Comprehensive One-Page Resume Details</h2>`;
    resumeNotes += `<p><strong>Job:</strong> ${jobApplication.title} at ${jobApplication.company}</p>`;
    resumeNotes += `<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>`;
    resumeNotes += `<p><strong>Format:</strong> Optimized for single-page layout with concise content</p>`;

    if (tailoringResult?.changesSummary) {
      resumeNotes += `<h3>LLM Optimizations Applied</h3>`;
      resumeNotes += `<p>${tailoringResult.changesSummary}</p>`;
      resumeNotes += `<p><strong>Job Fit Score:</strong> ${tailoringResult.overallFitScore}/100</p>`;
    }

    resumeNotes += `<h3>Comprehensive Content Selection Strategy</h3>`;
    resumeNotes += `<ul>`;
    resumeNotes += `<li><strong>Experiences:</strong> Top 2-3 most relevant (${selectedContent.filter((c) => c.section?.key === "experience").length} provided, LLM optimizes for one-page fit)</li>`;
    resumeNotes += `<li><strong>Education:</strong> Most relevant degree(s)</li>`;
    resumeNotes += `<li><strong>Technical Skills:</strong> All relevant technical skills and competencies</li>`;
    resumeNotes += `<li><strong>Soft Skills:</strong> All relevant interpersonal and soft skills</li>`;
    resumeNotes += `<li><strong>Projects:</strong> Top 2 most relevant projects</li>`;
    resumeNotes += `<li><strong>Languages:</strong> All languages (sorted by relevancy)</li>`;
    resumeNotes += `<li><strong>Certifications:</strong> Most relevant certifications only</li>`;
    resumeNotes += `<li><strong>Additional:</strong> Volunteer experience, awards, publications (if highly relevant)</li>`;
    resumeNotes += `</ul>`;

    resumeNotes += `<h3>Content Library Items Used (${selectedContent.length} total)</h3>`;
    resumeNotes += `<ul>`;
    for (const content of selectedContent) {
      resumeNotes += `<li><strong>${content.section?.name ?? content.type}:</strong> ${content.title} (Score: ${content.matchScore?.toFixed(1) ?? "N/A"})</li>`;
    }
    resumeNotes += `</ul>`;

    resumeNotes += `<p><em>This resume is optimized for one-page format with comprehensive coverage. Use the resume builder to further customize sections and formatting.</em></p>`;

    // Set the notes in the resume data
    finalResumeData.metadata.notes = resumeNotes;

    const resume = await this.prisma.resume.create({
      data: {
        title: resumeTitle,
        slug: resumeSlug,
        data: JSON.stringify(finalResumeData),
        userId,
        jobApplicationId: jobApplication.id,
        visibility: "private",
      },
    });

    // Step 6: Generation record removed - users will add generated content as variants through resume editor

    const basicSuggestions = [
      `Comprehensive one-page resume generated from ${selectedContent.length} strategically selected content items`,
      `Content includes: ${selectedContent.filter((c) => c.section?.key === "experience").length} experiences, education, technical skills, soft skills, projects, languages, and certifications`,
      `Summary optimized to 1-2 sentences focusing on years of experience and key qualifications`,
      `Format optimized for single-page layout while maintaining comprehensive coverage`,
      `Use the resume builder to further adjust formatting and section order if needed`,
    ];

    const finalSuggestions = tailoringResult
      ? [
          `LLM tailoring achieved ${tailoringResult.overallFitScore}/100 job fit score for one-page optimization`,
          ...enhancedSuggestions,
          ...basicSuggestions,
        ]
      : [
          `Resume generated with comprehensive content selection - configure LLM settings for enhanced job-specific tailoring`,
          ...basicSuggestions,
        ];

    const result = {
      resume,
      selectedContent,
      suggestions: finalSuggestions,
      tailoringResult,
    };

    // --- Capture API output ---
    apiOutput = result;

    // --- Write Markdown log ---
    await this.writeApiCallLogMarkdown({
      jobApplicationId,
      userId,
      llmInput,
      llmOutput,
      apiOutput,
    });

    return result;
  }

  /**
   * Apply LLM tailoring recommendations to the resume data
   */
  private applyTailoringToResume(resumeData: any, tailoringResult: any): any {
    // If LLM provided complete optimized resume data, use it
    if (tailoringResult.optimizedResumeData) {
      this.logger.log("Using complete LLM-optimized resume data");

      // Ensure the LLM-generated data conforms to schema requirements
      const validatedResumeData = this.validateAndFixLLMResumeData(
        tailoringResult.optimizedResumeData,
      );

      // Mark all items with contentId as modified
      this.markAllContentLibraryItemsAsModified(validatedResumeData);
      return validatedResumeData;
    }

    // Fallback to legacy partial adjustments
    this.logger.log("Applying legacy partial tailoring adjustments");
    const tailoredResume = JSON.parse(JSON.stringify(resumeData)); // Deep clone

    // Apply adjusted summary if provided
    if (tailoringResult.adjustedSummary) {
      tailoredResume.sections.summary.content = `<p>${tailoringResult.adjustedSummary}</p>`;
      this.logger.log("Applied LLM-enhanced professional summary");
    }

    // Apply skill adjustments
    if (tailoringResult.skillsToAdd?.length > 0 || tailoringResult.skillsToRemove?.length > 0) {
      this.applySkillAdjustments(tailoredResume, tailoringResult);
    }

    // Apply experience adjustments
    if (tailoringResult.experienceAdjustments?.length > 0) {
      this.applyExperienceAdjustments(tailoredResume, tailoringResult);
    }

    return tailoredResume;
  }

  /**
   * Validate and fix LLM-generated resume data to conform to schema requirements
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateAndFixLLMResumeData(resumeData: any): any {
    this.logger.log("Validating and fixing LLM-generated resume data for schema compliance");

    // Ensure the resume has the expected structure
    if (!resumeData.sections) {
      this.logger.warn("LLM resume data missing sections - using original structure");
      return resumeData;
    }

    // CRITICAL FIX: Ensure metadata.layout has the correct 3-level nested array structure
    if (!resumeData.metadata) {
      resumeData.metadata = {};
    }

    // Validate and fix the layout structure: [pages][columns][sections]
    if (
      !resumeData.metadata.layout ||
      !Array.isArray(resumeData.metadata.layout) ||
      resumeData.metadata.layout.length === 0
    ) {
      this.logger.warn("LLM corrupted or missing metadata.layout - restoring default structure");

      // Get all available section keys from the resume sections
      const availableSections = Object.keys(resumeData.sections || {});

      // Create a proper default layout with 2 columns
      const leftColumn = [];
      const rightColumn = [];

      // Distribute sections across columns (prioritize main content on left)
      const leftPriority = [
        "summary",
        "experience",
        "education",
        "volunteer",
        "references",
      ];
      const rightPriority = [
        "profiles",
        "skills",
        "projects",
        "certifications",
        "languages",
        "interests",
        "awards",
        "publications",
      ];

      // Add left priority sections first
      for (const section of leftPriority) {
        if (availableSections.includes(section)) {
          leftColumn.push(section);
        }
      }

      // Add right priority sections
      for (const section of rightPriority) {
        if (availableSections.includes(section)) {
          rightColumn.push(section);
        }
      }

      // Add any remaining sections to the appropriate column
      for (const section of availableSections) {
        if (!leftColumn.includes(section) && !rightColumn.includes(section)) {
          if (leftColumn.length <= rightColumn.length) {
            leftColumn.push(section);
          } else {
            rightColumn.push(section);
          }
        }
      }

      // Create the proper 3-level nested structure: [pages][columns][sections]
      resumeData.metadata.layout = [
        [leftColumn, rightColumn], // Page 0 with 2 columns
      ];

      this.logger.log(
        `Fixed layout structure: Left column (${leftColumn.length} sections), Right column (${rightColumn.length} sections)`,
      );
    } else {
      // Validate existing layout structure
      let layoutFixed = false;

      for (let pageIndex = 0; pageIndex < resumeData.metadata.layout.length; pageIndex++) {
        const page = resumeData.metadata.layout[pageIndex];

        // Ensure each page is an array of columns
        if (!Array.isArray(page)) {
          this.logger.warn(`Page ${pageIndex} is not an array - fixing`);
          resumeData.metadata.layout[pageIndex] = [[], []]; // Default 2 columns
          layoutFixed = true;
          continue;
        }

        // Ensure each page has at least 2 columns
        if (page.length < 2) {
          this.logger.warn(`Page ${pageIndex} has less than 2 columns - adding empty columns`);
          while (page.length < 2) {
            page.push([]);
          }
          layoutFixed = true;
        }

        // Ensure each column is an array of section strings
        for (let colIndex = 0; colIndex < page.length; colIndex++) {
          const column = page[colIndex];
          if (!Array.isArray(column)) {
            this.logger.warn(`Page ${pageIndex}, Column ${colIndex} is not an array - fixing`);
            page[colIndex] = [];
            layoutFixed = true;
          }
        }
      }

      if (layoutFixed) {
        this.logger.log("Fixed layout structure issues");
      } else {
        this.logger.log("Layout structure validation passed");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections = resumeData.sections;
    let fixCount = 0;

    for (const sectionKey of Object.keys(sections)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = sections[sectionKey];
      if (section?.items && Array.isArray(section.items)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        section.items.forEach((item: any) => {
          let itemFixed = false;

          // Fix basic item fields required by all sections
          if (!item.id || !/^[\da-z]{24}$/.test(item.id as string)) {
            item.id = createId();
            itemFixed = true;
          }

          if (typeof item.visible !== "boolean") {
            item.visible = true;
            itemFixed = true;
          }

          if (!Object.prototype.hasOwnProperty.call(item, "contentId")) {
            item.contentId = null;
            itemFixed = true;
          }

          if (!Object.prototype.hasOwnProperty.call(item, "sourceContentId")) {
            item.sourceContentId = null;
            itemFixed = true;
          }

          // Section-specific fixes
          switch (sectionKey) {
            case "experience": {
              if (!item.company || typeof item.company !== "string") {
                item.company = "Company";
                itemFixed = true;
              }
              if (!item.position || typeof item.position !== "string") {
                item.position = "Position";
                itemFixed = true;
              }
              if (!item.location || typeof item.location !== "string") {
                item.location = "";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = "Recent";
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "projects": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Project";
                itemFixed = true;
              }
              if (!item.description || typeof item.description !== "string") {
                item.description = "Project";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = "Recent";
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (!Array.isArray(item.keywords)) {
                item.keywords = [];
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "education": {
              if (!item.institution || typeof item.institution !== "string") {
                item.institution = "Institution";
                itemFixed = true;
              }
              if (!item.studyType || typeof item.studyType !== "string") {
                item.studyType = "Degree";
                itemFixed = true;
              }
              if (!item.area || typeof item.area !== "string") {
                item.area = "";
                itemFixed = true;
              }
              if (!item.score || typeof item.score !== "string") {
                item.score = "";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = "Graduated";
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "skills": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Skill Category";
                itemFixed = true;
              }
              if (!item.description || typeof item.description !== "string") {
                item.description = "";
                itemFixed = true;
              }
              if (typeof item.level !== "number" || item.level < 0 || item.level > 5) {
                // Convert percentage to 0-5 scale if needed
                if (typeof item.level === "number" && item.level > 5) {
                  item.level = Math.min(5, Math.max(0, Math.round(item.level / 20)));
                } else {
                  item.level = 3; // Default level
                }
                itemFixed = true;
              }
              if (!Array.isArray(item.keywords)) {
                item.keywords = [];
                itemFixed = true;
              }
              break;
            }

            case "languages": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Language";
                itemFixed = true;
              }
              if (!item.description || typeof item.description !== "string") {
                item.description = "";
                itemFixed = true;
              }
              if (typeof item.level !== "number" || item.level < 0 || item.level > 5) {
                // Convert percentage to 0-5 scale if needed
                if (typeof item.level === "number" && item.level > 5) {
                  item.level = Math.min(5, Math.max(0, Math.round(item.level / 20)));
                } else {
                  item.level = 3; // Default level
                }
                itemFixed = true;
              }
              break;
            }

            case "certifications": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Certification";
                itemFixed = true;
              }
              if (!item.issuer || typeof item.issuer !== "string") {
                item.issuer = "Issuing Organization";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = new Date().getFullYear().toString();
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "awards": {
              if (!item.title || typeof item.title !== "string") {
                item.title = "Award";
                itemFixed = true;
              }
              if (!item.awarder || typeof item.awarder !== "string") {
                item.awarder = "Awarding Organization";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = new Date().getFullYear().toString();
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "publications": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Publication";
                itemFixed = true;
              }
              if (!item.publisher || typeof item.publisher !== "string") {
                item.publisher = "Publisher";
                itemFixed = true;
              }
              if (!item.date || typeof item.date !== "string") {
                item.date = new Date().getFullYear().toString();
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "interests": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Interest";
                itemFixed = true;
              }
              if (!Array.isArray(item.keywords)) {
                item.keywords = [];
                itemFixed = true;
              }
              break;
            }

            case "references": {
              if (!item.name || typeof item.name !== "string") {
                item.name = "Reference";
                itemFixed = true;
              }
              if (!item.description || typeof item.description !== "string") {
                item.description = "Reference";
                itemFixed = true;
              }
              if (!item.summary || typeof item.summary !== "string") {
                item.summary = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }

            case "profiles": {
              if (!item.network || typeof item.network !== "string") {
                item.network = "Social Media";
                itemFixed = true;
              }
              if (!item.username || typeof item.username !== "string") {
                item.username = "Username";
                itemFixed = true;
              }
              if (!item.icon || typeof item.icon !== "string") {
                item.icon = "";
                itemFixed = true;
              }
              if (
                !item.url ||
                typeof item.url !== "object" ||
                !("label" in item.url) ||
                !("href" in item.url)
              ) {
                item.url = { label: "", href: "" };
                itemFixed = true;
              }
              break;
            }
          }

          if (itemFixed) {
            fixCount++;
          }
        });
      }
    }

    if (fixCount > 0) {
      this.logger.log(`Fixed ${fixCount} schema validation issues in LLM-generated resume data`);
    } else {
      this.logger.log("LLM-generated resume data passed schema validation");
    }

    return resumeData;
  }

  /**
   * Helper method to properly track when content library items are modified by LLM
   */
  private markItemAsModifiedFromContentLibrary(item: any): void {
    if (item.contentId && !item.sourceContentId) {
      // Move contentId to sourceContentId to track the original source
      item.sourceContentId = item.contentId;
      item.contentId = null;

      this.logger.debug(
        `Marked item as modified from content library: ${item.sourceContentId}`,
      );
    }
  }

  /**
   * Helper method to mark all content library items in a resume as modified
   */
  private markAllContentLibraryItemsAsModified(resumeData: any): void {
    const sections = resumeData?.sections || {};

    for (const sectionKey of Object.keys(sections)) {
      const section = sections[sectionKey];
      if (section?.items && Array.isArray(section.items)) {
        section.items.forEach((item: any) => {
          this.markItemAsModifiedFromContentLibrary(item);
        });
      }
    }
  }

  /**
   * Apply skill additions and removals to the resume
   */
  private applySkillAdjustments(resumeData: any, tailoringResult: any): void {
    const skillsSection = resumeData.sections.skills;

    if (!skillsSection?.items) return;

    // Add new skills
    if (tailoringResult.skillsToAdd?.length > 0) {
      const newSkills = tailoringResult.skillsToAdd;

      // Find or create "Job-Relevant Skills" category
      let relevantSkillsCategory = skillsSection.items.find(
        (item: any) =>
          item.name.toLowerCase().includes("relevant") || item.name.toLowerCase().includes("key"),
      );

      if (relevantSkillsCategory) {
        // Mark existing category as modified if it came from content library
        this.markItemAsModifiedFromContentLibrary(relevantSkillsCategory);
      } else {
        relevantSkillsCategory = {
          id: createId(),
          visible: true,
          name: "Key Job-Relevant Skills",
          description: "",
          level: 0,
          keywords: [],
          contentId: null,
          sourceContentId: null, // This is a new LLM-generated category
        };
        skillsSection.items.unshift(relevantSkillsCategory);
      }

      // Add new skills to the category, avoiding duplicates
      const existingSkills = new Set(
        relevantSkillsCategory.keywords.map((s: string) => s.toLowerCase()),
      );
      const skillsToAdd = newSkills.filter(
        (skill: string) => !existingSkills.has(skill.toLowerCase()),
      );

      relevantSkillsCategory.keywords = [...relevantSkillsCategory.keywords, ...skillsToAdd];

      this.logger.log(`Added ${skillsToAdd.length} new skills: ${skillsToAdd.join(", ")}`);
    }

    // Remove outdated/irrelevant skills
    if (tailoringResult.skillsToRemove?.length > 0) {
      const skillsToRemove = new Set(
        tailoringResult.skillsToRemove.map((s: string) => s.toLowerCase()),
      );
      let removedCount = 0;

      skillsSection.items.forEach((category: any) => {
        if (category.keywords) {
          const originalLength = category.keywords.length;
          category.keywords = category.keywords.filter(
            (skill: string) => !skillsToRemove.has(skill.toLowerCase()),
          );

          // If skills were removed, mark as modified
          if (category.keywords.length < originalLength) {
            this.markItemAsModifiedFromContentLibrary(category);
            removedCount += originalLength - category.keywords.length;
          }
        }
      });

      this.logger.log(`Removed ${removedCount} outdated skills`);
    }
  }

  /**
   * Apply experience description adjustments to make them more job-relevant
   */
  private applyExperienceAdjustments(resumeData: any, tailoringResult: any): void {
    const experienceSection = resumeData.sections.experience;

    if (!experienceSection?.items || !tailoringResult.experienceAdjustments) return;

    let adjustmentsApplied = 0;

    tailoringResult.experienceAdjustments.forEach((adjustment: any) => {
      // Find the experience item by matching against selected content
      const experienceItem = experienceSection.items.find((item: any) => {
        // Try to match by company/position or content
        return (
          item.company?.toLowerCase().includes(adjustment.contentId) ||
          item.position?.toLowerCase().includes(adjustment.contentId) ||
          item.summary?.toLowerCase().includes(adjustment.contentId)
        );
      });

      if (experienceItem) {
        // Mark as modified before applying changes
        this.markItemAsModifiedFromContentLibrary(experienceItem);

        // Apply title adjustment
        if (adjustment.adjustedTitle) {
          experienceItem.position = adjustment.adjustedTitle;
        }

        // Apply description adjustment
        if (adjustment.adjustedDescription) {
          experienceItem.summary = `<p>${adjustment.adjustedDescription}</p>`;
        }

        // Emphasize keywords in the description
        if (adjustment.keywordsToEmphasize?.length > 0) {
          const keywords = adjustment.keywordsToEmphasize;
          let summary = experienceItem.summary;

          keywords.forEach((keyword: string) => {
            const regex = new RegExp(`\\b${keyword}\\b`, "gi");
            summary = summary.replace(regex, `<strong>${keyword}</strong>`);
          });

          experienceItem.summary = summary;
        }

        adjustmentsApplied++;
      }
    });

    this.logger.log(
      `Applied ${adjustmentsApplied} experience adjustments to enhance job relevance`,
    );
  }

  /**
   * Generate concise 1-2 sentence summary - template-based approach
   * Focus on years of experience, key skills, and relevant certifications/status
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generateBasicSummary(user: any, jobApplication: any, selectedContent: any[]): string {
    const experienceItems = selectedContent.filter((c) => c.section?.key === "experience");
    const certifications = selectedContent.filter((c) => c.section?.key === "certifications");

    // Calculate years of experience from experience items
    let totalYears = 0;
    for (const exp of experienceItems) {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate === "Present" ? new Date() : new Date(exp.endDate);
        const years = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365));
        totalYears += years;
      }
    }

    // Get top 3 most relevant skills
    const allSkills: string[] = [];
    for (const content of selectedContent) {
      const skills =
        typeof content.skills === "string"
          ? JSON.parse(content.skills ?? "[]")
          : (content.skills ?? []);
      allSkills.push(...skills);
    }
    const uniqueSkills = [...new Set(allSkills)].slice(0, 3);
    const skillsText = uniqueSkills.length > 0 ? uniqueSkills.join(", ") : "multiple technologies";

    // Get key certifications
    const certNames = certifications
      .slice(0, 2)
      .map((cert) => cert.title)
      .join(", ");

    // Build concise summary (1-2 sentences max)
    const yearsText = totalYears >= 1 ? `${Math.round(totalYears)}+ years` : "Experienced";
    let summary = `${yearsText} ${jobApplication.title} with expertise in ${skillsText}.`;

    // Add certification or second sentence if relevant
    if (certNames) {
      summary += ` Certified in ${certNames}.`;
    } else if (experienceItems.length >= 2) {
      summary += ` Proven track record across ${experienceItems.length} professional roles.`;
    }

    return summary;
  }

  /**
   * Build structured resume data from content library items
   */
  private async buildResumeFromContent(
    user: any,
    selectedContent: any[],
    jobApplication: any,
  ): Promise<any> {
    // Get default resume structure
    const { defaultResumeData } = await import("@reactive-resume/schema");
    const resumeData = JSON.parse(JSON.stringify(defaultResumeData));

    // Handle basics/contact info - use existing content if available, only modify name and picture
    const basicInfo = selectedContent.filter((c) => c.section?.key === "contact");
    
    if (basicInfo.length > 0) {
      // Use existing contact data from content library
      const info = basicInfo[0];
      const data = typeof info.data === "string" ? JSON.parse(info.data) : info.data;
      
      // Use the existing data structure which is already in the correct format
      // Only override name and picture with user data, preserve everything else
      resumeData.basics = {
        ...data, // This includes: name, headline, email, phone, location, url, customFields, picture
        name: user.name, // Override with user name
        picture: {
          ...data.picture,
           // Preserve existing picture settings (aspectRatio, borderRadius, effects)
          url: user.picture || "", // Only override the URL with user picture
          size: 90, // Explicitly set picture size to 90
          aspectRatio: 1,
          borderRadius: 9999,
        },
        url: data?.url ?? { href: "", label: "" },
        headline: data.headline || jobApplication.title, // Override headline for job relevance
        // Ensure all custom fields have proper IDs
        customFields: data?.customFields?.map((field: any, index: number) => ({
          ...field,
          id: field.id || createId(), // Create ID if missing
        })) || [],
      };
      
      this.logger.log("Using existing contact data from content library");
    } else {
      // No contact content found, use user defaults
      resumeData.basics.name = user.name;
      resumeData.basics.email = user.email;
      resumeData.basics.headline = jobApplication.title;
      resumeData.basics.picture.url = user.picture || "";
      resumeData.basics.picture.size = 90;
      resumeData.basics.picture.aspectRatio = 1;
      resumeData.basics.picture.borderRadius = 9999;
      
      this.logger.log("Using user defaults for basics as no contact content was found");
    }
      
  
    // Handle summary content - use existing content if available, generate if not
    const existingSummaryContent = selectedContent.filter((c) => c.section?.key === "summary");
    
    if (existingSummaryContent.length > 0) {
      // Use existing summary content as-is (no <p> tags added)
      const summaryData =
        typeof existingSummaryContent[0].data === "string"
          ? JSON.parse(existingSummaryContent[0].data)
          : existingSummaryContent[0].data;
      resumeData.sections.summary.content = summaryData?.content || existingSummaryContent[0].description || "";
      
      this.logger.log("Using existing summary content from content library");
    } else {
      // Generate basic summary and add <p> tags
      const generatedSummary = this.generateBasicSummary(user, jobApplication, selectedContent);
      resumeData.sections.summary.content = `<p>${generatedSummary}</p>`;
      
      this.logger.log("Generated basic summary as no summary content was found");
    }

    // Use the default layout from schema - no need to override
    this.logger.log("Using default layout from schema configuration");

    // Process content by section key
    const workExperiences = selectedContent.filter((c) => c.section?.key === "experience");
    const projects = selectedContent.filter((c) => c.section?.key === "projects");
    const education = selectedContent.filter((c) => c.section?.key === "education");
    const technicalSkills = selectedContent.filter((c) => c.section?.key === "technical_skills");
    const softSkills = selectedContent.filter((c) => c.section?.key === "skills");
    const certifications = selectedContent.filter((c) => c.section?.key === "certifications");
    const publications = selectedContent.filter((c) => c.section?.key === "publications");
    const awards = selectedContent.filter((c) => c.section?.key === "awards");
    const languages = selectedContent.filter((c) => c.section?.key === "languages");
    const interests = selectedContent.filter((c) => c.section?.key === "interests");
    const volunteer = selectedContent.filter((c) => c.section?.key === "volunteer");
    const references = selectedContent.filter((c) => c.section?.key === "references");
    const profiles = selectedContent.filter((c) => c.section?.key === "profiles");

    // Add work experience
    resumeData.sections.experience.items = workExperiences.map((exp) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof exp.data === "string" ? JSON.parse(exp.data) : exp.data;

      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        company: data.company || exp.company || "Company",
        position: data.position || exp.position || exp.title || "Position", 
        location: data.location || exp.location || "",
        date: data.date || this.formatDateRange(exp.startDate, exp.endDate) || "Present",
        summary: data.summary || exp.description || "",
        url: this.ensureValidUrl(data.url),
        contentId: exp.id,
        sourceContentId: null,
      };
    });

    // Add projects
    resumeData.sections.projects.items = projects.map((proj) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof proj.data === "string" ? JSON.parse(proj.data) : proj.data;

      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || proj.title || "Project",
        description: data.description || proj.position || "Project",
        date: data.date || this.formatDateRange(proj.startDate, proj.endDate) || "Recent",
        summary: data.summary || "",
        keywords: data.keywords || (typeof proj.skills === "string" ? JSON.parse(proj.skills) : proj.skills || []),
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        showKeywords: data.showKeywords !== undefined ? data.showKeywords : true,
        url: this.ensureValidUrl(data.url),
        contentId: proj.id,
        sourceContentId: null,
      };
    });

    // Add education
    resumeData.sections.education.items = education.map((edu) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof edu.data === "string" ? JSON.parse(edu.data) : edu.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        institution: data.institution || edu.company || edu.title || "Institution",
        studyType: data.studyType || edu.position || "Degree",
        area: data.area || edu.location || "",
        score: data.score || "",
        date: data.date || this.formatDateRange(edu.startDate, edu.endDate) || "Graduated",
        summary: data.summary || "",
        url: this.ensureValidUrl(data.url),
      contentId: edu.id,
      sourceContentId: null,
      };
    });

    // Add technical skills - use existing data field which contains the properly formatted structure
    resumeData.sections.skills.items = technicalSkills.map((skill) => {
      const data = typeof skill.data === "string" ? JSON.parse(skill.data) : skill.data;
      
      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || skill.title || "Technical Skill",
        description: data.description || skill.description || "",
        level: data.level || 0,
        keywords: data.keywords || (typeof skill.skills === "string"
          ? JSON.parse(skill.skills ?? "[]")
          : (skill.skills ?? [])),
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        showKeywords: data.showKeywords !== undefined ? data.showKeywords : true,
        contentId: skill.id,
        sourceContentId: null,
      };
    });

    // Add soft skills - use existing data field which contains the properly formatted structure
    const softSkillItems = softSkills.map((skill) => {
      const data = typeof skill.data === "string" ? JSON.parse(skill.data) : skill.data;
      
      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || skill.title || "Soft Skill",
        description: data.description || skill.description || "",
        level: data.level || 0,
        keywords: data.keywords || (typeof skill.skills === "string"
          ? JSON.parse(skill.skills ?? "[]")
          : (skill.skills ?? [])),
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        showKeywords: data.showKeywords !== undefined ? data.showKeywords : true,
        contentId: skill.id,
        sourceContentId: null,
      };
    });

    // Combine technical and soft skills into the skills section
    resumeData.sections.skills.items.push(...softSkillItems);

    // Add certifications
    resumeData.sections.certifications.items = certifications.map((cert) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof cert.data === "string" ? JSON.parse(cert.data) : cert.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || cert.title || "Certification",
        issuer: data.issuer || cert.company || "Issuing Organization",
        date: data.date || (cert.startDate
        ? new Date(cert.startDate).getFullYear().toString()
          : new Date().getFullYear().toString()),
        summary: data.summary || "",
        url: this.ensureValidUrl(data.url),
      contentId: cert.id,
      sourceContentId: null,
      };
    });

    // Add publications
    resumeData.sections.publications.items = publications.map((pub) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof pub.data === "string" ? JSON.parse(pub.data) : pub.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || pub.title || "Publication",
        publisher: data.publisher || pub.company || "Publisher",
        date: data.date || (pub.startDate
        ? new Date(pub.startDate).getFullYear().toString()
          : new Date().getFullYear().toString()),
        summary: data.summary || "",
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        url: this.ensureValidUrl(data.url || { label: "", href: pub.url || "" }),
      contentId: pub.id,
      sourceContentId: null,
      };
    });

    // Add awards
    resumeData.sections.awards.items = awards.map((award) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof award.data === "string" ? JSON.parse(award.data) : award.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        title: data.title || award.title || "Award",
        awarder: data.awarder || award.company || award.issuer || "Awarding Organization",
        date: data.date || (award.startDate
        ? new Date(award.startDate).getFullYear().toString()
          : new Date().getFullYear().toString()),
        summary: data.summary || "",
        url: this.ensureValidUrl(data.url || { label: "", href: award.url || "" }),
      contentId: award.id,
      sourceContentId: null,
      };
    });

    // Add languages
    resumeData.sections.languages.items = languages.map((lang) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof lang.data === "string" ? JSON.parse(lang.data) : lang.data;
      
      // Convert percentage (0-100) to level (0-5) scale
      const convertPercentageToLevel = (percentage: number): number => {
        if (percentage >= 90) return 5;
        if (percentage >= 75) return 4;
        if (percentage >= 60) return 3;
        if (percentage >= 40) return 2;
        if (percentage >= 20) return 1;
        return 0;
      };

      const rawLevel = data.level || lang.proficiencyLevel || 0;
      const convertedLevel = rawLevel > 5 ? convertPercentageToLevel(rawLevel) : rawLevel;

      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || lang.title || "Language",
        description: data.description || (lang.proficiencyLevel
          ? `${lang.proficiencyLevel}% proficiency (Level ${convertedLevel}/5)`
          : lang.description || "No proficiency level specified"),
        level: convertedLevel,
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        contentId: lang.id,
        sourceContentId: null,
      };
    });

    // Add interests
    resumeData.sections.interests.items = interests.map((interest) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof interest.data === "string" ? JSON.parse(interest.data) : interest.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || interest.title || "Interest",
        keywords: data.keywords || (typeof interest.keywords === "string"
          ? JSON.parse(interest.keywords)
          : interest.keywords || []),
        showKeywords: data.showKeywords !== undefined ? data.showKeywords : true,
      contentId: interest.id,
      sourceContentId: null,
      };
    });

    // Add volunteer experience
    resumeData.sections.volunteer.items = volunteer.map((vol) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof vol.data === "string" ? JSON.parse(vol.data) : vol.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        organization: data.organization || vol.company || "Organization",
        position: data.position || vol.position || vol.title || "Volunteer",
        location: data.location || vol.location || "",
        date: data.date || this.formatDateRange(vol.startDate, vol.endDate) || "Recent",
        summary: data.summary || "",
        url: this.ensureValidUrl(data.url || { label: "", href: vol.url || "" }),
      contentId: vol.id,
      sourceContentId: null,
      };
    });

    // Add references
    resumeData.sections.references.items = references.map((ref) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof ref.data === "string" ? JSON.parse(ref.data) : ref.data;
      
      return {
        ...(data || {}),
      id: createId(),
      visible: true,
        // Map the existing data structure to the expected fields
        name: data.name || ref.title || "Reference",
        description: data.description || ref.position || ref.company || "Reference",
        summary: data.summary || "",
        showDescription: data.showDescription !== undefined ? data.showDescription : true,
        url: this.ensureValidUrl(data.url || { label: "", href: ref.url || "" }),
      contentId: ref.id,
      sourceContentId: null,
      };
    });

    // Add profiles
    resumeData.sections.profiles.items = profiles.map((profile) => {
      // Use the existing data field which contains the properly formatted structure
      const data = typeof profile.data === "string" ? JSON.parse(profile.data) : profile.data;
      const content = typeof profile.content === "string" ? JSON.parse(profile.content) : profile.content;
      
      return {
        ...(data || {}),
        id: createId(),
        visible: true,
        // Map the existing data structure to the expected fields
        network: data.network || profile.company || content?.network || "Social Media",
        username: data.username || content?.username || profile.title || "Username",
        icon: data.icon || content?.icon || "",
        url: this.ensureValidUrl(data.url || { label: "", href: profile.url || content?.url || "" }),
        contentId: profile.id,
        sourceContentId: null,
      };
    });



    return resumeData;
  }

  /**
   * Ensure URL object has valid href (empty string instead of null or invalid URLs)
   */
  private ensureValidUrl(urlObj: any): { label: string; href: string } {
    if (!urlObj || typeof urlObj !== 'object') {
      return { label: "", href: "" };
    }
    
    const label = urlObj.label || "";
    let href = urlObj.href || "";
    
    // Convert null/undefined to empty string
    if (!href) {
      href = "";
    } else {
      // Validate that href is a proper URL or empty string
      try {
        // If it's an empty string, keep it
        if (href === "") {
          // Do nothing, keep empty string
        } else {
          // Try to create a URL object to validate it's a proper URL
          new URL(href);
          // If we get here, it's a valid URL, keep it as is
        }
      } catch {
        // If URL constructor throws an error, it's not a valid URL
        // Convert invalid URLs like "#", "javascript:", etc. to empty string
        href = "";
      }
    }
    
    return {
      label,
      href
    };
  }

  /**
   * Format date range for resume display
   */
  private formatDateRange(startDate: any, endDate: any): string {
    if (!startDate) return "Recent";

    const formatDate = (date: any) => {
      if (!date) return "Present";
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }


  /**
   * Group skills by category for better organization
   */
  private groupSkillsByCategory(allSkills: string[], selectedContent: any[]): any[] {
    // Categorize skills based on common patterns
    const categories = {
      "Programming Languages": [] as string[],
      "Frameworks & Libraries": [] as string[],
      "Tools & Technologies": [] as string[],
      "Soft Skills": [] as string[],
    };

    // Track which content library items contributed to each category
    const categorySourceIds = {
      "Programming Languages": new Set<string>(),
      "Frameworks & Libraries": new Set<string>(),
      "Tools & Technologies": new Set<string>(),
      "Soft Skills": new Set<string>(),
    };

    const programmingLanguages = [
      "javascript",
      "typescript",
      "python",
      "java",
      "kotlin",
      "swift",
      "c++",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
    ];
    const frameworks = [
      "react",
      "angular",
      "vue",
      "node.js",
      "express",
      "django",
      "spring",
      "laravel",
      "rails",
    ];
    const tools = ["git", "docker", "kubernetes", "aws", "azure", "jenkins", "jira"];
    const softSkills = [
      "leadership",
      "communication",
      "teamwork",
      "problem-solving",
      "project management",
    ];

    // Create a mapping of skills to their source content library items
    const skillToSourceMap = new Map<string, string>();
    for (const content of selectedContent) {
      if (content.section?.key === "skills") {
        const skills =
          typeof content.skills === "string"
            ? JSON.parse(content.skills || "[]")
            : content.skills || [];
        skills.forEach((skill: string) => {
          skillToSourceMap.set(skill, content.id);
        });
      }
    }

    for (const skill of allSkills) {
      const skillLower = skill.toLowerCase();
      const sourceId = skillToSourceMap.get(skill);

      if (programmingLanguages.some((lang) => skillLower.includes(lang))) {
        categories["Programming Languages"].push(skill);
        if (sourceId) categorySourceIds["Programming Languages"].add(sourceId);
      } else if (frameworks.some((fw) => skillLower.includes(fw))) {
        categories["Frameworks & Libraries"].push(skill);
        if (sourceId) categorySourceIds["Frameworks & Libraries"].add(sourceId);
      } else if (tools.some((tool) => skillLower.includes(tool))) {
        categories["Tools & Technologies"].push(skill);
        if (sourceId) categorySourceIds["Tools & Technologies"].add(sourceId);
      } else if (softSkills.some((soft) => skillLower.includes(soft))) {
        categories["Soft Skills"].push(skill);
        if (sourceId) categorySourceIds["Soft Skills"].add(sourceId);
      } else {
        // Default to Tools & Technologies
        categories["Tools & Technologies"].push(skill);
        if (sourceId) categorySourceIds["Tools & Technologies"].add(sourceId);
      }
    }

    // Convert to resume format
    return Object.entries(categories)
      .filter(([_, skills]) => skills.length > 0)
      .map(([category, skills], index) => {
        const sourceIds = [...categorySourceIds[category as keyof typeof categorySourceIds]];
        // For skills, we'll use the first contributing source as contentId
        // and track all sources in a special way
        return {
          id: createId(),
          visible: true,
          name: category,
          description: "",
          level: 0,
          keywords: [...new Set(skills)], // Remove duplicates
          contentId: sourceIds.length > 0 ? sourceIds[0] : null,
          sourceContentId: null,
          // Note: For skills, multiple content library items may contribute to one category
          // We could add a custom field to track all contributing IDs if needed
        };
      });
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

    // Cover letter generation completed - no need to store generated content records

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

  /**
   * Create consistent embedding text from job data
   * This text will be used to generate embeddings for job applications
   */
  private createJobEmbeddingText(
    title: string,
    company: string,
    description: string,
    requirements: string[],
    extractedTags: string[]
  ): string {
    // Create a comprehensive text representation of the job
    const parts: string[] = [];

    // Add job title and company
    parts.push(`Job Title: ${title}`);
    parts.push(`Company: ${company}`);

    // Add description (truncate if too long)
    if (description) {
      const truncatedDescription = description.length > 1000 
        ? description.substring(0, 1000) + "..."
        : description;
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

  private async writeApiCallLogMarkdown({
    jobApplicationId,
    userId,
    llmInput,
    llmOutput,
    apiOutput,
  }: {
    jobApplicationId: string;
    userId: string;
    llmInput: any;
    llmOutput: any;
    apiOutput: any;
  }) {
    const logsDir = path.join(process.cwd(), 'logs', 'api-calls');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `resume_${jobApplicationId}_${timestamp}.md`;
    const filePath = path.join(logsDir, filename);
    const md = [
      `# API Call: generateTailoredResume`,
      `- **Timestamp:** ${new Date().toLocaleString()}`,
      `- **Job Application ID:** \`${jobApplicationId}\``,
      `- **User ID:** \`${userId}\``,
      `- **Content Selection:** Auto-selected via content matching`,
      '',
      '## LLM Input',
      '```json',
      JSON.stringify(llmInput, null, 2),
      '```',
      '',
      '## LLM Output',
      '```json',
      JSON.stringify(llmOutput, null, 2),
      '```',
      '',
      '## API Output',
      '```json',
      JSON.stringify(apiOutput, null, 2),
      '```',
    ].join('\n');
    fs.writeFileSync(filePath, md, 'utf-8');
  }
}
