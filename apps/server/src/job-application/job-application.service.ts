import { Injectable, Logger } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
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

    // Step 1: Analyze the job posting with LLM using user's settings
    const analysisResult = await this.llmService.analyzeJobPostingForUser(userId, jobText);

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

    // Step 4: Match content to job requirements using RAG-based matching
    const contentMatches = await this.llmService.matchContentToJobRAG(
      userId,
      jobData.requirements,
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
        contentIds: JSON.stringify(
          contentMatches.success ? contentMatches.data!.map((m) => m.contentId) : [],
        ),
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
   * This creates an actual Resume record with structured data, using content library matching
   * and intelligent LLM-powered tailoring for optimization
   */
  async generateTailoredResume(
    jobApplicationId: string,
    userId: string,
    selectedContentIds?: string[],
  ): Promise<{
    resume: any;
    selectedContent: any[];
    suggestions: string[];
    tailoringResult?: any;
  }> {
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

    // Step 1: Get user's content with type-specific matching
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
      // Auto-select best matching content using type-specific tag/keyword matching
      selectedContent = await this.selectRelevantContentByTags(userId, jobApplication);
      this.logger.log(
        `Auto-selected ${selectedContent.length} relevant content pieces using type-specific matching`,
      );
    }

    // Step 2: Generate basic summary without LLM - use template-based approach
    const generatedSummary = this.generateBasicSummary(user, jobApplication, selectedContent);

    // Step 3: Create structured resume data
    const resumeData = await this.buildResumeFromContent(
      user,
      selectedContent,
      generatedSummary,
      jobApplication,
    );

    // Step 4: Apply LLM-powered tailoring to optimize the resume
    let tailoringResult: any = null;
    let finalResumeData = resumeData;
    let enhancedSuggestions: string[] = [];

    try {
      this.logger.log("Applying LLM-powered CV tailoring for ONE-PAGE resume...");

      const jobRequirements = JSON.parse(jobApplication.requirements ?? "[]");

      // CRITICAL: Ensure LLM knows this must fit on ONE PAGE
      // The tailoring should prioritize conciseness and relevance
      // Summary should be 1-2 sentences maximum
      // All content must be optimized for single-page format

      // Count experiences to help LLM decide optimal number
      const experienceCount = selectedContent.filter((c) => c.section?.key === "experience").length;

      // Enhanced job description with experience optimization instructions
      const enhancedJobDescription = `${jobApplication.description ?? ""}

CRITICAL ONE-PAGE OPTIMIZATION INSTRUCTIONS:
- This resume MUST fit on exactly ONE PAGE
- ${experienceCount} work experiences are available (2-3 are ideal, preferably 3 if space allows)
- The LLM should determine if all ${experienceCount} experiences can fit on one page or if only 2 should be used
- If using only 2 experiences, prioritize the most relevant ones and mention space optimization in changesSummary
- Summary must be 1-2 short sentences maximum
- All sections must be concise and optimized for single-page layout
- Prioritize: most relevant experiences, key technical skills, education, certifications, projects`;

      const tailoringResponse = await this.llmService.tailorResumeContentForUser(
        userId,
        enhancedJobDescription,
        jobRequirements,
        resumeData,
        selectedContent,
      );

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

    // Step 6: Store the generation record
    await this.prisma.generatedContent.create({
      data: {
        type: "tailored_resume",
        prompt: `Generate tailored resume for ${jobApplication.title} at ${jobApplication.company}`,
        response: JSON.stringify({
          resumeId: resume.id,
          contentCount: selectedContent.length,
          summary: generatedSummary,
          method: tailoringResult
            ? "type-specific-matching-with-llm-tailoring"
            : "type-specific-matching",
          tailoringScore: tailoringResult?.overallFitScore || null,
          adjustmentsApplied: {
            experienceAdjustments: tailoringResult?.experienceAdjustments?.length || 0,
            skillsAdded: tailoringResult?.skillsToAdd?.length || 0,
            skillsRemoved: tailoringResult?.skillsToRemove?.length || 0,
            summaryAdjusted: !!tailoringResult?.adjustedSummary,
          },
        }),
        llmProvider: tailoringResult ? "ANTHROPIC" : "OLLAMA", // Use valid enum value
        model: tailoringResult ? "claude-3-5-sonnet" : "content-library-matching",
        contentIds: JSON.stringify(selectedContent.map((c) => c.id)),
        jobApplicationId: jobApplication.id,
      },
    });

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

    return {
      resume,
      selectedContent,
      suggestions: finalSuggestions,
      tailoringResult,
    };
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

      // Mark all items with contentLibraryId as modified
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
        "projects",
        "volunteer",
        "references",
      ];
      const rightPriority = [
        "profiles",
        "skills",
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

          if (!Object.prototype.hasOwnProperty.call(item, "contentLibraryId")) {
            item.contentLibraryId = null;
            itemFixed = true;
          }

          if (!Object.prototype.hasOwnProperty.call(item, "sourceContentLibraryId")) {
            item.sourceContentLibraryId = null;
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
                item.summary = "<p>No description available</p>";
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
    if (item.contentLibraryId && !item.sourceContentLibraryId) {
      // Move contentLibraryId to sourceContentLibraryId to track the original source
      item.sourceContentLibraryId = item.contentLibraryId;
      item.contentLibraryId = null;

      this.logger.debug(
        `Marked item as modified from content library: ${item.sourceContentLibraryId}`,
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
          contentLibraryId: null,
          sourceContentLibraryId: null, // This is a new LLM-generated category
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
   * Select relevant content using comprehensive requirements:
   * - 2-3 most relevant experiences
   * - 1 education minimum
   * - All relevant skills and tech skills
   * - 1 volunteer experience
   * - 2 top projects
   * - Hobbies/activities
   * - All languages (sorted by relevancy)
   * - 1 summary
   * - All contact info
   */
  private async selectRelevantContentByTags(userId: string, jobApplication: any): Promise<any[]> {
    // Get all user content WITH tags for proper matching
    const allContent = await this.prisma.content.findMany({
      where: { userId },
      include: {
        section: true,
        tags: {
          include: {
            tag: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Extract job tags and requirements
    const jobTags = JSON.parse(jobApplication.extractedTags || "[]");
    const jobRequirements = JSON.parse(jobApplication.requirements || "[]");

    // Create keyword list from job data
    const jobKeywords = new Set<string>();

    // Add tags as keywords
    for (const tag of jobTags) {
      jobKeywords.add(tag.toLowerCase());
    }

    // Extract keywords from requirements (simple keyword extraction)
    for (const req of jobRequirements) {
      const words = req.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
      for (const word of words) {
        jobKeywords.add(word);
      }
    }

    // Extract keywords from job title and company
    const titleWords = jobApplication.title.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
    for (const word of titleWords) {
      jobKeywords.add(word);
    }

    // Group content by section type
    const contentByType = new Map<string, any[]>();

    for (const content of allContent) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sectionKey = content.section.key ?? "unknown";
      if (!contentByType.has(sectionKey)) {
        contentByType.set(sectionKey, []);
      }
      const typeArray = contentByType.get(sectionKey);
      if (typeArray) {
        typeArray.push(content);
      }
    }

    // Score all content items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreContent = (content: any): any => {
      let score = 0;
      const contentKeywords = new Set<string>();

      // Get content keywords from various fields
      if (content.title) {
        const titleWords = content.title.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
        for (const word of titleWords) {
          contentKeywords.add(word);
        }
      }

      if (content.description) {
        const descWords = content.description.toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
        for (const word of descWords) {
          contentKeywords.add(word);
        }
      }

      // Parse skills and add them
      const skills =
        typeof content.skills === "string"
          ? JSON.parse(content.skills ?? "[]")
          : (content.skills ?? []);
      for (const skill of skills) {
        contentKeywords.add(skill.toLowerCase());
      }

      // Parse keywords and add them
      const keywords =
        typeof content.keywords === "string"
          ? JSON.parse(content.keywords ?? "[]")
          : (content.keywords ?? []);
      for (const keyword of keywords) {
        contentKeywords.add(keyword.toLowerCase());
      }

      // Add content tags as keywords
      const contentTags = content.tags?.map((ct: { tag: { name: string } }) => ct.tag.name) ?? [];
      for (const tagName of contentTags) {
        contentKeywords.add(tagName.toLowerCase());
      }

      // Calculate score based on keyword overlap
      let matches = 0;
      for (const jobKeyword of jobKeywords) {
        for (const contentKeyword of contentKeywords) {
          if (contentKeyword.includes(jobKeyword) || jobKeyword.includes(contentKeyword)) {
            matches++;
          }
        }
      }

      // Bonus points for content type relevance
      const typeBonus = this.getContentTypeRelevanceScore(
        content.section?.key ?? "unknown",
        jobRequirements,
      );

      // Calculate final score
      score = (matches / Math.max(jobKeywords.size, 1)) * 100 + typeBonus;

      return { ...content, matchScore: score };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedContent: any[] = [];

    // 1. Get 2-3 most relevant EXPERIENCES (preferably 3, LLM will determine if all fit)
    const experiences = contentByType.get("experience") ?? [];
    if (experiences.length > 0) {
      const scoredExperiences = experiences
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, Math.min(3, experiences.length)); // Get top 3 or all if less than 3
      selectedContent.push(...scoredExperiences);
      this.logger.log(
        `Selected ${scoredExperiences.length} experiences (target: 2-3, preferably 3)`,
      );
    }

    // 2. Get at least 1 EDUCATION
    const education = contentByType.get("education") ?? [];
    if (education.length > 0) {
      const scoredEducation = education
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, Math.min(2, education.length)); // Get top 2 education items max
      selectedContent.push(...scoredEducation);
      this.logger.log(`Selected ${scoredEducation.length} education items (target: 1+)`);
    }

    // 3. Get ALL relevant TECHNICAL SKILLS
    const technicalSkills = contentByType.get("technical_skills") ?? [];
    if (technicalSkills.length > 0) {
      const scoredTechnicalSkills = technicalSkills
        .map(scoreContent)
        .filter((content) => content.matchScore >= 15) // Only relevant technical skills
        .sort((a, b) => b.matchScore - a.matchScore);
      selectedContent.push(...scoredTechnicalSkills);
      this.logger.log(
        `Selected ${scoredTechnicalSkills.length} technical skill categories (all relevant)`,
      );
    }

    // 4. Get ALL relevant SOFT SKILLS
    const softSkills = contentByType.get("skills") ?? [];
    if (softSkills.length > 0) {
      const scoredSoftSkills = softSkills
        .map(scoreContent)
        .filter((content) => content.matchScore >= 15) // Only relevant soft skills
        .sort((a, b) => b.matchScore - a.matchScore);
      selectedContent.push(...scoredSoftSkills);
      this.logger.log(`Selected ${scoredSoftSkills.length} soft skill categories (all relevant)`);
    }

    // 5. Get 1 VOLUNTEER EXPERIENCE
    const volunteer = contentByType.get("volunteer") ?? [];
    if (volunteer.length > 0) {
      const scoredVolunteer = volunteer
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 1);
      selectedContent.push(...scoredVolunteer);
      this.logger.log(`Selected ${scoredVolunteer.length} volunteer experience (target: 1)`);
    }

    // 6. Get 2 top PROJECTS
    const projects = contentByType.get("projects") ?? [];
    if (projects.length > 0) {
      const scoredProjects = projects
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 2);
      selectedContent.push(...scoredProjects);
      this.logger.log(`Selected ${scoredProjects.length} projects (target: 2)`);
    }

    // 7. Get HOBBIES/ACTIVITIES/INTERESTS
    const interests = contentByType.get("interests") ?? [];
    if (interests.length > 0) {
      const scoredInterests = interests
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3); // Max 3 interest categories
      selectedContent.push(...scoredInterests);
      this.logger.log(
        `Selected ${scoredInterests.length} interests/hobbies (target: all relevant)`,
      );
    }

    // 8. Get ALL LANGUAGES (sorted by relevancy)
    const languages = contentByType.get("languages") ?? [];
    if (languages.length > 0) {
      const scoredLanguages = languages
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore);
      selectedContent.push(...scoredLanguages);
      this.logger.log(`Selected ${scoredLanguages.length} languages (all, sorted by relevancy)`);
    }

    // 9. Get 1 SUMMARY (if exists)
    const summaries = contentByType.get("summary") ?? [];
    if (summaries.length > 0) {
      const scoredSummary = summaries
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 1);
      selectedContent.push(...scoredSummary);
      this.logger.log(`Selected ${scoredSummary.length} summary (target: 1)`);
    }

    // 10. Get ALL CONTACT INFO
    const contacts = contentByType.get("contact") ?? [];
    if (contacts.length > 0) {
      selectedContent.push(...contacts.map(scoreContent));
      this.logger.log(`Selected ${contacts.length} contact info items (all)`);
    }

    // 11. Add CERTIFICATIONS (highly relevant)
    const certifications = contentByType.get("certifications") ?? [];
    if (certifications.length > 0) {
      const scoredCertifications = certifications
        .map(scoreContent)
        .filter((content) => content.matchScore >= 20) // Only relevant certifications
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4); // Max 4 certifications
      selectedContent.push(...scoredCertifications);
      this.logger.log(`Selected ${scoredCertifications.length} certifications (relevant only)`);
    }

    // 12. Add PUBLICATIONS (if relevant)
    const publications = contentByType.get("publications") ?? [];
    if (publications.length > 0) {
      const scoredPublications = publications
        .map(scoreContent)
        .filter((content) => content.matchScore >= 25) // Only highly relevant publications
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 2); // Max 2 publications
      selectedContent.push(...scoredPublications);
      this.logger.log(`Selected ${scoredPublications.length} publications (highly relevant only)`);
    }

    // 13. Add AWARDS (if relevant)
    const awards = contentByType.get("awards") ?? [];
    if (awards.length > 0) {
      const scoredAwards = awards
        .map(scoreContent)
        .filter((content) => content.matchScore >= 15) // Relevant awards
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3); // Max 3 awards
      selectedContent.push(...scoredAwards);
      this.logger.log(`Selected ${scoredAwards.length} awards (relevant only)`);
    }

    // 14. Add PROFILES (professional social media)
    const profiles = contentByType.get("profiles") ?? [];
    if (profiles.length > 0) {
      const scoredProfiles = profiles
        .map(scoreContent)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3); // Max 3 profiles
      selectedContent.push(...scoredProfiles);
      this.logger.log(`Selected ${scoredProfiles.length} profiles (top 3)`);
    }

    // Remove duplicates
    const uniqueSelected = selectedContent.filter(
      (content, index, self) => index === self.findIndex((c) => c.id === content.id),
    );

    // Log comprehensive selection summary
    this.logger.log(`=== COMPREHENSIVE CONTENT SELECTION SUMMARY ===`);
    const typeBreakdown = new Map<string, number>();
    for (const content of uniqueSelected) {
      const sectionKey = content.section?.key ?? "unknown";
      typeBreakdown.set(sectionKey, (typeBreakdown.get(sectionKey) ?? 0) + 1);
    }

    for (const [type, count] of typeBreakdown) {
      this.logger.log(`  ${type}: ${count} items`);
    }

    this.logger.log(
      `Total selected: ${uniqueSelected.length} items for comprehensive one-page resume`,
    );
    this.logger.log(
      `Top scores: ${uniqueSelected
        .slice(0, 5)
        .map((c) => `${c.title}: ${c.matchScore.toFixed(1)}`)
        .join(", ")}`,
    );

    return uniqueSelected;
  }

  /**
   * Get content type relevance score for job requirements (NO LLM)
   */
  private getContentTypeRelevanceScore(contentType: string, jobRequirements: string[]): number {
    const requirementText = jobRequirements.join(" ").toLowerCase();

    const typeRelevanceMap: Record<string, { keywords: string[]; bonus: number }> = {
      WORK_EXPERIENCE: {
        keywords: ["experience", "years", "worked", "led", "managed", "senior", "lead"],
        bonus: 20,
      },
      TECHNICAL_SKILL: {
        keywords: ["skill", "programming", "development", "technology", "framework"],
        bonus: 15,
      },
      PROJECT: {
        keywords: ["project", "built", "developed", "created", "portfolio"],
        bonus: 15,
      },
      SOFT_SKILL: {
        keywords: ["leadership", "communication", "team", "management", "collaboration"],
        bonus: 10,
      },
      EDUCATION: {
        keywords: ["education", "degree", "university", "bachelor", "master"],
        bonus: 8,
      },
      CERTIFICATION: {
        keywords: ["certified", "certification", "license", "credential"],
        bonus: 12,
      },
    };

    const typeInfo = typeRelevanceMap[contentType];
    if (!typeInfo) return 0;

    const keywordMatches = typeInfo.keywords.filter((keyword) =>
      requirementText.includes(keyword),
    ).length;

    return keywordMatches > 0 ? typeInfo.bonus : 0;
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
    summary: string,
    jobApplication: any,
  ): Promise<any> {
    // Get default resume structure
    const { defaultResumeData } = await import("@reactive-resume/schema");
    const resumeData = JSON.parse(JSON.stringify(defaultResumeData));

    // Set basic info
    resumeData.basics.name = user.name;
    resumeData.basics.email = user.email;
    resumeData.basics.picture.url = user.picture || "";
    resumeData.basics.headline = `${jobApplication.title} | ${user.name}`;

    // Set generated summary
    resumeData.sections.summary.content = `<p>${summary}</p>`;

    // CRITICAL: Ensure proper metadata layout structure is maintained
    // The defaultResumeData should have this, but let's ensure it's correct
    if (!resumeData.metadata.layout || !Array.isArray(resumeData.metadata.layout)) {
      this.logger.warn("Default resume data missing proper layout - fixing");
      resumeData.metadata.layout = [
        [
          ["summary", "experience", "education", "projects", "volunteer", "references"],
          [
            "profiles",
            "skills",
            "certifications",
            "languages",
            "interests",
            "awards",
            "publications",
          ],
        ],
      ];
    }

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
    const basicInfo = selectedContent.filter((c) => c.section?.key === "contact");

    // Add work experience
    resumeData.sections.experience.items = workExperiences.map((exp) => {
      const content = typeof exp.content === "string" ? JSON.parse(exp.content) : exp.content;
      const achievements =
        typeof exp.achievements === "string" ? JSON.parse(exp.achievements) : exp.achievements;

      return {
        id: createId(),
        visible: true,
        company: exp.company || "Company",
        position: exp.position || exp.title || "Position",
        location: exp.location || "",
        date: this.formatDateRange(exp.startDate, exp.endDate) || "Present",
        summary:
          this.formatExperienceContent(exp.description, content, achievements) ||
          "<p>No description available</p>",
        url: { label: "", href: "" },
        contentLibraryId: exp.id,
        sourceContentLibraryId: null,
      };
    });

    // Add projects
    resumeData.sections.projects.items = projects.map((proj) => {
      const content = typeof proj.content === "string" ? JSON.parse(proj.content) : proj.content;

      return {
        id: createId(),
        visible: true,
        name: proj.title || "Project",
        description: proj.position || "Project",
        date: this.formatDateRange(proj.startDate, proj.endDate) || "Recent",
        summary: `<p>${proj.description || "No description available"}</p>`,
        keywords: typeof proj.skills === "string" ? JSON.parse(proj.skills) : proj.skills || [],
        url: { label: "", href: "" },
        contentLibraryId: proj.id,
        sourceContentLibraryId: null,
      };
    });

    // Add education
    resumeData.sections.education.items = education.map((edu) => ({
      id: createId(),
      visible: true,
      institution: edu.company || edu.title || "Institution",
      studyType: edu.position || "Degree",
      area: edu.location || "",
      score: "",
      date: this.formatDateRange(edu.startDate, edu.endDate) || "Graduated",
      summary: `<p>${edu.description || "No description available"}</p>`,
      url: { label: "", href: "" },
      contentLibraryId: edu.id,
      sourceContentLibraryId: null,
    }));

    // Add technical skills - combine technical skills into categories
    const allTechnicalSkills: string[] = [];
    for (const skill of technicalSkills) {
      const skillList =
        typeof skill.skills === "string" ? JSON.parse(skill.skills ?? "[]") : (skill.skills ?? []);
      allTechnicalSkills.push(...skillList);
    }

    // Group technical skills by type/category
    const technicalSkillCategories = this.groupSkillsByCategory(
      allTechnicalSkills,
      technicalSkills,
    );
    resumeData.sections.skills.items = technicalSkillCategories;

    // Add soft skills as a separate section
    // For now, soft skills will be added to the skills section alongside technical skills
    // In the future, you might want to create a separate section for soft skills
    for (const softSkill of softSkills) {
      const softSkillItem = {
        id: createId(),
        visible: true,
        name: softSkill.title || "Soft Skill",
        description: softSkill.description || "",
        level: 0,
        keywords:
          typeof softSkill.skills === "string"
            ? JSON.parse(softSkill.skills ?? "[]")
            : (softSkill.skills ?? []),
        contentLibraryId: softSkill.id,
        sourceContentLibraryId: null,
      };
      resumeData.sections.skills.items.push(softSkillItem);
    }

    // Add certifications
    resumeData.sections.certifications.items = certifications.map((cert) => ({
      id: createId(),
      visible: true,
      name: cert.title || "Certification",
      issuer: cert.company || "Issuing Organization",
      date: cert.startDate
        ? new Date(cert.startDate).getFullYear().toString()
        : new Date().getFullYear().toString(),
      summary: `<p>${cert.description || "No description available"}</p>`,
      url: { label: "", href: "" },
      contentLibraryId: cert.id,
      sourceContentLibraryId: null,
    }));

    // Add publications
    resumeData.sections.publications.items = publications.map((pub) => ({
      id: createId(),
      visible: true,
      name: pub.title || "Publication",
      publisher: pub.company || "Publisher",
      date: pub.startDate
        ? new Date(pub.startDate).getFullYear().toString()
        : new Date().getFullYear().toString(),
      summary: `<p>${pub.description || "No description available"}</p>`,
      url: { label: "", href: pub.url || "" },
      contentLibraryId: pub.id,
      sourceContentLibraryId: null,
    }));

    // Add awards
    resumeData.sections.awards.items = awards.map((award) => ({
      id: createId(),
      visible: true,
      title: award.title || "Award",
      awarder: award.company || award.issuer || "Awarding Organization",
      date: award.startDate
        ? new Date(award.startDate).getFullYear().toString()
        : new Date().getFullYear().toString(),
      summary: `<p>${award.description || "No description available"}</p>`,
      url: { label: "", href: award.url || "" },
      contentLibraryId: award.id,
      sourceContentLibraryId: null,
    }));

    // Add languages
    resumeData.sections.languages.items = languages.map((lang) => {
      // Convert percentage (0-100) to level (0-5) scale
      const convertPercentageToLevel = (percentage: number): number => {
        if (percentage >= 90) return 5;
        if (percentage >= 75) return 4;
        if (percentage >= 60) return 3;
        if (percentage >= 40) return 2;
        if (percentage >= 20) return 1;
        return 0;
      };

      const rawLevel = lang.proficiencyLevel || 0;
      const convertedLevel = rawLevel > 5 ? convertPercentageToLevel(rawLevel) : rawLevel;

      return {
        id: createId(),
        visible: true,
        name: lang.title || "Language",
        description: lang.proficiencyLevel
          ? `${lang.proficiencyLevel}% proficiency (Level ${convertedLevel}/5)`
          : lang.description || "No proficiency level specified",
        level: convertedLevel,
        contentLibraryId: lang.id,
        sourceContentLibraryId: null,
      };
    });

    // Add interests
    resumeData.sections.interests.items = interests.map((interest) => ({
      id: createId(),
      visible: true,
      name: interest.title || "Interest",
      keywords:
        typeof interest.keywords === "string"
          ? JSON.parse(interest.keywords)
          : interest.keywords || [],
      contentLibraryId: interest.id,
      sourceContentLibraryId: null,
    }));

    // Add volunteer experience
    resumeData.sections.volunteer.items = volunteer.map((vol) => ({
      id: createId(),
      visible: true,
      organization: vol.company || "Organization",
      position: vol.position || vol.title || "Volunteer",
      location: vol.location || "",
      date: this.formatDateRange(vol.startDate, vol.endDate) || "Recent",
      summary: `<p>${vol.description || "No description available"}</p>`,
      url: { label: "", href: vol.url || "" },
      contentLibraryId: vol.id,
      sourceContentLibraryId: null,
    }));

    // Add references
    resumeData.sections.references.items = references.map((ref) => ({
      id: createId(),
      visible: true,
      name: ref.title || "Reference",
      description: ref.position || ref.company || "Reference",
      summary: `<p>${ref.description || "No description available"}</p>`,
      url: { label: "", href: ref.url || "" },
      contentLibraryId: ref.id,
      sourceContentLibraryId: null,
    }));

    // Add profiles
    resumeData.sections.profiles.items = profiles.map((profile) => {
      const content =
        typeof profile.content === "string" ? JSON.parse(profile.content) : profile.content;
      return {
        id: createId(),
        visible: true,
        network: profile.company || content?.network || "Social Media",
        username: content?.username || profile.title || "Username",
        icon: content?.icon || "",
        url: { label: "", href: profile.url || content?.url || "" },
        contentLibraryId: profile.id,
        sourceContentLibraryId: null,
      };
    });

    // Handle basic info if present
    if (basicInfo.length > 0) {
      const info = basicInfo[0];
      const content = typeof info.content === "string" ? JSON.parse(info.content) : info.content;

      // Update basics with content library data
      if (content?.email) resumeData.basics.email = content.email;
      if (content?.phone) resumeData.basics.phone = content.phone;
      if (content?.location) resumeData.basics.location = content.location;
      if (content?.website) resumeData.basics.url.href = content.website;
    }

    return resumeData;
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
   * Format experience content with achievements
   */
  private formatExperienceContent(description: string, content: any, achievements: any[]): string {
    let html = `<p>${description || "No description available"}</p>`;

    if (content?.responsibilities && Array.isArray(content.responsibilities)) {
      html += "<ul>";
      content.responsibilities.forEach((resp: string) => {
        html += `<li><p>${resp}</p></li>`;
      });
      html += "</ul>";
    }

    if (achievements && Array.isArray(achievements) && achievements.length > 0) {
      html += "<ul>";
      achievements.forEach((achievement: string) => {
        html += `<li><p>🏆 ${achievement}</p></li>`;
      });
      html += "</ul>";
    }

    return html || "<p>No description available</p>";
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
        // For skills, we'll use the first contributing source as contentLibraryId
        // and track all sources in a special way
        return {
          id: createId(),
          visible: true,
          name: category,
          description: "",
          level: 0,
          keywords: [...new Set(skills)], // Remove duplicates
          contentLibraryId: sourceIds.length > 0 ? sourceIds[0] : null,
          sourceContentLibraryId: null,
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
