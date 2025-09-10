import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { CoverLetter, Prisma } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";

import { LLMService } from "@/server/llm/llm.service";
import { PrinterService } from "@/server/printer/printer.service";

// Temporary local types to avoid nestjs-zod frontend bundling issues
type CreateCoverLetterDto = {
  title: string;
  content: string;
  jobApplicationId?: string;
  template?: string;
  tone?: string;
};

type UpdateCoverLetterDto = {
  title?: string;
  content?: string;
  template?: string;
  tone?: string;
};

@Injectable()
export class CoverLetterService {
  private readonly logger = new Logger(CoverLetterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly printerService: PrinterService,
  ) {}

  /**
   * Parse JSON string array or return empty array
   */
  private parseArray(value: any): any[] {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  }

  /**
   * Create a new cover letter
   */
  async create(
    userId: string,
    data: {
      content: string;
      templateName?: string;
      tone?: string;
      jobApplicationId: string;
      generatedFrom?: string; // JSON array of content IDs used
    },
  ): Promise<CoverLetter> {
    this.logger.debug(`Creating cover letter for user ${userId} and job application ${data.jobApplicationId}`);

    try {
      const coverLetter = await this.prisma.coverLetter.create({
        data: {
          content: data.content,
          templateName: data.templateName || "professional",
          tone: data.tone || "professional",
          generatedFrom: data.generatedFrom || "[]",
          jobApplicationId: data.jobApplicationId,
        },
        include: {
          jobApplication: {
            include: {
              company: true,
            },
          },
        },
      });

      this.logger.debug(`Cover letter created with ID: ${coverLetter.id}`);
      return coverLetter;
    } catch (error) {
      this.logger.error(`Failed to create cover letter: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Find cover letter by ID (auto-enhanced with full structure)
   */
  async findOne(id: string, userId?: string): Promise<any> {
    const whereClause: Prisma.CoverLetterWhereInput = { id };
    
    // If userId provided, ensure user owns the cover letter through job application
    if (userId) {
      whereClause.jobApplication = { userId };
    }

    const coverLetter = await this.prisma.coverLetter.findFirst({
      where: whereClause,
      include: {
        jobApplication: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!coverLetter) {
      throw new NotFoundException("Cover letter not found");
    }

    // Enhance cover letter with full data structure (like generation response)
    return this.enhanceExistingCoverLetter(coverLetter);
  }

  /**
   * Find all cover letters for a user
   */
  async findMany(userId: string): Promise<CoverLetter[]> {
    return this.prisma.coverLetter.findMany({
      where: {
        jobApplication: { userId },
      },
      include: {
        jobApplication: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  /**
   * Update cover letter content
   */
  async update(
    id: string,
    userId: string,
    data: {
      content?: string;
      templateName?: string;
      tone?: string;
    },
  ): Promise<CoverLetter> {
    // Verify ownership
    await this.findOne(id, userId);

    return this.prisma.coverLetter.update({
      where: { id },
      data,
      include: {
        jobApplication: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  /**
   * Delete cover letter
   */
  async delete(id: string, userId: string): Promise<void> {
    // Verify ownership
    await this.findOne(id, userId);

    await this.prisma.coverLetter.delete({
      where: { id },
    });

    this.logger.debug(`Cover letter ${id} deleted`);
  }

  /**
   * Generate tailored cover letter and save to database
   * Moved from JobApplicationService for better organization
   */
  async generateTailoredCoverLetter(
    jobApplicationId: string,
    userId: string,
    options?: {
      templateName?: string;
      tone?: string;
      maxParagraphs?: number;
      selectedStoryIds?: string[];
      recipientName?: string; // Optional contact name from API
    },
  ): Promise<{
    coverLetter: CoverLetter;
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
    this.logger.log(`Generating tailored cover letter for job application ${jobApplicationId}`);

    try {
      // Get job application with company info
      const jobApplication = await this.prisma.jobApplication.findFirst({
        where: { id: jobApplicationId, userId },
        include: { company: true },
      });

      if (!jobApplication) {
        throw new Error("Job application not found");
      }

      // Get user's basic info for template population
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Step 1: Fetch contact content from content library (like resume system)
      const contactContent = await this.fetchContactContentForJob(userId, jobApplication);
      
      let basics = null;
      if (contactContent) {
        basics = await this.buildBasicsFromContactContent(contactContent, user, jobApplication);
      }
      
      // Fallback: Create basics structure from user data if no contact content found
      if (!basics) {
        this.logger.log("No contact content found during generation, creating fallback basics structure");
        basics = {
          name: user?.name || "",
          headline: jobApplication.title || "",  // Use job title as headline
          email: user?.email || "",
          phone: "",
          location: "",
          url: { href: "", label: "" },
          customFields: [],
          // No picture needed for cover letters
        };
      }
      
      // Step 2: Analyze company themes from job description and company info
      const companyThemes = await this.llmService.extractCompanyThemes(
        userId,
        jobApplication.description || "",
        jobApplication.company,
      );

      this.logger.log(`Extracted company themes: ${companyThemes.join(", ")}`);

      // Step 2: Select best matching paragraph blocks (with optional story preference)
      const selectedContent = options?.selectedStoryIds && options.selectedStoryIds.length > 0
        ? await this.getSelectedStoriesById(userId, options.selectedStoryIds)
        : await this.llmService.selectBestCoverLetterParagraphs(
            userId,
            companyThemes,
            jobApplication.description || "",
            jobApplication.company,
            {
              maxParagraphs: options?.maxParagraphs || 3,
              ensureDiversity: true,
              prioritizeCurrentRole: true,
            },
          );

      if (selectedContent.length === 0) {
        throw new Error(
          "No relevant cover letter content found. Please add cover letter stories to your content library.",
        );
      }

      this.logger.log(`Selected ${selectedContent.length} paragraph blocks for cover letter`);

      // Step 3: Generate cover letter using token-based template
      const result = await this.llmService.generateTailoredCoverLetterFromTemplate(
        user,
        jobApplication,
        jobApplication.company,
        selectedContent,
        companyThemes,
        {
          templateName: options?.templateName || "professional",
          tone: options?.tone || "professional",
        },
      );

      if (!result.success || !result.data) {
        throw new Error("Failed to generate cover letter content");
      }

      // Step 4: Calculate metadata
      const metadata = {
        companyValueAlignment: result.data.companyValueAlignment || 0,
        contentDiversity: this.calculateContentDiversity(selectedContent),
        overallFitScore: result.data.overallFitScore || 0,
      };

      // Step 5: Get structured data (temporarily using any cast)
      const structuredData = (result as any).structuredData || {};
      
      // Step 6: Save cover letter to database with body content only (no header/footer duplication)
      const coverLetter = await this.create(userId, {
        content: this.extractBodyFromContent(structuredData.bodyContent || result.data.coverLetter),
        templateName: result.data.template || options?.templateName || "professional",
        tone: result.data.tone || options?.tone || "professional",
        jobApplicationId,
        generatedFrom: JSON.stringify(selectedContent.map(c => c.id)),
      });

      // Step 8: Create enhanced data structure (like resume data)  
      const enhancedCoverLetter = {
        ...coverLetter,
        
        // Structured header data (from LLM + contact content)
        ...(structuredData.headerData || {}),
        
        // Structured company data (from LLM)  
        ...(structuredData.companyData || {}),
        
        // Structured footer data
        ...(structuredData.footerData || {}),
        
        // Application subject line
        applicationSubject: `Application for ${jobApplication.title} at ${jobApplication.companyName || jobApplication.company?.name || ""}`,
        
        // Recipient (Hiring Team by default, overridable)
        recipientName: options?.recipientName || "Hiring Team",
        recipientTitle: options?.recipientName ? "Hiring Manager" : "Hiring Team",
        
        // Basics structure (like resume) populated from contact content
        basics: basics,
        
        // Story tracking (for UI state management)
        selectedStoryIds: selectedContent.map(c => c.id),
        availableStoryIds: [], // Frontend will populate this
        
        // Enhanced company data (for sidebar display - use DB data for completeness)
        companyData: jobApplication.company ? {
          id: jobApplication.company.id,
          name: jobApplication.company.name,
          industry: jobApplication.company.industry,
          size: jobApplication.company.size,
          location: jobApplication.company.location,
          values: JSON.parse(jobApplication.company.values || "[]"),
          mission: jobApplication.company.mission,
          culture: jobApplication.company.culture,
          website: jobApplication.company.website,
          linkedinUrl: jobApplication.company.linkedinUrl,
          twitterUrl: jobApplication.company.twitterUrl,
          facebookUrl: jobApplication.company.facebookUrl,
          instagramUrl: jobApplication.company.instagramUrl,
          youtubeUrl: jobApplication.company.youtubeUrl,
          githubUrl: jobApplication.company.githubUrl,
        } : null,
        
        // Job application data (for context)
        jobApplicationData: {
          id: jobApplication.id,
          title: jobApplication.title,
          companyName: jobApplication.companyName,
          description: jobApplication.description,
          requirements: this.parseArray(jobApplication.requirements),
          extractedTags: this.parseArray(jobApplication.extractedTags),
        },
        
        // Note: content field now contains clean body content (no bodyContent duplication)
      };

      return {
        coverLetter: enhancedCoverLetter,
        usedContent: selectedContent.map(content => ({
          id: content.id,
          contentType: content.contentType,
          skillTheme: content.skillTheme,
          paragraphType: content.contentType,
          matchScore: content.matchScore || 0,
          companyValueAlignment: content.companyValueAlignment || 0,
        })),
        companyThemes,
        selectedParagraphs: selectedContent,
        template: result.data.template || "professional",
        tone: result.data.tone || "professional",
        metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to generate tailored cover letter: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Calculate content diversity score
   * Moved from JobApplicationService
   */
  private calculateContentDiversity(selectedContent: any[]): number {
    if (selectedContent.length === 0) return 0;

    const contentTypes = new Set(selectedContent.map(c => c.contentType));
    const diversityRatio = contentTypes.size / selectedContent.length;
    return Math.round(diversityRatio * 100);
  }

  /**
   * Get selected stories by IDs (for manual story selection)
   */
  private async getSelectedStoriesById(userId: string, storyIds: string[]) {
    this.logger.debug(`Getting manually selected stories: ${storyIds.length} stories`);
    
    const stories = await this.prisma.coverLetterContent.findMany({
      where: {
        id: { in: storyIds },
        userId,
      },
      include: {
        content: true,
      },
    });
    
    this.logger.log(`Found ${stories.length} manually selected stories`);
    return stories;
  }

  /**
   * Enhance existing cover letter with full data structure
   * This ensures existing cover letters have the same structure as newly generated ones
   */
  private async enhanceExistingCoverLetter(coverLetter: any) {
    try {
      this.logger.log(`🔧 Enhancing cover letter ${coverLetter.id} with full structure...`);
      
      const jobApplication = coverLetter.jobApplication;
      const user = await this.prisma.user.findUnique({
        where: { id: jobApplication.userId },
        select: { id: true, name: true, email: true },
      });
      
      this.logger.log(`User found: ${user?.name} (${user?.email}), Job: ${jobApplication.title}`);

      // Get best contact content for user details (with job title for enhanced headline)
      const contactContent = await this.fetchContactContentForJob(jobApplication.userId, jobApplication);
      
      // Build basics structure from contact content (like during generation)
      let basics = null;
      if (contactContent) {
        basics = await this.buildBasicsFromContactContent(contactContent, user, jobApplication);
      }
      
      // Fallback: Create basics structure from user data if no contact content found
      if (!basics) {
        this.logger.log("No contact content found, creating fallback basics structure from user data");
        basics = {
          name: user?.name || "",
          headline: jobApplication.title || "",  // Use job title as headline
          email: user?.email || "",
          phone: "",
          location: "",
          url: { href: "", label: "" },
          customFields: [],
          // No picture needed for cover letters
        };
        this.logger.log(`✅ Fallback basics created: name="${basics.name}", headline="${basics.headline}"`);
      }

      const enhancedData = {
        ...coverLetter,
        
        // User information (from contact content + user profile)
        senderName: contactContent?.name || user?.name || "",
        senderEmail: contactContent?.email || user?.email || "",
        senderPhone: contactContent?.phone || "",
        senderAddress: contactContent?.address || "",
        senderLinkedIn: contactContent?.linkedin || "",
        senderTitle: contactContent?.title || "",
        
        // Company information
        companyName: jobApplication?.company?.name || jobApplication?.companyName || "",
        companyAddress: "",
        recipientName: "Hiring Team",          // ✅ Fixed to "Hiring Team"
        recipientTitle: "Hiring Team",         // ✅ Fixed to "Hiring Team"
        applicationSubject: `Application for ${jobApplication?.title || "Position"} at ${jobApplication?.company?.name || jobApplication?.companyName || "Company"}`,
        
        // Basics structure (like resume) populated from contact content
        basics: basics,
        
        // Story tracking
        selectedStoryIds: JSON.parse(coverLetter.generatedFrom || "[]"),
        availableStoryIds: [],
        
        // Company data (for sidebar display)
        companyData: jobApplication.company ? {
          id: jobApplication.company.id,
          name: jobApplication.company.name,
          industry: jobApplication.company.industry,
          size: jobApplication.company.size,
          location: jobApplication.company.location,
          values: JSON.parse(jobApplication.company.values || "[]"),
          mission: jobApplication.company.mission,
          culture: jobApplication.company.culture,
          website: jobApplication.company.website,
          linkedinUrl: jobApplication.company.linkedinUrl,
          twitterUrl: jobApplication.company.twitterUrl,
          facebookUrl: jobApplication.company.facebookUrl,
          instagramUrl: jobApplication.company.instagramUrl,
          youtubeUrl: jobApplication.company.youtubeUrl,
          githubUrl: jobApplication.company.githubUrl,
        } : null,
        
        // Job application data
        jobApplicationData: {
          id: jobApplication.id,
          title: jobApplication.title,
          companyName: jobApplication.companyName,
          description: jobApplication.description,
          requirements: this.parseArray(jobApplication.requirements),
          extractedTags: this.parseArray(jobApplication.extractedTags),
        },
        
        // Note: content field contains clean body content (no duplication needed)
        headerData: {
          senderName: contactContent?.name || user?.name || "",
          senderEmail: contactContent?.email || user?.email || "",
          senderPhone: contactContent?.phone || "",
          senderAddress: contactContent?.address || "",
          senderLinkedIn: contactContent?.linkedin || "",
          senderTitle: contactContent?.title || "",
          senderWebsite: contactContent?.website || "",
          senderLocation: contactContent?.location || "",
        },
        footerData: {
          closing: "Sincerely,",
          senderName: contactContent?.name || user?.name || "",
        },
      };

      this.logger.log(`✅ Cover letter enhancement complete. Basics included: ${enhancedData.basics ? "✅ Yes" : "❌ No"}`);
      if (enhancedData.basics) {
        this.logger.log(`   Basics: name="${enhancedData.basics.name}", headline="${enhancedData.basics.headline}"`);
      }

      return enhancedData;
    } catch (error) {
      this.logger.error(`❌ Failed to enhance cover letter: ${error}`);
      return coverLetter; // Return original if enhancement fails
    }
  }

  /**
   * Extract body content from complete cover letter text
   * Attempts to separate header/footer from body content
   */
  private extractBodyFromContent(content: string): string {
    if (!content) return "";

    const lines = content.split('\n');
    
    // Find "Dear" line as start of body
    const dearIndex = lines.findIndex(line => line.trim().startsWith('Dear'));
    
    // Find "Sincerely" line as end of body  
    const sincerelyIndex = lines.findIndex(line => line.trim().startsWith('Sincerely'));
    
    if (dearIndex >= 0 && sincerelyIndex >= 0) {
      // Extract lines between Dear and Sincerely
      const bodyLines = lines.slice(dearIndex + 1, sincerelyIndex);
      return bodyLines.join('\n').trim();
    }
    
    // If structure not found, return content as-is
    return content;
  }

  /**
   * Get best contact content for user (server-side method) - enhanced like resume generation
   */
  private async getBestContactContent(userId: string, jobTitle?: string): Promise<any> {
    try {
      const contactContent = await this.prisma.content.findFirst({
        where: {
          userId,
          section: {
            name: { in: ["contact", "basics", "personal"] }
          }
        },
        include: {
          section: true,
        },
        orderBy: { updatedAt: "desc" }
      });

      if (contactContent) {
        const data = JSON.parse(contactContent.data || "{}");
        
        // Enhanced processing like resume generation
        return {
          name: data.name || contactContent.title,
          email: data.email,
          phone: data.phone,
          address: data.address,
          linkedin: data.linkedin || data.linkedinUrl || data.url?.href,
          title: data.title || data.headline || jobTitle, // Use job title for relevance like resume
          location: data.location,
          website: data.website || data.url?.href,
          customFields: data.customFields || [],
          
          // Full structured data (like resume basics)
          fullContactData: data,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to get contact content: ${error}`);
      return null;
    }
  }

