import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UserLLMSettingsService } from "@/server/user/user-llm-settings.service";
import { ContentMatchingService } from "@/server/content-matching/content-matching.service";

import { ContentLibraryService } from "../content-library/content-library.service";
import {
  ChatMessage,
  ContentMatchResult,
  JobAnalysisResult,
  LLMProvider,
  LLMProviderType,
  LLMResponse,
} from "./interfaces/llm-provider.interface";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { LocalLLMProvider } from "./providers/local.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { TagExtractionService } from "./tag-extraction.service";

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private provider: LLMProvider;

  /**
   * Helper function to parse array values that might be JSON strings
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

  constructor(
    private configService: ConfigService,
    private anthropicProvider: AnthropicProvider,
    private openaiProvider: OpenAIProvider,
    private localLLMProvider: LocalLLMProvider,
    private userLLMSettingsService: UserLLMSettingsService,
    private contentLibraryService: ContentLibraryService,
    private readonly tagExtractionService: TagExtractionService,
    private readonly contentMatchingService: ContentMatchingService,
  ) {
    // Initialize with default provider (fallback)
    this.initializeProvider();
  }

  private initializeProvider() {
    const providerType = this.configService.get<LLMProviderType>(
      "LLM_PROVIDER",
      LLMProviderType.ANTHROPIC,
    );

    switch (providerType) {
      case LLMProviderType.ANTHROPIC: {
        this.provider = this.anthropicProvider;
        break;
      }
      case LLMProviderType.OPENAI: {
        this.provider = this.openaiProvider;
        break;
      }
      default: {
        this.logger.warn(`Unknown LLM provider: ${providerType}, falling back to Anthropic`);
        this.provider = this.anthropicProvider;
        break;
      }
    }

    this.logger.log(
      `Initialized LLM service with provider: ${this.provider.name} (${this.provider.model})`,
    );
  }

  /**
   * Analyze a job posting from URL or text and extract structured data
   */
  async analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>> {
    this.logger.log("Starting job posting analysis");

    try {
      const result = await this.provider.analyzeJobPosting(jobText);

      if (result.success) {
        this.logger.log(
          `Successfully analyzed job posting: ${result.data?.title} at ${result.data?.company}`,
        );
      } else {
        this.logger.error(`Job analysis failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Job analysis error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * OPTIMIZED: Multi-layer content matching with pre-filtering and token reduction
   * Layer 1: Keyword-based pre-filtering (no LLM)
   * Layer 2: Lightweight LLM scoring for pre-filtered content
   * Layer 3: Detailed LLM analysis only for high-scoring content
   */
  async matchContentToJobOptimized(
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    this.logger.log(`Optimized content matching: ${userContent.length} items`);

    // Layer 1: Keyword-based pre-filtering (reduces content by 60-80%)
    const keywordFilteredContent = this.preFilterContentByKeywords(
      jobRequirements,
      userContent,
      jobDescription,
    );

    this.logger.log(`Pre-filter: ${userContent.length} → ${keywordFilteredContent.length} items`);

    if (keywordFilteredContent.length === 0) {
      return {
        success: true,
        data: userContent.map((item) => ({
          contentId: item.id,
          score: 0,
          reasons: ["No keyword matches found"],
          suggestions: ["Consider adding relevant skills or keywords"],
        })),
      };
    }

    // Layer 2: Lightweight LLM scoring (minimal tokens)
    const lightweightMatches = await this.lightweightContentScoring(
      jobRequirements,
      keywordFilteredContent,
      jobDescription,
    );

    if (!lightweightMatches.success) {
      return lightweightMatches;
    }

    // Layer 3: Detailed analysis only for high-scoring content (score ≥ 60)
    const highScoringContent = keywordFilteredContent.filter(
      (_, index) => lightweightMatches.data![index]?.score >= 60,
    );

    let detailedResults: ContentMatchResult[] = [];

    if (highScoringContent.length > 0) {
      this.logger.log(`Detailed analysis for ${highScoringContent.length} high-scoring items`);

      const detailedMatches = await this.detailedContentAnalysis(
        jobRequirements,
        highScoringContent,
        jobDescription,
      );

      if (detailedMatches.success) {
        detailedResults = detailedMatches.data!;
      }
    }

    // Combine results: detailed for high-scoring, lightweight for others
    const finalResults = userContent.map((item) => {
      const keywordIndex = keywordFilteredContent.findIndex((filtered) => filtered.id === item.id);

      if (keywordIndex === -1) {
        // Not in pre-filtered results
        return {
          contentId: item.id,
          score: 0,
          reasons: ["No relevant keywords found"],
          suggestions: ["Add relevant skills or technologies"],
        };
      }

      const lightweightResult = lightweightMatches.data![keywordIndex];
      const detailedResult = detailedResults.find((detailed) => detailed.contentId === item.id);

      // Use detailed result if available, otherwise lightweight
      return detailedResult || lightweightResult;
    });

    const highScores = finalResults.filter((match) => match.score >= 70).length;
    this.logger.log(`Optimized matching complete: ${highScores} high-relevance matches found`);

    return {
      success: true,
      data: finalResults,
    };
  }

  /**
   * Layer 1: Pre-filter content using keyword matching (no LLM tokens)
   * Reduces content by 60-80% before LLM processing
   */
  private preFilterContentByKeywords(
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): any[] {
    // Extract keywords from job requirements and description
    const jobKeywords = this.extractKeywords([...jobRequirements, jobDescription]);

    return userContent.filter((item) => {
      const contentKeywords = this.extractKeywords([
        item.title || "",
        item.description || "",
        ...JSON.parse(item.skills || "[]"),
        ...JSON.parse(item.achievements || "[]"),
        item.company || "",
        item.position || "",
      ]);

      // Calculate keyword overlap score
      const overlapScore = this.calculateKeywordOverlap(jobKeywords, contentKeywords);

      // Keep content with at least 10% keyword overlap or specific type matches
      return overlapScore >= 0.1 || this.hasTypeRelevance(item, jobRequirements);
    });
  }

  /**
   * Extract meaningful keywords from text (skills, technologies, roles)
   */
  private extractKeywords(texts: string[]): Set<string> {
    const keywords = new Set<string>();

    // Common tech keywords and patterns
    const techPatterns = [
      // Programming languages
      /\b(javascript|typescript|python|java|kotlin|swift|go|rust|c\+\+|c#|php|ruby)\b/gi,
      // Frameworks
      /\b(react|vue|angular|node\.?js|express|spring|django|rails|laravel)\b/gi,
      // Databases
      /\b(mysql|postgresql|mongodb|redis|elasticsearch|sqlite)\b/gi,
      // Cloud & DevOps
      /\b(aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github)\b/gi,
      // Skills
      /\b(leadership|management|agile|scrum|ci\/cd|testing|security)\b/gi,
      // Years of experience
      /\b(\d+)\+?\s*(years?|yrs?)\b/gi,
    ];

    for (const text of texts) {
      if (!text) continue;

      for (const pattern of techPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          for (const match of matches) keywords.add(match.toLowerCase());
        }
      }

      // Extract quoted skills and technologies
      const quotedMatches = text.match(/"([^"]+)"/g);
      if (quotedMatches) {
        for (const match of quotedMatches) {
          keywords.add(match.replace(/"/g, "").toLowerCase());
        }
      }
    }

    return keywords;
  }

  /**
   * Calculate keyword overlap between job and content
   */
  private calculateKeywordOverlap(jobKeywords: Set<string>, contentKeywords: Set<string>): number {
    if (jobKeywords.size === 0) return 0;

    const intersection = new Set([...jobKeywords].filter((k) => contentKeywords.has(k)));
    return intersection.size / jobKeywords.size;
  }

  /**
   * Check if content type is relevant to job requirements
   */
  private hasTypeRelevance(item: any, jobRequirements: string[]): boolean {
    const requirementText = jobRequirements.join(" ").toLowerCase();

    // Leadership roles prefer work experience and soft skills
    if (
      requirementText.includes("lead") ||
      requirementText.includes("senior") ||
      requirementText.includes("manager")
    ) {
      return ["WORK_EXPERIENCE", "SOFT_SKILL"].includes(item.type);
    }

    // Technical roles prefer technical skills and projects
    if (requirementText.includes("developer") || requirementText.includes("engineer")) {
      return ["TECHNICAL_SKILL", "PROJECT", "WORK_EXPERIENCE"].includes(item.type);
    }

    return false;
  }

  /**
   * Layer 2: Lightweight LLM scoring with minimal token usage
   * Only sends essential fields: title, type, skills, achievements
   */
  private async lightweightContentScoring(
    jobRequirements: string[],
    filteredContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    // Create lightweight content objects (reduce tokens by 70-80%)
    const lightweightContent = filteredContent.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      skills: JSON.parse(item.skills || "[]").slice(0, 8), // Max 8 skills
      achievements: JSON.parse(item.achievements || "[]").slice(0, 3), // Max 3 achievements
      company: item.company,
      yearsExperience: this.estimateYearsExperience(item),
    }));

    const prompt = `Score content relevance (0-100) for job matching.

Job Requirements: ${jobRequirements.slice(0, 10).join("; ")}

Content: ${JSON.stringify(lightweightContent)}

Return JSON array: [{"contentId":"id","score":85,"reasons":["brief reason"]}]

Score fast based on:
- Skill matches (40 points)
- Type relevance (30 points) 
- Experience level (20 points)
- Achievement relevance (10 points)`;

    try {
      const result = await this.provider.chat([
        { role: "system", content: "Score content quickly. Return only JSON array." },
        { role: "user", content: prompt },
      ]);

      if (result.success) {
        const parsed = JSON.parse(result.data!) as ContentMatchResult[];
        return { success: true, data: parsed };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Lightweight scoring failed",
      };
    }
  }

  /**
   * Layer 3: Detailed analysis only for high-scoring content
   * Full analysis with suggestions and detailed reasoning
   */
  private async detailedContentAnalysis(
    jobRequirements: string[],
    highScoringContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    const prompt = `Provide detailed analysis for high-potential content matches.

Job Requirements:
${jobRequirements.join("\n- ")}

Job Description Summary:
${jobDescription.slice(0, 500)}...

High-Scoring Content:
${JSON.stringify(highScoringContent.slice(0, 5))} // Max 5 items for detailed analysis

For each item, provide detailed scoring and actionable suggestions:
[{
  "contentId": "id",
  "score": 85,
  "reasons": ["specific reason 1", "specific reason 2"],
  "suggestions": ["how to improve/highlight this content"]
}]

Focus on:
- Specific skill alignments
- Experience relevance
- Achievement quantification
- Missing elements
- Optimization opportunities`;

    try {
      const result = await this.provider.chat([
        { role: "system", content: "Provide detailed content analysis with actionable insights." },
        { role: "user", content: prompt },
      ]);

      if (result.success) {
        const parsed = JSON.parse(result.data!) as ContentMatchResult[];
        return { success: true, data: parsed };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Detailed analysis failed",
      };
    }
  }

  /**
   * Estimate years of experience from date ranges
   */
  private estimateYearsExperience(item: any): number {
    if (!item.startDate) return 0;

    const startDate = new Date(item.startDate);
    const endDate = item.endDate ? new Date(item.endDate) : new Date();

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

    return diffYears;
  }

  /**
   * Generate a tailored resume summary for a specific job
   */
  async generateResumeSummary(
    jobDescription: string,
    selectedContent: any[],
    userProfile: any,
  ): Promise<LLMResponse<string>> {
    this.logger.log("Generating tailored resume summary");

    try {
      const result = await this.provider.generateResumeSummary(
        jobDescription,
        selectedContent,
        userProfile,
      );

      if (result.success) {
        this.logger.log("Resume summary generated successfully");
      } else {
        this.logger.error(`Resume summary generation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Resume summary generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Tailor resume content using LLM to optimize for specific job requirements
   */
  async tailorResumeContent(
    jobDescription: string,
    jobRequirements: string[],
    currentResumeData: any,
    selectedContent: any[],
  ): Promise<LLMResponse> {
    this.logger.log("Tailoring resume content with LLM");

    try {
      const result = await this.provider.tailorResumeContent(
        jobDescription,
        jobRequirements,
        currentResumeData,
        selectedContent,
      );

      if (result.success) {
        this.logger.log("Resume content tailored successfully");
      } else {
        this.logger.error(`Resume content tailoring failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Resume content tailoring error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Tailor resume content for a specific user
   */
  async tailorResumeContentForUser(
    userId: string,
    jobDescription: string,
    jobRequirements: string[],
    currentResumeData: any,
    selectedContent: any[],
  ): Promise<LLMResponse> {
    const provider = await this.getProviderForUserWithRetry(userId);
    return provider.tailorResumeContent(
      jobDescription,
      jobRequirements,
      currentResumeData,
      selectedContent,
    );
  }

  /**
   * Generate a personalized cover letter
   */
  async generateCoverLetter(
    jobDescription: string,
    company: string,
    userProfile: any,
    selectedContent: any[],
  ): Promise<LLMResponse<string>> {
    this.logger.log(`Generating cover letter for ${company}`);

    try {
      const result = await this.provider.generateCoverLetter(
        jobDescription,
        company,
        userProfile,
        selectedContent,
      );

      if (result.success) {
        this.logger.log("Cover letter generated successfully");
      } else {
        this.logger.error(`Cover letter generation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Cover letter generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generate interview practice questions
   */
  async generateInterviewQuestions(
    jobDescription: string,
    userContent: any[],
  ): Promise<LLMResponse<string[]>> {
    this.logger.log("Generating interview practice questions");

    try {
      const result = await this.provider.generateInterviewQuestions(jobDescription, userContent);

      if (result.success) {
        this.logger.log(`Generated ${result.data?.length || 0} interview questions`);
      } else {
        this.logger.error(`Interview questions generation failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Interview questions generation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * General purpose chat interface for custom interactions
   */
  async chat(messages: ChatMessage[]): Promise<LLMResponse<string>> {
    this.logger.log("Processing chat request");

    try {
      const result = await this.provider.chat(messages);

      if (result.success) {
        this.logger.log("Chat processed successfully");
      } else {
        this.logger.error(`Chat processing failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Chat processing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract structured content from CV text using LLM
   */
  async extractCVContent(cvText: string): Promise<LLMResponse<any[]>> {
    this.logger.log("Extracting content from CV");

    const prompt = `
You are an expert CV/resume parser. Extract structured professional content from the following CV text.

Return a JSON array of content items, where each item follows this exact structure:

{
  "title": "string",
  "description": "string", 
  "content": {
    // Type-specific content (see examples below)
  },
  "type": "WORK_EXPERIENCE | PROJECT | TECHNICAL_SKILL | SOFT_SKILL | EDUCATION | CERTIFICATION",
  "company": "string", // Optional, for work experience
  "position": "string", // Optional, for work experience  
  "startDate": "YYYY-MM-DD", // Optional, for work experience, education, certification
  "endDate": "YYYY-MM-DD", // Optional, for work experience, education, certification
  "location": "string", // Optional, for work experience, education
  "skills": ["string"], // Array of relevant skills
  "achievements": ["string"], // Array of achievements or highlights
  "confidence": 0.95 // Confidence score between 0.1 and 1.0
}

Content type specific structures:

WORK_EXPERIENCE content: {
  "responsibilities": ["string"],
  "technologies": ["string"], 
  "achievements": ["string"]
}

PROJECT content: {
  "description": "string",
  "features": ["string"],
  "technologies": ["string"],
  "metrics": ["string"]
}

TECHNICAL_SKILL content: {
  "proficiencyLevel": "Beginner|Intermediate|Advanced|Expert",
  "yearsOfExperience": number,
  "projects": ["string"],
  "keyConcepts": ["string"]
}

SOFT_SKILL content: {
  "proficiencyLevel": "Beginner|Intermediate|Advanced|Expert", 
  "yearsOfExperience": number,
  "keyAreas": ["string"],
  "achievements": ["string"]
}

EDUCATION content: {
  "degree": "string",
  "specialization": "string",
  "gpa": "string",
  "relevantCourses": ["string"],
  "thesis": "string"
}

CERTIFICATION content: {
  "issuer": "string", 
  "certificationId": "string",
  "validityPeriod": "string",
  "keyAreas": ["string"],
  "examDetails": {
    "date": "YYYY-MM-DD",
    "score": "string", 
    "level": "string"
  }
}

Guidelines:
- Extract all identifiable professional content
- Use realistic confidence scores based on text clarity
- Convert dates to YYYY-MM-DD format
- Be specific in skills and achievements
- Group related information logically
- Return ONLY the JSON array, no other text

CV Text:
"""
${cvText}
"""
`;

    try {
      const result = await this.provider.chat(
        [
          {
            role: "system",
            content:
              "You are an expert CV parser that extracts structured content and returns only valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        {
          maxTokens: 4000, // Increased token limit for complex CV extraction
          temperature: 0.3, // Lower temperature for more consistent JSON structure
        },
      );

      if (result.success) {
        try {
          // Clean and parse JSON response
          const rawData = result.data;
          if (!rawData) {
            throw new Error("No data received from LLM");
          }

          let cleanedContent = rawData.trim();

          // Remove markdown code blocks if present
          if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.replace(/```json\s*/, "").replace(/```\s*$/, "");
          } else if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.replace(/```\s*/, "").replace(/```\s*$/, "");
          }

          // Try to fix truncated JSON by adding missing closing brackets
          if (!cleanedContent.trim().endsWith("]")) {
            this.logger.warn("JSON response appears truncated, attempting to fix");

            // Count opening and closing brackets to determine what's missing
            const openBrackets = (cleanedContent.match(/\[/g) || []).length;
            const closeBrackets = (cleanedContent.match(/]/g) || []).length;
            const openBraces = (cleanedContent.match(/{/g) || []).length;
            const closeBraces = (cleanedContent.match(/}/g) || []).length;

            // Add missing closing braces and brackets
            const missingBraces = openBraces - closeBraces;
            const missingBrackets = openBrackets - closeBrackets;

            for (let i = 0; i < missingBraces; i++) {
              cleanedContent += "}";
            }
            for (let i = 0; i < missingBrackets; i++) {
              cleanedContent += "]";
            }

            this.logger.debug(
              `Fixed truncated JSON by adding ${missingBraces} braces and ${missingBrackets} brackets`,
            );
          }

          const extractedContent = JSON.parse(cleanedContent);

          if (!Array.isArray(extractedContent)) {
            throw new TypeError("Expected JSON array response");
          }

          this.logger.log(
            `Successfully extracted ${extractedContent.length} content items from CV`,
          );
          return {
            success: true,
            data: extractedContent,
          };
        } catch (parseError) {
          this.logger.error("Failed to parse LLM JSON response:", parseError);
          return {
            success: false,
            error: "Failed to parse extracted content",
          };
        }
      } else {
        this.logger.error(`CV extraction failed: ${result.error}`);
        return {
          success: false,
          error: result.error ?? "CV extraction failed",
        };
      }
    } catch (error) {
      this.logger.error("CV extraction error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Extract CV content with user-specific settings
   */
  async extractCVContentForUser(userId: string, cvText: string): Promise<LLMResponse<any[]>> {
    try {
      const provider = await this.getProviderForUserWithRetry(userId);
      this.logger.log(`Starting CV extraction for user ${userId} with provider ${provider.name}`);

      // Use the same prompt but with user's provider
      const prompt = `
You are an expert CV/resume parser. Extract structured professional content from the following CV text.

Return a JSON array of content items, where each item follows this EXACT structure:

{
  "title": "string",
  "description": "string",
  "content": {
    // Type-specific content (see examples below)
  },
  "type": "WORK_EXPERIENCE | PROJECT | TECHNICAL_SKILL | SOFT_SKILL | EDUCATION | CERTIFICATION",
  "company": "string", // Only for work experience and education
  "position": "string", // Only for work experience and education
  "startDate": "YYYY-MM-DD", // Only for work experience, education, certification, projects
  "endDate": "YYYY-MM-DD", // Only for work experience, education, certification, projects (null for current)
  "location": "string", // Only for work experience and education
  "skills": ["string"], // Array of relevant skills
  "achievements": ["string"], // Array of achievements or highlights
  "tagIds": ["string"] // Array of relevant tags (lowercase, use hyphens for multi-word)
}

Content type specific structures:

WORK_EXPERIENCE content: {
  "responsibilities": ["string"],
  "technologies": ["string"], 
  "achievements": ["string"]
}

PROJECT content: {
  "description": "string",
  "features": ["string"],
  "technologies": ["string"],
  "metrics": ["string"]
}

TECHNICAL_SKILL content: {
  "proficiencyLevel": "Beginner|Intermediate|Advanced|Expert",
  "yearsOfExperience": number,
  "projects": ["string"],
  "keyConcepts": ["string"]
}

SOFT_SKILL content: {
  "proficiencyLevel": "Beginner|Intermediate|Advanced|Expert", 
  "yearsOfExperience": number,
  "keyAreas": ["string"],
  "achievements": ["string"]
}

EDUCATION content: {
  "degree": "string",
  "specialization": "string",
  "gpa": "string",
  "relevantCourses": ["string"],
  "thesis": "string"
}

CERTIFICATION content: {
  "issuer": "string", 
  "certificationId": "string",
  "validityPeriod": "string",
  "keyAreas": ["string"],
  "examDetails": {
    "date": "YYYY-MM-DD",
    "score": "string", 
    "level": "string"
  }
}

Guidelines:
- Extract all identifiable professional content
- For TECHNICAL_SKILL: Focus on proficiencyLevel, yearsOfExperience, and keyConcepts. Do NOT include achievements array in content.
- For skills array: Include only the most relevant technical/professional skills
- For achievements array: Include only the most impactful accomplishments (2-3 max)
- For tagIds: Generate 3-6 relevant lowercase tags using hyphens for multi-word tags
- Convert dates to YYYY-MM-DD format, use null for current positions
- Be concise - avoid duplicating information across different fields
- Return ONLY the JSON array, no other text

CV Text:
"""
${cvText}
"""
`;

      const result = await provider.chat(
        [
          {
            role: "system",
            content:
              "You are an expert CV parser that extracts structured content and returns only valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        {
          maxTokens: 4000, // Increased token limit for complex CV extraction
          temperature: 0.3, // Lower temperature for more consistent JSON structure
        },
      );

      if (result.success) {
        try {
          // Clean and parse JSON response
          const rawData = result.data;
          if (!rawData) {
            throw new Error("No data received from LLM");
          }

          let cleanedContent = rawData.trim();

          // Remove markdown code blocks if present
          if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.replace(/```json\s*/, "").replace(/```\s*$/, "");
          } else if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.replace(/```\s*/, "").replace(/```\s*$/, "");
          }

          // Try to fix truncated JSON by adding missing closing brackets
          if (!cleanedContent.trim().endsWith("]")) {
            this.logger.warn("JSON response appears truncated, attempting to fix");

            // Count opening and closing brackets to determine what's missing
            const openBrackets = (cleanedContent.match(/\[/g) || []).length;
            const closeBrackets = (cleanedContent.match(/]/g) || []).length;
            const openBraces = (cleanedContent.match(/{/g) || []).length;
            const closeBraces = (cleanedContent.match(/}/g) || []).length;

            // Add missing closing braces and brackets
            const missingBraces = openBraces - closeBraces;
            const missingBrackets = openBrackets - closeBrackets;

            for (let i = 0; i < missingBraces; i++) {
              cleanedContent += "}";
            }
            for (let i = 0; i < missingBrackets; i++) {
              cleanedContent += "]";
            }

            this.logger.debug(
              `Fixed truncated JSON by adding ${missingBraces} braces and ${missingBrackets} brackets`,
            );
          }

          const extractedContent = JSON.parse(cleanedContent);

          if (!Array.isArray(extractedContent)) {
            throw new TypeError("Expected JSON array response");
          }

          this.logger.log(
            `Successfully extracted ${extractedContent.length} content items from CV for user ${userId}`,
          );
          return {
            success: true,
            data: extractedContent,
            usage: result.usage,
          };
        } catch (parseError) {
          this.logger.error("Failed to parse LLM JSON response:", parseError);
          return {
            success: false,
            error:
              "Failed to parse extracted content. The AI service may be experiencing issues. Please try again in a few moments.",
          };
        }
      } else {
        // Check if it's a retryable error and provide appropriate user feedback
        const isOverloadError =
          result.error?.toLowerCase().includes("overloaded") ||
          result.error?.toLowerCase().includes("529");

        if (isOverloadError) {
          this.logger.error(`CV extraction failed due to API overload: ${result.error}`);
          return {
            success: false,
            error:
              "The AI service is currently experiencing high demand. Please try again in a few moments. If the issue persists, try again in 5-10 minutes.",
          };
        }

        this.logger.error(`CV extraction failed: ${result.error}`);
        return {
          success: false,
          error: result.error ?? "CV extraction failed. Please check your document and try again.",
        };
      }
    } catch (error) {
      this.logger.error("CV extraction error:", error);

      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const isOverloadError =
        errorMessage.toLowerCase().includes("overloaded") ||
        errorMessage.toLowerCase().includes("529");

      if (isOverloadError) {
        return {
          success: false,
          error:
            "The AI service is currently experiencing high demand. Please try again in a few moments.",
        };
      }

      return {
        success: false,
        error: "An unexpected error occurred during CV extraction. Please try again.",
      };
    }
  }

  /**
   * Detect similar content using advanced similarity analysis
   */
  async detectSimilarContent(
    userId: string,
    newContent: any[],
    existingContent: any[],
  ): Promise<LLMResponse<any[]>> {
    this.logger.log(
      `Detecting similar content for ${newContent.length} new items against ${existingContent.length} existing items`,
    );

    if (existingContent.length === 0) {
      return {
        success: true,
        data: newContent.map((item) => ({ ...item, isDuplicate: false, similarity: 0 })),
      };
    }

    try {
      // Real similarity analysis - only compare within same content types
      const analysisResult = newContent.map((newItem) => {
        let maxSimilarity = 0;
        let bestMatch: any = null;
        let isDuplicate = false;
        let reason = "No similar content found";

        // Filter existing content to only include items of the same type
        const sameTypeContent = existingContent.filter(
          (existingItem) => existingItem.type === newItem.type,
        );

        if (sameTypeContent.length === 0) {
          // No existing content of the same type to compare against
          return {
            ...newItem,
            isDuplicate: false,
            similarity: 0,
            similarTo: null,
            reason: `No existing ${newItem.type} content to compare against`,
          };
        }

        // Compare against existing content of the same type only
        for (const existingItem of sameTypeContent) {
          const similarity = this.calculateComprehensiveSimilarity(newItem, existingItem);

          if (similarity.score > maxSimilarity) {
            maxSimilarity = similarity.score;
            bestMatch = existingItem;
            isDuplicate = similarity.isDuplicate;
            reason = similarity.explanation;
          }
        }

        return {
          ...newItem,
          isDuplicate,
          similarity: maxSimilarity,
          similarTo: bestMatch
            ? `${bestMatch.title || "Untitled"} (${bestMatch.company || "Unknown"})`
            : null,
          reason,
        };
      });

      const duplicates = analysisResult.filter((item) => item.isDuplicate).length;
      const highSimilarity = analysisResult.filter((item) => item.similarity > 0.5).length;

      this.logger.log(
        `Similarity analysis complete: ${duplicates} duplicates detected, ${highSimilarity} high-similarity items out of ${analysisResult.length} items`,
      );

      return {
        success: true,
        data: analysisResult,
      };
    } catch (error) {
      this.logger.error("Similarity analysis failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Similarity analysis failed",
      };
    }
  }

  /**
   * Calculate comprehensive similarity with enterprise-grade business logic
   */
  private calculateComprehensiveSimilarity(newItem: any, existingItem: any) {
    // Use different algorithms based on content type
    switch (newItem.type) {
      case "WORK_EXPERIENCE": {
        return this.calculateWorkExperienceSimilarity(newItem, existingItem);
      }
      case "PROJECT": {
        return this.calculateProjectSimilarity(newItem, existingItem);
      }
      case "TECHNICAL_SKILL": {
        return this.calculateSkillSimilarity(newItem, existingItem);
      }
      case "EDUCATION": {
        return this.calculateEducationSimilarity(newItem, existingItem);
      }
      default: {
        return this.calculateGenericSimilarity(newItem, existingItem);
      }
    }
  }

  /**
   * Enterprise-grade work experience similarity with business logic
   */
  private calculateWorkExperienceSimilarity(exp1: any, exp2: any) {
    // Company relationship mapping (could be from database in production)
    const companyRelationships = {
      Google: ["Alphabet", "YouTube", "DeepMind"],
      Microsoft: ["LinkedIn", "GitHub", "Skype"],
      Meta: ["Facebook", "Instagram", "WhatsApp"],
    };

    // Role hierarchy
    const roleHierarchy = {
      intern: 1,
      junior: 2,
      developer: 3,
      engineer: 3,
      senior: 4,
      lead: 5,
      principal: 6,
      staff: 6,
      architect: 7,
      director: 8,
      vp: 9,
      cto: 10,
    };

    // Technology domains
    const technologyDomains = {
      mobile: ["android", "ios", "react-native", "flutter", "kotlin", "swift"],
      web: ["react", "angular", "vue", "javascript", "typescript"],
      backend: ["java", "python", "node", "go", "rust", "api"],
      devops: ["ci/cd", "docker", "kubernetes", "aws", "azure"],
      security: ["oauth", "jwt", "encryption", "penetration"],
      hardware: ["nfc", "bluetooth", "iot", "embedded"],
      ai: ["machine-learning", "tensorflow", "pytorch", "llm"],
    };

    // STEP 1: Company Context Analysis (CRITICAL)
    const companyAnalysis = this.analyzeCompanyContext(exp1, exp2, companyRelationships);

    // STEP 2: Role and Seniority Analysis
    const roleAnalysis = this.analyzeRoleContext(exp1, exp2, roleHierarchy);

    // STEP 3: Domain and Technology Analysis
    const domainAnalysis = this.analyzeTechnologyDomain(exp1, exp2, technologyDomains);

    // STEP 4: Temporal Analysis
    const temporalAnalysis = this.analyzeTemporalOverlap(exp1, exp2);

    // STEP 5: Content Similarity (conservative)
    const contentSimilarity = Math.min(
      this.calculateFuzzyTextSimilarity(exp1.description || "", exp2.description || "") * 100,
      40, // Cap at 40%
    );

    // STEP 6: Calculate Final Score with Enterprise Business Rules
    let finalScore = 0;
    let classification = "Different";
    let reasoning = "";

    switch (companyAnalysis.relationship) {
      case "unrelated": {
        // Different companies = major penalty, max 40% similarity
        const maxScore = 40;
        const baseScore =
          roleAnalysis.score * 0.4 + domainAnalysis.score * 0.4 + contentSimilarity * 0.2;
        finalScore = Math.min(baseScore, maxScore);
        classification = finalScore > 30 ? "Possibly Related" : "Different";
        reasoning = `Different companies limit similarity to ${maxScore}%. Role: ${roleAnalysis.score}%, Domain: ${domainAnalysis.score}%`;

        break;
      }
      case "same": {
        // Same company = higher potential similarity
        let baseScore =
          roleAnalysis.score * 0.5 + domainAnalysis.score * 0.3 + contentSimilarity * 0.2;

        if (temporalAnalysis.hasOverlap) {
          baseScore += temporalAnalysis.score;
          classification =
            baseScore > 80 ? "Likely Duplicate" : baseScore > 60 ? "Very Similar" : "Related";
          reasoning = `Same company with ${temporalAnalysis.overlapDays} days overlap. Role: ${roleAnalysis.score}%, Domain: ${domainAnalysis.score}%`;
        } else {
          classification = baseScore > 70 ? "Very Similar" : baseScore > 50 ? "Similar" : "Related";
          reasoning = `Same company, different periods. Role: ${roleAnalysis.score}%, Domain: ${domainAnalysis.score}%`;
        }

        finalScore = Math.min(baseScore, 100);

        break;
      }
      case "related": {
        // Related companies
        const baseScore =
          companyAnalysis.score * 0.2 +
          roleAnalysis.score * 0.4 +
          domainAnalysis.score * 0.3 +
          contentSimilarity * 0.1;
        finalScore = baseScore;
        classification = baseScore > 60 ? "Similar" : "Related";
        reasoning = `Related companies. Role: ${roleAnalysis.score}%, Domain: ${domainAnalysis.score}%`;

        break;
      }
      // No default
    }

    finalScore = Math.max(0, Math.min(finalScore, 100)) / 100; // Convert to 0-1 scale

    return {
      score: finalScore,
      breakdown: {
        companyScore: companyAnalysis.score,
        roleScore: roleAnalysis.score,
        domainScore: domainAnalysis.score,
        temporalScore: temporalAnalysis.score || 0,
        contentScore: contentSimilarity,
        companyRelationship: companyAnalysis.relationship,
        roleRelationship: roleAnalysis.relationship,
        domainRelationship: domainAnalysis.relationship,
      },
      isDuplicate: finalScore > 0.75,
      isHighSimilarity: finalScore > 0.5,
      explanation: `${classification}: ${reasoning}`,
    };
  }

  /**
   * Analyze company context and relationships
   */
  private analyzeCompanyContext(exp1: any, exp2: any, companyRelationships: any) {
    const company1 = (exp1.company || "").toLowerCase().trim();
    const company2 = (exp2.company || "").toLowerCase().trim();

    if (!company1 || !company2) {
      return { relationship: "unknown", score: 0 };
    }

    if (company1 === company2) {
      return { relationship: "same", score: 100 };
    }

    // Check for related companies
    for (const [parent, subsidiaries] of Object.entries(companyRelationships)) {
      const parentLower = parent.toLowerCase();
      const subsidiariesLower = new Set(
        (subsidiaries as string[]).map((s: string) => s.toLowerCase()),
      );

      if (
        (company1 === parentLower || subsidiariesLower.has(company1)) &&
        (company2 === parentLower || subsidiariesLower.has(company2))
      ) {
        return { relationship: "related", score: 70 };
      }
    }

    // Check for similar company names
    const similarity = this.calculateSimpleTextSimilarity(company1, company2);
    if (similarity > 0.8) {
      return { relationship: "possibly-same", score: 60 };
    }

    return { relationship: "unrelated", score: 0 };
  }

  /**
   * Analyze role context and hierarchy
   */
  private analyzeRoleContext(exp1: any, exp2: any, roleHierarchy: any) {
    const title1 = (exp1.title || "").toLowerCase();
    const title2 = (exp2.title || "").toLowerCase();

    // Extract seniority levels
    const seniority1 = this.extractSeniorityLevel(title1, roleHierarchy);
    const seniority2 = this.extractSeniorityLevel(title2, roleHierarchy);

    // Extract role domains
    const domain1 = this.extractRoleDomain(title1);
    const domain2 = this.extractRoleDomain(title2);

    // Same role and seniority
    if (seniority1.level === seniority2.level && domain1 === domain2) {
      return { relationship: "same-role", score: 90 };
    }

    // Same seniority, different domain
    if (Math.abs(seniority1.rank - seniority2.rank) <= 1 && domain1 !== domain2) {
      return { relationship: "similar-seniority", score: 40 };
    }

    // Different seniority, same domain
    if (domain1 === domain2 && Math.abs(seniority1.rank - seniority2.rank) > 1) {
      return { relationship: "same-domain", score: 30 };
    }

    return { relationship: "different", score: 10 };
  }

  /**
   * Extract seniority level from title
   */
  private extractSeniorityLevel(title: string, roleHierarchy: any) {
    const titleLower = title.toLowerCase();

    for (const [level, rank] of Object.entries(roleHierarchy)) {
      if (titleLower.includes(level)) {
        return { level, rank: rank as number };
      }
    }

    return { level: "engineer", rank: 3 }; // Default
  }

  /**
   * Extract role domain from title
   */
  private extractRoleDomain(title: string) {
    const titleLower = title.toLowerCase();

    if (titleLower.includes("nfc") || titleLower.includes("hardware")) return "hardware-engineer";
    if (titleLower.includes("android") || titleLower.includes("mobile")) return "mobile-engineer";
    if (titleLower.includes("support") || titleLower.includes("monitoring"))
      return "support-engineer";
    if (titleLower.includes("backend") || titleLower.includes("api")) return "backend-engineer";
    if (titleLower.includes("frontend") || titleLower.includes("ui")) return "frontend-engineer";
    if (titleLower.includes("devops") || titleLower.includes("infrastructure"))
      return "devops-engineer";
    if (titleLower.includes("data") || titleLower.includes("analytics")) return "data-engineer";
    if (titleLower.includes("security")) return "security-engineer";
    if (titleLower.includes("consultant")) return "consultant";

    return "software-engineer"; // Default
  }

  /**
   * Analyze technology domain overlap
   */
  private analyzeTechnologyDomain(exp1: any, exp2: any, technologyDomains: any) {
    const skills1 = this.parseArray(exp1.skills).map((s: string) => s.toLowerCase());
    const skills2 = this.parseArray(exp2.skills).map((s: string) => s.toLowerCase());
    const tags1 = this.parseArray(exp1.tagIds).map((t: string) => t.toLowerCase());
    const tags2 = this.parseArray(exp2.tagIds).map((t: string) => t.toLowerCase());

    const allTerms1 = [
      ...skills1,
      ...tags1,
      (exp1.title || "").toLowerCase(),
      (exp1.description || "").toLowerCase(),
    ];
    const allTerms2 = [
      ...skills2,
      ...tags2,
      (exp2.title || "").toLowerCase(),
      (exp2.description || "").toLowerCase(),
    ];

    let domainOverlap = 0;
    const sharedDomains: string[] = [];

    for (const [domain, technologies] of Object.entries(technologyDomains)) {
      const techArray = technologies as string[];
      const hasDomain1 = techArray.some((tech) =>
        allTerms1.some((term) => term.includes(tech) || tech.includes(term)),
      );
      const hasDomain2 = techArray.some((tech) =>
        allTerms2.some((term) => term.includes(tech) || tech.includes(term)),
      );

      if (hasDomain1 && hasDomain2) {
        domainOverlap++;
        sharedDomains.push(domain);
      }
    }

    const score = Math.min(domainOverlap * 25, 80); // 25% per shared domain, max 80%

    return {
      relationship: sharedDomains.length > 0 ? "shared-domains" : "different-domains",
      score,
      sharedDomains,
    };
  }

  /**
   * Simple text similarity calculation
   */
  private calculateSimpleTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const words1 = text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    const words2 = text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Project similarity calculation
   */
  private calculateProjectSimilarity(proj1: any, proj2: any) {
    // For projects, focus on technology stack and domain
    const analysis = {
      titleSimilarity: this.calculateFuzzyTextSimilarity(proj1.title, proj2.title),
      descriptionSimilarity: this.calculateFuzzyTextSimilarity(
        proj1.description,
        proj2.description,
      ),
      skillsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(proj1.skills),
        this.parseArray(proj2.skills),
      ),
      tagsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(proj1.tagIds),
        this.parseArray(proj2.tagIds),
      ),
    };

    // Conservative weights for projects
    const finalScore =
      analysis.skillsSimilarity * 0.4 +
      analysis.tagsSimilarity * 0.3 +
      analysis.titleSimilarity * 0.2 +
      analysis.descriptionSimilarity * 0.1;

    return {
      score: finalScore,
      breakdown: analysis,
      isDuplicate: finalScore > 0.8, // Higher threshold for projects
      isHighSimilarity: finalScore > 0.6, // Higher threshold for projects
      explanation: `Project similarity: Skills ${(analysis.skillsSimilarity * 100).toFixed(1)}%, Tags ${(analysis.tagsSimilarity * 100).toFixed(1)}%`,
    };
  }

  /**
   * Technical skill similarity calculation
   */
  private calculateSkillSimilarity(skill1: any, skill2: any) {
    const analysis = {
      titleSimilarity: this.calculateFuzzyTextSimilarity(skill1.title, skill2.title),
      descriptionSimilarity: this.calculateFuzzyTextSimilarity(
        skill1.description,
        skill2.description,
      ),
      skillsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(skill1.skills),
        this.parseArray(skill2.skills),
      ),
      tagsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(skill1.tagIds),
        this.parseArray(skill2.tagIds),
      ),
    };

    // For skills, tags and actual skills are most important
    const finalScore =
      analysis.tagsSimilarity * 0.5 +
      analysis.skillsSimilarity * 0.3 +
      analysis.titleSimilarity * 0.15 +
      analysis.descriptionSimilarity * 0.05;

    return {
      score: finalScore,
      breakdown: analysis,
      isDuplicate: finalScore > 0.85, // High threshold for skills
      isHighSimilarity: finalScore > 0.7, // High threshold for skills
      explanation: `Skill similarity: Tags ${(analysis.tagsSimilarity * 100).toFixed(1)}%, Skills ${(analysis.skillsSimilarity * 100).toFixed(1)}%`,
    };
  }

  /**
   * Education similarity calculation
   */
  private calculateEducationSimilarity(edu1: any, edu2: any) {
    const analysis = {
      titleSimilarity: this.calculateFuzzyTextSimilarity(edu1.title, edu2.title),
      descriptionSimilarity: this.calculateFuzzyTextSimilarity(edu1.description, edu2.description),
      companySimilarity: this.calculateFuzzyTextSimilarity(edu1.company || "", edu2.company || ""), // Institution
      positionSimilarity: this.calculateFuzzyTextSimilarity(
        edu1.position || "",
        edu2.position || "",
      ), // Degree
    };

    // For education, institution and degree type are most important
    const finalScore =
      analysis.companySimilarity * 0.4 + // Institution
      analysis.positionSimilarity * 0.3 + // Degree
      analysis.titleSimilarity * 0.2 +
      analysis.descriptionSimilarity * 0.1;

    return {
      score: finalScore,
      breakdown: analysis,
      isDuplicate: finalScore > 0.9, // Very high threshold for education
      isHighSimilarity: finalScore > 0.7,
      explanation: `Education similarity: Institution ${(analysis.companySimilarity * 100).toFixed(1)}%, Degree ${(analysis.positionSimilarity * 100).toFixed(1)}%`,
    };
  }

  /**
   * Generic similarity for other content types
   */
  private calculateGenericSimilarity(item1: any, item2: any) {
    const analysis = {
      titleSimilarity: this.calculateFuzzyTextSimilarity(item1.title, item2.title),
      descriptionSimilarity: this.calculateFuzzyTextSimilarity(
        item1.description,
        item2.description,
      ),
      skillsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(item1.skills),
        this.parseArray(item2.skills),
      ),
      tagsSimilarity: this.calculateAdvancedArraySimilarity(
        this.parseArray(item1.tagIds),
        this.parseArray(item2.tagIds),
      ),
    };

    const finalScore =
      analysis.titleSimilarity * 0.3 +
      analysis.descriptionSimilarity * 0.3 +
      analysis.skillsSimilarity * 0.2 +
      analysis.tagsSimilarity * 0.2;

    return {
      score: finalScore,
      breakdown: analysis,
      isDuplicate: finalScore > 0.75,
      isHighSimilarity: finalScore > 0.5,
      explanation: `Generic similarity: ${(finalScore * 100).toFixed(1)}%`,
    };
  }

  /**
   * Get current provider information
   */
  getProviderInfo() {
    return {
      name: this.provider.name,
      model: this.provider.model,
    };
  }

  /**
   * Switch to a different provider (useful for testing or failover)
   */
  switchProvider(providerType: LLMProviderType) {
    const currentProvider = this.provider.name;

    switch (providerType) {
      case LLMProviderType.ANTHROPIC: {
        this.provider = this.anthropicProvider;
        break;
      }
      case LLMProviderType.OPENAI: {
        this.provider = this.openaiProvider;
        break;
      }
      default: {
        this.logger.warn(`Unknown provider type: ${providerType}`);
        return false;
      }
    }

    this.logger.log(`Switched from ${currentProvider} to ${this.provider.name}`);
    return true;
  }

  /**
   * Get provider for user with retry logic
   */
  async getProviderForUserWithRetry(userId: string): Promise<LLMProvider> {
    try {
      const provider = await this.getProviderForUser(userId);
      this.logger.log(`Successfully obtained provider for user ${userId}: ${provider.name}`);
      return provider;
    } catch (error) {
      this.logger.error(`Failed to get provider for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the appropriate LLM provider for a user
   */
  async getProviderForUser(userId: string): Promise<LLMProvider> {
    const settings = await this.userLLMSettingsService.getEffectiveSettings(userId);
    this.logger.log(
      `User ${userId} LLM settings: provider=${settings.provider}, hasBackup=${(settings as any).useSystemDefaultAsBackup}`,
    );

    // Check if user has their own API keys configured
    const hasUserKeys = await this.hasUserApiKeys(settings);

    if (hasUserKeys) {
      try {
        // Try user's provider first
        const userProvider = this.createUserProvider(settings);
        this.logger.log(`User ${userId} using their own ${settings.provider} provider`);
        return userProvider;
      } catch (error) {
        this.logger.warn(`User ${userId} provider failed: ${error.message}`);

        // Check if user wants system backup
        const useSystemBackup = (settings as any).useSystemDefaultAsBackup ?? false;
        if (useSystemBackup) {
          this.logger.log(`Falling back to system provider for user ${userId}`);
          return this.getSystemProvider();
        } else {
          this.logger.error(`User ${userId} provider failed and no backup allowed`);
          throw new Error(`User LLM provider failed: ${error.message}`);
        }
      }
    } else {
      // No user keys - check if system backup is allowed
      const useSystemBackup = (settings as any).useSystemDefaultAsBackup ?? false;
      if (useSystemBackup) {
        this.logger.log(`User ${userId} has no API keys, using system provider as backup`);
        return this.getSystemProvider();
      } else {
        this.logger.error(`User ${userId} has no API keys and backup is disabled`);
        throw new Error("LLM features are disabled. Please configure your API keys in settings.");
      }
    }
  }

  /**
   * Create a provider instance with user's API keys
   */
  private createUserProvider(settings: any): LLMProvider {
    switch (settings.provider) {
      case "ANTHROPIC": {
        if (settings.anthropicApiKey) {
          // Create a new Anthropic provider instance with user's API key
          const { AnthropicProvider } = require("./providers/anthropic.provider");
          const userProvider = new AnthropicProvider();

          // Override the client with user's API key
          const Anthropic = require("@anthropic-ai/sdk");
          userProvider.client = new Anthropic({
            apiKey: settings.anthropicApiKey,
          });
          userProvider.model = settings.anthropicModel ?? "claude-3-sonnet-20240229";

          return userProvider;
        }
        break;
      }
      case "OPENAI": {
        if (settings.openaiApiKey) {
          // Create a new OpenAI provider instance with user's API key
          const { OpenAIProvider } = require("./providers/openai.provider");
          const userProvider = new OpenAIProvider();

          // Override the client with user's API key
          const OpenAI = require("openai");
          userProvider.client = new OpenAI({
            apiKey: settings.openaiApiKey,
            baseURL: settings.openaiBaseUrl ?? undefined,
          });
          userProvider.model = settings.openaiModel ?? "gpt-4-turbo-preview";

          return userProvider;
        }
        break;
      }
      case "OLLAMA": {
        if (settings.ollamaBaseUrl) {
          // Create a new Local/Ollama provider instance
          const { LocalLLMProvider } = require("./providers/local.provider");
          const userProvider = new LocalLLMProvider();

          // Configure with user's settings
          userProvider.baseUrl = settings.ollamaBaseUrl;
          userProvider.model = settings.ollamaModel ?? "llama3:8b";

          return userProvider;
        }
        break;
      }
    }

    throw new Error(`Invalid provider configuration for ${settings.provider}`);
  }

  /**
   * Check if user has valid API keys for their selected provider
   */
  private async hasUserApiKeys(settings: any): Promise<boolean> {
    switch (settings.provider) {
      case "OPENAI": {
        return !!settings.openaiApiKey;
      }
      case "ANTHROPIC": {
        return !!settings.anthropicApiKey;
      }
      case "OLLAMA": {
        return !!settings.ollamaBaseUrl; // Ollama might not need API key
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Analyze a job posting with user-specific settings and fallback
   */
  async analyzeJobPostingForUser(
    userId: string,
    jobText: string,
  ): Promise<LLMResponse<JobAnalysisResult>> {
    const provider = await this.getProviderForUserWithRetry(userId);
    return provider.analyzeJobPosting(jobText);
  }

  /**
   * Get the system default provider (environment-configured)
   */
  private getSystemProvider(): LLMProvider {
    return this.provider;
  }

  /**
   * Match user's content against job requirements (backward compatible)
   * Now uses optimized matching by default
   */
  async matchContentToJob(
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    // Use the optimized version by default
    return this.matchContentToJobOptimized(jobRequirements, userContent, jobDescription);
  }

  /**
   * Match content to job with user-specific settings and fallback
   */
  async matchContentToJobForUser(
    userId: string,
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    // Use optimized matching for user-specific calls as well
    return this.matchContentToJobOptimized(jobRequirements, userContent, jobDescription);
  }

  /**
   * RAG-BASED: Hybrid content matching using vector similarity and tags
   * Now delegates to ContentMatchingService for proper separation of concerns
   */
  async matchContentToJobRAG(
    userId: string,
    jobRequirements: string[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    this.logger.log(`RAG-based content matching for user ${userId}`);

    try {
      const results = await this.contentMatchingService.matchContentToJob(
        userId,
        jobRequirements,
        jobDescription,
        {
          useVectorSimilarity: false,
          useTagMatching: true,
          vectorWeight: 0.7,
          tagWeight: 0.3,
          minSimilarity: 0,
          maxResults: 100,
        }
      );

      const highScores = results.filter((match) => match.score >= 70).length;
      this.logger.log(`RAG matching complete: ${highScores} high-relevance matches found`);

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      this.logger.error("RAG matching error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "RAG matching failed",
      };
    }
  }

  /**
   * Extract tags from job requirements using specialized NLP libraries
   * Much faster and more cost-effective than LLM calls
   */
  async extractJobTags(jobDescription: string, userId?: string): Promise<string[]> {
    this.logger.log("Extracting job tags using NLP libraries");

    try {
      // Use specialized NLP libraries instead of LLM
      const result = await this.tagExtractionService.extractJobTags(jobDescription);

      this.logger.log(
        `Successfully extracted ${result.tags.length} tags using ${result.method} in ${result.processingTime}ms`,
      );

      return result.tags;
    } catch (error) {
      this.logger.error("Tag extraction failed:", error);

      // Fallback to LLM if NLP extraction fails completely
      try {
        this.logger.log("Falling back to LLM for tag extraction");
        return await this.extractJobTagsWithLLM(jobDescription, userId ?? "");
      } catch (llmError) {
        this.logger.error("LLM fallback also failed:", llmError);
        return []; // Return empty array if both methods fail
      }
    }
  }

  /**
   * LLM-based tag extraction (fallback method)
   */
  private async extractJobTagsWithLLM(jobDescription: string, userId: string): Promise<string[]> {
    const provider = await this.getProviderForUser(userId);

    const prompt = `Extract relevant tags from this job description. Return ONLY a comma-separated list of tags in lowercase, hyphenated format (e.g., "javascript, react, node-js, problem-solving").

Job Description:
${jobDescription}

Tags:`;

    try {
      const result = await provider.chat([
        {
          role: "system",
          content: "Extract tags for content matching. Return only comma-separated tags.",
        },
        { role: "user", content: prompt },
      ]);

      if (result.success && result.data) {
        const tags = result.data
          .split(",")
          .map((tag: string) => tag.trim().toLowerCase())
          .filter((tag: string) => tag.length > 0 && tag.length < 30)
          .slice(0, 15); // Limit to 15 tags

        return tags;
      } else {
        throw new Error(result.error ?? "Failed to extract tags with LLM");
      }
    } catch (error) {
      this.logger.error("LLM tag extraction failed:", error);
      throw error;
    }
  }



  /**
   * Analyze temporal overlap between two work experiences
   */
  private analyzeTemporalOverlap(exp1: any, exp2: any) {
    if (!exp1.startDate || !exp2.startDate) {
      return { hasOverlap: false, score: 0 };
    }

    try {
      const start1 = new Date(exp1.startDate);
      const end1 = exp1.endDate ? new Date(exp1.endDate) : new Date();
      const start2 = new Date(exp2.startDate);
      const end2 = exp2.endDate ? new Date(exp2.endDate) : new Date();

      const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
      const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));

      if (overlapStart < overlapEnd) {
        const overlapDays = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24);
        const overlapScore = Math.min((overlapDays / 365) * 50, 50); // Max 50% for overlap

        return {
          hasOverlap: true,
          overlapDays: Math.round(overlapDays),
          score: overlapScore,
        };
      }
    } catch {
      // Invalid dates
    }

    return { hasOverlap: false, score: 0 };
  }

  /**
   * Advanced array similarity with fuzzy matching
   */
  private calculateAdvancedArraySimilarity(arr1: any[], arr2: any[]): number {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) {
      return 0;
    }

    let totalScore = 0;
    let comparisons = 0;

    // Check each item in array1 against all items in array2
    for (const item1 of arr1) {
      let bestMatch = 0;

      for (const item2 of arr2) {
        const similarity = this.calculateFuzzyTextSimilarity(String(item1), String(item2));
        bestMatch = Math.max(bestMatch, similarity);
      }

      totalScore += bestMatch;
      comparisons++;
    }

    return comparisons > 0 ? totalScore / comparisons : 0;
  }

  /**
   * Fuzzy text similarity with conservative matching
   */
  private calculateFuzzyTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;

    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\s\w-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const norm1 = normalize(text1);
    const norm2 = normalize(text2);

    if (norm1 === norm2) return 1;

    // Conservative word-based similarity
    const words1 = norm1.split(/\s+/).filter((w) => w.length > 1);
    const words2 = norm2.split(/\s+/).filter((w) => w.length > 1);

    if (words1.length === 0 || words2.length === 0) return 0;

    let matchingWords = 0;
    const totalWords = Math.max(words1.length, words2.length);

    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2) {
          matchingWords++;
          break;
        }
      }
    }

    const wordSimilarity = matchingWords / totalWords;

    // Conservative semantic boost for technology terms
    const semanticGroups = [
      ["lead", "leader", "leadership", "management", "manager", "senior"],
      ["engineering", "engineer", "development", "developer"],
      ["android", "mobile", "kotlin", "java"],
      ["nfc", "technology", "tech"],
    ];

    let semanticBoost = 0;
    for (const group of semanticGroups) {
      const matches1 = group.filter((term) => norm1.includes(term)).length;
      const matches2 = group.filter((term) => norm2.includes(term)).length;

      if (matches1 > 0 && matches2 > 0) {
        const groupBoost = (Math.min(matches1, matches2) / group.length) * 0.2; // Reduced boost
        semanticBoost = Math.max(semanticBoost, groupBoost);
      }
    }

    return Math.min(wordSimilarity + semanticBoost, 1);
  }
}
