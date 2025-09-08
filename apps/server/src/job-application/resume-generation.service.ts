import { Injectable, Logger } from "@nestjs/common";
import { createId } from "@paralleldrive/cuid2";
import { PrismaService } from "nestjs-prisma";
import type { ResumeData } from "@reactive-resume/schema";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { ContentMatchingService } from "@/server/content-matching/content-matching.service";
import { LLMService } from "@/server/llm/llm.service";

export interface TailoredResumeResult {
  resumeId: string;
  resumeData: ResumeData;
  selectedContent: {
    experience: any[];
    projects: any[];
    skills: any[];
    education: any[];
  };
  matchScores: Record<string, number>;
  optimizationNotes: string;
}

/**
 * Service responsible for generating tailored resumes
 * Handles content selection, resume building, and optimization
 */
@Injectable()
export class ResumeGenerationService {
  private readonly logger = new Logger(ResumeGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly contentLibraryService: ContentLibraryService,
    private readonly contentMatchingService: ContentMatchingService,
  ) {}

  /**
   * Generate a tailored resume for a job application
   */
  async generateTailoredResume(
    jobApplicationId: string,
    userId: string,
    options?: {
      selectedContentIds?: string[];
      includeAllContent?: boolean;
      customInstructions?: string;
      targetLength?: "one-page" | "two-page";
    },
  ): Promise<TailoredResumeResult> {
    this.logger.log(`Generating tailored resume for job application ${jobApplicationId}`);

    // Get job application details
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId },
      include: {
        company: true,
      },
    });

    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get base resume
    const baseResume = await this.getBaseResume(userId);
    if (!baseResume) {
      throw new Error("No base resume found");
    }

    // Match and select content
    const selectedContent = await this.selectContentForJob(
      userId,
      jobApplication,
      options?.selectedContentIds,
      options?.includeAllContent,
    );

    // Build tailored resume
    const resumeData = await this.buildResumeFromContent(
      baseResume,
      selectedContent,
      jobApplication,
      options,
    );

    // Create resume record
    const resumeTitle = `${jobApplication.title} - ${jobApplication.companyName}`;
    const resumeSlug = this.generateResumeSlug(jobApplication);

    const resume = await this.prisma.resume.create({
      data: {
        title: resumeTitle,
        slug: resumeSlug,
        data: resumeData as any,
        visibility: "private",
        locked: false,
        userId,
      },
    });

    // Link resume to job application
    await this.prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: {
        resumes: {
          connect: { id: resume.id },
        },
      },
    });

    return {
      resumeId: resume.id,
      resumeData,
      selectedContent,
      matchScores: await this.calculateMatchScores(selectedContent, jobApplication),
      optimizationNotes: this.generateOptimizationNotes(selectedContent, options?.targetLength),
    };
  }

  /**
   * Select best content for a specific job
   */
  private async selectContentForJob(
    userId: string,
    jobApplication: any,
    selectedContentIds?: string[],
    includeAllContent?: boolean,
  ) {
    this.logger.debug("Selecting content for job application");

    if (selectedContentIds && selectedContentIds.length > 0) {
      // Use manually selected content
      return this.getContentByIds(userId, selectedContentIds);
    }

    if (includeAllContent) {
      // Include all user content
      return this.getAllUserContent(userId);
    }

    // Use AI-powered content matching
    const jobDescription = jobApplication.description || "";
    const jobRequirements = typeof jobApplication.requirements === 'string' 
      ? JSON.parse(jobApplication.requirements) 
      : jobApplication.requirements || [];
    
    const matchingResult = await this.contentMatchingService.matchContentToJob(
      userId,
      jobRequirements,
      jobDescription,
      { useVectorSimilarity: true },
    );

    return await this.organizeMatchedContent(matchingResult);
  }

  /**
   * Build resume data from selected content
   */
  private async buildResumeFromContent(
    baseResume: any,
    selectedContent: any,
    jobApplication: any,
    options?: any,
  ): Promise<ResumeData> {
    this.logger.debug("Building resume from selected content");

    // Clone base resume
    let resumeData = JSON.parse(JSON.stringify(baseResume.data));

    // Update sections with selected content
    if (selectedContent.experience?.length > 0) {
      resumeData.sections.experience.items = this.processExperienceItems(
        selectedContent.experience,
        options?.targetLength,
      );
    }

    if (selectedContent.projects?.length > 0) {
      resumeData.sections.projects.items = this.processProjectItems(
        selectedContent.projects,
      );
    }

    if (selectedContent.skills?.length > 0) {
      resumeData.sections.skills.items = this.processSkillItems(
        selectedContent.skills,
      );
    }

    if (selectedContent.education?.length > 0) {
      resumeData.sections.education.items = this.processEducationItems(
        selectedContent.education,
      );
    }

    // Generate optimized summary
    if (options?.customInstructions || jobApplication.description) {
      resumeData.sections.summary.content = await this.generateOptimizedSummary(
        jobApplication,
        selectedContent,
        options?.customInstructions,
      );
    }

    // Apply length optimization
    if (options?.targetLength === "one-page") {
      resumeData = this.optimizeForOnePage(resumeData);
    }

    return resumeData;
  }

  /**
   * Process experience items for resume
   */
  private processExperienceItems(experiences: any[], targetLength?: string) {
    return experiences.map(exp => ({
      id: createId(),
      company: exp.company || "",
      position: exp.position || exp.title || "",
      location: exp.location || "",
      date: exp.date || exp.period || "",
      summary: this.truncateContent(exp.summary || exp.description, targetLength === "one-page" ? 3 : 5),
      contentId: exp.id,
      sourceContentId: exp.sourceId,
      visible: true,
    }));
  }

  /**
   * Process project items for resume
   */
  private processProjectItems(projects: any[]) {
    return projects.map(proj => ({
      id: createId(),
      name: proj.name || proj.title || "",
      description: proj.description || "",
      date: proj.date || "",
      summary: proj.summary || "",
      keywords: proj.tags || [],
      url: proj.url || proj.link || "",
      contentId: proj.id,
      sourceContentId: proj.sourceId,
      visible: true,
    }));
  }

  /**
   * Process skill items for resume
   */
  private processSkillItems(skills: any[]) {
    // Group skills by category if possible
    const skillGroups = new Map<string, string[]>();
    
    skills.forEach(skill => {
      const category = skill.category || "Technical Skills";
      if (!skillGroups.has(category)) {
        skillGroups.set(category, []);
      }
      skillGroups.get(category)!.push(skill.name || skill.title);
    });

    return Array.from(skillGroups.entries()).map(([category, items]) => ({
      id: createId(),
      name: category,
      description: items.join(", "),
      level: 0,
      keywords: items,
      visible: true,
    }));
  }

  /**
   * Process education items for resume
   */
  private processEducationItems(education: any[]) {
    return education.map(edu => ({
      id: createId(),
      institution: edu.institution || edu.school || "",
      studyType: edu.studyType || edu.degree || "",
      area: edu.area || edu.field || "",
      score: edu.score || edu.gpa || "",
      date: edu.date || edu.period || "",
      summary: edu.summary || "",
      contentId: edu.id,
      visible: true,
    }));
  }

  /**
   * Generate optimized professional summary
   */
  private async generateOptimizedSummary(
    jobApplication: any,
    selectedContent: any,
    customInstructions?: string,
  ): Promise<string> {
    const prompt = `
      Generate a professional summary for a resume targeting:
      Position: ${jobApplication.title}
      Company: ${jobApplication.companyName}
      Description: ${jobApplication.description?.slice(0, 500)}
      
      Based on candidate's experience:
      ${JSON.stringify(selectedContent.experience?.slice(0, 3))}
      
      ${customInstructions ? `Additional instructions: ${customInstructions}` : ""}
      
      Keep it concise (2-3 sentences), impactful, and tailored to the role.
    `;

    const result = await this.llmService.chat([
      { role: "system", content: "You are a professional resume writer." },
      { role: "user", content: prompt },
    ]);

    return result.data || "";
  }

  /**
   * Optimize resume for one-page format
   */
  private optimizeForOnePage(resumeData: ResumeData): ResumeData {
    // Truncate content to fit one page
    const optimized = { ...resumeData };

    // Limit experiences to top 3
    if (optimized.sections.experience?.items?.length > 3) {
      optimized.sections.experience.items = optimized.sections.experience.items.slice(0, 3);
    }

    // Limit projects to top 2
    if (optimized.sections.projects?.items?.length > 2) {
      optimized.sections.projects.items = optimized.sections.projects.items.slice(0, 2);
    }

    // Truncate summaries
    optimized.sections.experience?.items?.forEach((item: any) => {
      if (item.summary) {
        item.summary = this.truncateContent(item.summary, 3);
      }
    });

    return optimized;
  }

  /**
   * Helper methods
   */
  private async getBaseResume(userId: string) {
    return this.prisma.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  private async getContentByIds(userId: string, contentIds: string[]) {
    const content = await this.prisma.content.findMany({
      where: {
        id: { in: contentIds },
        userId,
      },
    });

    return this.organizeContentByType(content);
  }

  private async getAllUserContent(userId: string) {
    const content = await this.prisma.content.findMany({
      where: { userId },
    });

    return this.organizeContentByType(content);
  }

  private organizeContentByType(content: any[]) {
    return {
      experience: content.filter(c => c.type === "EXPERIENCE"),
      projects: content.filter(c => c.type === "PROJECT"),
      skills: content.filter(c => c.type === "SKILL"),
      education: content.filter(c => c.type === "EDUCATION"),
    };
  }

  private async organizeMatchedContent(matchingResult: any) {
    // If matchingResult is an array of ContentMatchResult, we need to organize by type
    if (Array.isArray(matchingResult)) {
      // Get the actual content items based on matched IDs
      const contentIds = matchingResult.map(m => m.contentId);
      const content = await this.prisma.content.findMany({
        where: { id: { in: contentIds } },
      });
      
      return this.organizeContentByType(content);
    }
    
    // Otherwise assume it's already structured
    return {
      experience: matchingResult.experiences || [],
      projects: matchingResult.projects || [],
      skills: matchingResult.skills || [],
      education: matchingResult.education || [],
    };
  }

  private generateResumeSlug(jobApplication: any): string {
    const title = jobApplication.title.toLowerCase().replace(/[^\da-z]+/g, "-");
    const company = (jobApplication.companyName || "unknown").toLowerCase().replace(/[^\da-z]+/g, "-");
    return `${title}-${company}-${Date.now()}`;
  }

  private truncateContent(content: string, maxBulletPoints: number): string {
    const bullets = content.split(/[•\n]/).filter(b => b.trim());
    return bullets.slice(0, maxBulletPoints).join(" • ");
  }

  private async calculateMatchScores(selectedContent: any, jobApplication: any): Promise<Record<string, number>> {
    // TODO: Implement scoring algorithm
    return {
      overall: 85,
      skills: 90,
      experience: 80,
      education: 75,
    };
  }

  private generateOptimizationNotes(selectedContent: any, targetLength?: string): string {
    const notes: string[] = [];
    
    if (targetLength === "one-page") {
      notes.push("Optimized for single-page format");
    }
    
    notes.push(`Selected ${selectedContent.experience?.length || 0} experiences`);
    notes.push(`Included ${selectedContent.skills?.length || 0} skill categories`);
    
    return notes.join(". ");
  }
}