  /**
   * Build complete cover letter from structured data for PDF generation
   * Only used when full formatted letter is needed (not for storage)
   */
  buildCompleteLetterForDisplay(coverLetter: any): string {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
    });

    return `${coverLetter.senderName || ""}
${coverLetter.senderAddress || ""}
E: ${coverLetter.senderEmail || ""} | M: ${coverLetter.senderPhone || ""}
${coverLetter.senderLinkedIn || ""}

${currentDate}

${coverLetter.companyName || ""}
${coverLetter.companyAddress || ""}

${coverLetter.applicationSubject || ""}

Dear Hiring Manager,

${coverLetter.content}

${coverLetter.closing || "Sincerely,"}

${coverLetter.senderName || ""}`;
  }

  /**
   * Create an empty cover letter for manual editing
   */
  async createEmpty(userId: string, jobApplicationId: string): Promise<CoverLetter> {
    this.logger.debug(`Creating empty cover letter for job application ${jobApplicationId}`);

    // Get job application to generate basic template
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId },
      include: { company: true },
    });

    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Generate basic template content
    const basicContent = this.generateBasicTemplate(jobApplication);

    return this.create(userId, {
      content: basicContent,
      templateName: "professional",
      tone: "professional",
      jobApplicationId,
      generatedFrom: "[]", // No generated content for empty cover letter
    });
  }

  /**
   * Generate basic template for empty cover letters
   */
  private generateBasicTemplate(jobApplication: any): string {
    const companyName = jobApplication.company?.name || jobApplication.companyName || "[Company Name]";
    const position = jobApplication.title || "[Position Title]";
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `[Your Name]
[Your Address]
[Your Email] | [Your Phone]
[LinkedIn Profile]

${date}

[Hiring Manager Name]
${companyName}
[Company Address]

Dear Hiring Manager,

I am writing to express my interest in the ${position} position at ${companyName}. [Add your opening paragraph here explaining why you're interested in this role and company.]

[Add your first main paragraph here highlighting your relevant experience and achievements.]

[Add your second main paragraph here demonstrating your skills and how they align with the role requirements.]

[Add your closing paragraph here expressing enthusiasm and next steps.]

Thank you for considering my application. I look forward to the opportunity to discuss how my background and skills would benefit ${companyName}.

Sincerely,
[Your Name]`;
  }

  /**
   * Fetch contact content from content library for cover letter generation
   * Similar to resume system - gets best matching contact content
   */
  private async fetchContactContentForJob(userId: string, jobApplication: any): Promise<any | null> {
    try {
      this.logger.log(`Fetching contact content for user ${userId}...`);

      // Try multiple approaches to find contact content (more flexible than resume system)
      let contactContentItems = await this.prisma.content.findMany({
        where: {
          userId,
          section: {
            key: "contact"
          }
        },
        include: {
          section: true,
        },
        orderBy: { updatedAt: "desc" }
      });

      // If no content found by key="contact", try section name matching
      if (contactContentItems.length === 0) {
        this.logger.log("No content found with section.key='contact', trying section.name...");
        
        contactContentItems = await this.prisma.content.findMany({
          where: {
            userId,
            section: {
              name: { in: ["contact", "basics", "personal"] }
            }
          },
          include: {
            section: true,
          },
          orderBy: { updatedAt: "desc" }
        });
      }

      // If still no content, try broader search
      if (contactContentItems.length === 0) {
        this.logger.log("No contact content found by name either, trying broader search...");
        
        // Get all content and log for debugging
        const allContent = await this.prisma.content.findMany({
          where: { userId },
          include: { section: true },
          take: 10,
          orderBy: { updatedAt: "desc" }
        });
        
        this.logger.log(`Found ${allContent.length} total content items for debugging:`);
        allContent.forEach(item => {
          this.logger.log(`  - "${item.title}" (section: key="${item.section?.key}", name="${item.section?.name}")`);
        });
        
        return null;
      }

      // For now, use the most recent contact content
      const bestMatch = contactContentItems[0];
      this.logger.log(`✅ Using contact content: "${bestMatch.title}" (section: key="${bestMatch.section?.key}", name="${bestMatch.section?.name}")`);
      
      return bestMatch;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch contact content: ${error}`);
      return null;
    }
  }

  /**
   * Build basics structure from contact content (like resume system)
   * Creates the same basics structure as resumes for consistency
   */
  private async buildBasicsFromContactContent(contactContent: any, user: any, jobApplication: any): Promise<any> {
    try {
      this.logger.log(`Building basics from contact content: "${contactContent?.title}"`);
      
      const data = typeof contactContent.data === "string" 
        ? JSON.parse(contactContent.data) 
        : contactContent.data;

      this.logger.log(`Contact data parsed. Name: "${data.name}", Headline: "${data.headline}", Email: "${data.email}"`);

      // Build basics structure similar to resume system
      let tailoredHeadline = null;
      try {
        tailoredHeadline = await this.tailorHeadlineForJob(data.headline, jobApplication);
        this.logger.log(`Headline tailoring result: "${data.headline}" → "${tailoredHeadline}"`);
      } catch (headlineError) {
        this.logger.warn(`Headline tailoring failed, using original: ${headlineError}`);
      }
      
      const basics = {
        name: user.name || data.name || "", // Always use user name first
        headline: tailoredHeadline || data.headline || jobApplication.title || "", // LLM-tailored headline
        email: data.email || user.email || "",
        phone: data.phone || "",
        location: data.location || "",
        url: data.url ? data.url : { href: "", label: "" },
        customFields: data.customFields?.map((field: any) => ({
          id: field.id || Math.random().toString(36).substr(2, 9),
          name: field.name || "",
          value: field.value || "",
          icon: field.icon || "info"
        })) || [],
        // No picture needed for cover letters
      };
      
      this.logger.log(`✅ Basics structure built successfully: name="${basics.name}", headline="${basics.headline}"`);
      return basics;
    } catch (error) {
      this.logger.error(`❌ Failed to build basics from contact content: ${error}`);
      return null;
    }
  }

  /**
   * Tailor headline for job relevance while preserving existing format
   * Examples: 
   * - "Lead Software Engineer | Android Lead" + "Senior Fullstack Developer" 
   *   → "Lead Software Engineer | Senior Fullstack Developer"
   * - "Technical Consultant | Solutions Engineer" + "Backend Developer"
   *   → "Technical Consultant | Backend Developer" 
   */
  private async tailorHeadlineForJob(currentHeadline: string, jobApplication: any): Promise<string | null> {
    if (!currentHeadline || !jobApplication?.title) {
      return null;
    }

    try {
      this.logger.log(`Tailoring headline "${currentHeadline}" for job: ${jobApplication.title}`);

      const prompt = `You are an expert in professional headline optimization. Your task is to adapt a professional headline for a specific job application while preserving the existing format and style.

CURRENT HEADLINE: "${currentHeadline}"
TARGET JOB TITLE: "${jobApplication.title}"
COMPANY: "${jobApplication.companyName || ""}"
JOB DESCRIPTION (first 200 chars): "${(jobApplication.description || "").slice(0, 200)}"

INSTRUCTIONS:
1. PRESERVE the existing format exactly (if it uses "|" separators, keep them; if it uses "&" or "+" keep those)
2. PRESERVE the structure (if it has 2 parts separated by |, keep 2 parts; if 3 parts, keep 3 parts)
3. ADAPT one or more parts to better align with the target job title
4. KEEP at least one original element that represents the person's core expertise
5. MAINTAIN professional tone and style
6. If the current headline already perfectly matches the job, return it unchanged
7. Focus on making the headline more relevant while keeping the person's established professional identity

EXAMPLES:
- "Lead Software Engineer | Android Lead" → "Lead Software Engineer | Senior Fullstack Developer" (for Fullstack role)
- "Technical Consultant | Solutions Engineer" → "Technical Consultant | Backend Developer" (for Backend role) 
- "Senior Developer" → "Senior Backend Developer" (for Backend role)
- "Full-Stack Developer | Product Engineer" → "Full-Stack Developer | Senior Product Engineer" (for Senior Product role)

Return ONLY the tailored headline, nothing else:`;

      const result = await this.llmService.chat([
        { role: "system", content: "You are a professional headline optimization expert. Return only the optimized headline, no explanations." },
        { role: "user", content: prompt }
      ]);

      if (result.success && result.data) {
        const tailoredHeadline = result.data.trim();
        this.logger.log(`Headline tailored: "${currentHeadline}" → "${tailoredHeadline}"`);
        return tailoredHeadline;
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to tailor headline: ${error}`);
      return null; // Return null to fall back to original headline
    }
  }

  /**
   * Print cover letter as PDF (similar to resume printing)
   */
  async printCoverLetter(id: string, userId: string): Promise<string> {
    // Get the cover letter with enhanced structure using the same method as display
    const rawCoverLetter = await this.findOne(id, userId);
    const enhancedCoverLetter = await this.enhanceExistingCoverLetter(rawCoverLetter);
    
    // Create proper cover letter data structure for printing
    const coverLetterPrintData = {
      id: enhancedCoverLetter.id,
      userId,
      // Cover letter data for artboard
      ...enhancedCoverLetter,
        metadata: {
          template: "cover-letter",
          page: {
            format: "a4", // Default format
            margin: 18,   // Default margin
          },
          theme: {
            primary: "#313c4e",   // Resume builder default
            secondary: "#449399", // Resume builder default  
            background: "#ffffff",
            text: "#000000",      // Resume builder default
          },
          typography: {
            font: {
              family: "Ubuntu",   // Resume builder default
              subset: "latin",    // Resume builder default
              variants: ["regular"], // Resume builder default
              size: 13,           // Resume builder default
            },
            lineHeight: 1.5,
            hideIcons: false,     // Resume builder default
            underlineLinks: true, // Resume builder default
          },
        },
    };

    // Use the cover letter print method in PrinterService
    return this.printerService.printCoverLetter(coverLetterPrintData);
  }
}
