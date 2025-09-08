import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

import { LLMService } from "@/server/llm/llm.service";
import { CoverLetterService } from "@/server/cover-letter/cover-letter.service";
import { CoverLetterContentService } from "@/server/cover-letter-content/cover-letter-content.service";

export interface CoverLetterToken {
  token: string;
  value: string;
}

export interface CoverLetterParagraph {
  id: string;
  type: string;
  content: string;
  theme: string;
  score?: number;
}

export interface GeneratedCoverLetter {
  content: string;
  usedParagraphs: CoverLetterParagraph[];
  tokens: CoverLetterToken[];
  themes: string[];
  fitScore: number;
}

/**
 * Service responsible for generating cover letters
 * Follows the blueprint from cover_letter_content_library.md
 * Uses token-based templates and paragraph selection
 */
@Injectable()
export class CoverLetterGenerationService {
  private readonly logger = new Logger(CoverLetterGenerationService.name);

  // Master template following the blueprint
  private readonly masterTemplate = `[FIRST NAME] [LAST NAME]
[Address]
E: [Email] | M: [Phone]
[LinkedIn]

[Date]

[Recruiter Name]
[Company Name]
[Company Address]

Application for [Role] at [Company]

Dear [Greeting],

[Intake-Sentence]

[Paragraph A]

[Paragraph B]

[Paragraph C]

[Closing-Sentence]

Sincerely,

[Your Name]`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly coverLetterService: CoverLetterService,
    private readonly coverLetterContentService: CoverLetterContentService,
  ) {}

  /**
   * Generate a tailored cover letter following the blueprint
   * Mass-production workflow from cover_letter_content_library.md
   */
  async generateTailoredCoverLetter(
    jobApplicationId: string,
    userId: string,
    options?: {
      tone?: "formal" | "casual" | "enthusiastic";
      customInstructions?: string;
      selectedParagraphIds?: string[];
    },
  ): Promise<GeneratedCoverLetter> {
    this.logger.log(`Generating tailored cover letter for job application ${jobApplicationId}`);

    // Step 1: Get job application and user data
    const { jobApplication, userData } = await this.gatherApplicationData(jobApplicationId, userId);

    // Step 2: Research themes - extract from JD & company
    const themes = await this.extractCompanyThemes(jobApplication);

    // Step 3: Select best paragraph blocks (3-5 lines each)
    const selectedParagraphs = await this.selectBestParagraphs(
      userId,
      themes,
      options?.selectedParagraphIds,
    );

    // Step 4: Prepare tokens for replacement
    const tokens = await this.prepareTokens(jobApplication, userData);

    // Step 5: Generate cover letter from template
    const coverLetter = await this.generateFromTemplate(
      tokens,
      selectedParagraphs,
      jobApplication,
      options,
    );

    // Step 6: Lexical tuning - swap synonyms to echo company language
    const tunedContent = await this.lexicalTuning(coverLetter, jobApplication);

    // Step 7: Save cover letter
    await this.saveCoverLetter(
      tunedContent,
      jobApplicationId,
      selectedParagraphs,
      options?.tone,
    );

    return {
      content: tunedContent,
      usedParagraphs: selectedParagraphs,
      tokens,
      themes,
      fitScore: this.calculateFitScore(selectedParagraphs, themes),
    };
  }

  /**
   * Extract company themes from job description
   * Maps to common themes: analytics, leadership, curiosity, tech, etc.
   */
  private async extractCompanyThemes(jobApplication: any): Promise<string[]> {
    const jobText = `${jobApplication.title} ${jobApplication.description} ${jobApplication.requirements}`;
    
    try {
      // extractCompanyThemes returns string[] directly
      const themes = await this.llmService.extractCompanyThemes(
        jobApplication.userId,
        jobText,
        { name: jobApplication.companyName }
      );

      if (themes && themes.length > 0) {
        return themes;
      }
    } catch (error) {
      this.logger.warn(`Failed to extract themes using LLM: ${error}`);
    }

    // Fallback to basic keyword extraction
    return this.extractBasicThemes(jobText);
  }

  /**
   * Select best paragraph blocks based on themes
   * From the paragraph library in content system
   */
  private async selectBestParagraphs(
    userId: string,
    themes: string[],
    selectedIds?: string[],
  ): Promise<CoverLetterParagraph[]> {
    if (selectedIds && selectedIds.length > 0) {
      // Use manually selected paragraphs
      return this.getParagraphsByIds(selectedIds);
    }

    // Map themes to paragraph types
    const paragraphTypes = this.mapThemesToParagraphTypes(themes);

    // Get available paragraphs from content library
    const availableParagraphs = await this.getAvailableParagraphs(userId);

    // Score and select top 3 paragraphs
    const scoredParagraphs = this.scoreParagraphs(availableParagraphs, themes, paragraphTypes);
    
    return scoredParagraphs.slice(0, 3);
  }

  /**
   * Map company themes to paragraph types
   * Based on blueprint: analytics, diversity, leadership, tech
   */
  private mapThemesToParagraphTypes(themes: string[]): string[] {
    const themeMapping: Record<string, string[]> = {
      analytics: ["PARAGRAPH_ANALYTICS", "PARAGRAPH_IMPACT"],
      leadership: ["PARAGRAPH_LEADERSHIP", "PARAGRAPH_COLLABORATION"],
      tech: ["PARAGRAPH_TECH", "PARAGRAPH_INNOVATION"],
      diversity: ["PARAGRAPH_DIVERSITY", "PARAGRAPH_VALUES"],
      growth: ["PARAGRAPH_GROWTH", "PARAGRAPH_CHALLENGE"],
    };

    const paragraphTypes = new Set<string>();
    
    themes.forEach(theme => {
      const mappedTypes = themeMapping[theme.toLowerCase()] || [];
      mappedTypes.forEach(type => paragraphTypes.add(type));
    });

    // Default paragraph types if no specific mapping
    if (paragraphTypes.size === 0) {
      paragraphTypes.add("PARAGRAPH_LEADERSHIP");
      paragraphTypes.add("PARAGRAPH_TECH");
      paragraphTypes.add("PARAGRAPH_IMPACT");
    }

    return Array.from(paragraphTypes);
  }

  /**
   * Prepare all tokens for template replacement
   */
  private async prepareTokens(jobApplication: any, userData: any): Promise<CoverLetterToken[]> {
    const tokens: CoverLetterToken[] = [
      { token: "[FIRST NAME]", value: userData.firstName || "" },
      { token: "[LAST NAME]", value: userData.lastName || "" },
      { token: "[Your Name]", value: `${userData.firstName} ${userData.lastName}`.trim() },
      { token: "[Email]", value: userData.email || "" },
      { token: "[Phone]", value: userData.phone || "" },
      { token: "[LinkedIn]", value: userData.linkedinUrl || "" },
      { token: "[Address]", value: userData.address || "" },
      { token: "[Date]", value: new Date().toLocaleDateString("en-US", { 
        year: "numeric",
        month: "long",
        day: "numeric",
      })},
      { token: "[Company]", value: jobApplication.companyName || "" },
      { token: "[Company Name]", value: jobApplication.companyName || "" },
      { token: "[Role]", value: jobApplication.title || "" },
      { token: "[Recruiter Name]", value: jobApplication.recruiterName || "" },
      { token: "[Company Address]", value: jobApplication.companyAddress || "" },
      { token: "[Greeting]", value: this.determineGreeting(jobApplication) },
    ];

    // Generate intake and closing sentences
    tokens.push(
      { token: "[Intake-Sentence]", value: await this.generateIntakeSentence(jobApplication) },
      { token: "[Closing-Sentence]", value: await this.generateClosingSentence(jobApplication) },
    );

    return tokens;
  }

  /**
   * Generate cover letter from template with token replacement
   */
  private async generateFromTemplate(
    tokens: CoverLetterToken[],
    paragraphs: CoverLetterParagraph[],
    jobApplication: any,
    options?: any,
  ): Promise<string> {
    let content = this.masterTemplate;

    // Replace paragraph tokens
    if (paragraphs[0]) {
      content = content.replace("[Paragraph A]", paragraphs[0].content);
    }
    if (paragraphs[1]) {
      content = content.replace("[Paragraph B]", paragraphs[1].content);
    }
    if (paragraphs[2]) {
      content = content.replace("[Paragraph C]", paragraphs[2].content);
    }

    // Replace all other tokens
    tokens.forEach(({ token, value }) => {
      content = content.replace(new RegExp(token.replace(/[[\]]/g, "\\$&"), "g"), value);
    });

    // Clean up any remaining empty tokens
    content = this.cleanupEmptyTokens(content);

    // Apply tone adjustments if specified
    if (options?.tone) {
      content = await this.adjustTone(content, options.tone);
    }

    return content;
  }

  /**
   * Lexical tuning - swap synonyms to echo company language
   */
  private async lexicalTuning(content: string, jobApplication: any): Promise<string> {
    // Extract key terms from job description
    const jobKeywords = this.extractKeywords(jobApplication.description);
    
    // Map common terms to company-specific language
    const lexicalMap = this.buildLexicalMap(jobKeywords);
    
    // Apply replacements
    let tunedContent = content;
    lexicalMap.forEach((companyTerm, genericTerm) => {
      const regex = new RegExp(`\\b${genericTerm}\\b`, "gi");
      tunedContent = tunedContent.replace(regex, companyTerm);
    });

    return tunedContent;
  }

  /**
   * Helper methods
   */
  private async gatherApplicationData(jobApplicationId: string, userId: string) {
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId },
      include: { company: true },
    });

    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const userData = {
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: "", // TODO: Add phone field to user profile
      linkedinUrl: "", // TODO: Add LinkedIn field to user profile
      address: "", // TODO: Add address field to user profile
    };

    return { jobApplication, userData };
  }

  private async getAvailableParagraphs(userId: string): Promise<CoverLetterParagraph[]> {
    const content = await this.prisma.coverLetterContent.findMany({
      where: { userId },
    });

    return content.map(c => ({
      id: c.id,
      type: c.contentType,
      content: c.storyText,
      theme: c.skillTheme,
    }));
  }

  private async getParagraphsByIds(ids: string[]): Promise<CoverLetterParagraph[]> {
    const content = await this.prisma.coverLetterContent.findMany({
      where: { id: { in: ids } },
    });

    return content.map(c => ({
      id: c.id,
      type: c.contentType,
      content: c.storyText,
      theme: c.skillTheme,
    }));
  }

  private scoreParagraphs(
    paragraphs: CoverLetterParagraph[],
    themes: string[],
    preferredTypes: string[],
  ): CoverLetterParagraph[] {
    return paragraphs
      .map(p => ({
        ...p,
        score: this.calculateParagraphScore(p, themes, preferredTypes),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private calculateParagraphScore(
    paragraph: CoverLetterParagraph,
    themes: string[],
    preferredTypes: string[],
  ): number {
    let score = 0;

    // Type preference scoring
    if (preferredTypes.includes(paragraph.type)) {
      score += 50;
    }

    // Theme matching scoring
    themes.forEach(theme => {
      if (paragraph.theme.toLowerCase().includes(theme.toLowerCase())) {
        score += 30;
      }
      if (paragraph.content.toLowerCase().includes(theme.toLowerCase())) {
        score += 20;
      }
    });

    return score;
  }

  private calculateFitScore(paragraphs: CoverLetterParagraph[], themes: string[]): number {
    const avgScore = paragraphs.reduce((sum, p) => sum + (p.score || 0), 0) / paragraphs.length;
    return Math.min(100, Math.round(avgScore * 1.2)); // Scale to 0-100
  }

  private extractBasicThemes(text: string): string[] {
    const themeKeywords = {
      analytics: ["data", "analytics", "metrics", "analysis", "insights"],
      leadership: ["lead", "manage", "team", "mentor", "coordinate"],
      tech: ["technology", "software", "development", "engineering", "technical"],
      diversity: ["diversity", "inclusion", "culture", "collaborative", "global"],
      growth: ["growth", "scale", "expand", "develop", "improve"],
    };

    const foundThemes = new Set<string>();
    const lowerText = text.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        foundThemes.add(theme);
      }
    });

    return Array.from(foundThemes);
  }

  private determineGreeting(jobApplication: any): string {
    if (jobApplication.recruiterName) {
      return `Dear ${jobApplication.recruiterName}`;
    }
    if (jobApplication.department) {
      return `Dear ${jobApplication.department} Team`;
    }
    return "Dear Hiring Manager";
  }

  private async generateIntakeSentence(jobApplication: any): Promise<string> {
    return `I am excited to apply for the ${jobApplication.title} position at ${jobApplication.companyName}, where I can contribute my expertise and passion for delivering exceptional results.`;
  }

  private async generateClosingSentence(jobApplication: any): Promise<string> {
    return `I look forward to discussing how my experience and skills can contribute to ${jobApplication.companyName}'s continued success.`;
  }

  private cleanupEmptyTokens(content: string): string {
    // Remove lines with only empty tokens
    return content
      .split("\n")
      .filter(line => !line.match(/^\[[^\]]+\]$/))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n"); // Remove excessive line breaks
  }

  private async adjustTone(content: string, tone: string): Promise<string> {
    // TODO: Implement tone adjustment using LLM
    return content;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"]);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 20);
  }

  private buildLexicalMap(keywords: string[]): Map<string, string> {
    const lexicalMap = new Map<string, string>();
    
    // Common replacements based on keywords
    if (keywords.includes("innovative")) {
      lexicalMap.set("creative", "innovative");
    }
    if (keywords.includes("collaborative")) {
      lexicalMap.set("team", "collaborative team");
    }
    // Add more mappings as needed
    
    return lexicalMap;
  }

  private async saveCoverLetter(
    content: string,
    jobApplicationId: string,
    usedParagraphs: CoverLetterParagraph[],
    tone?: string,
  ): Promise<void> {
    await this.coverLetterService.create("system", {
      content,
      jobApplicationId,
      templateName: "blueprint",
      tone: tone || "professional",
      generatedFrom: JSON.stringify(usedParagraphs.map(p => p.id)),
    });
  }
}
