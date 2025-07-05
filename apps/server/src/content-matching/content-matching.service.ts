import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { EmbeddingService } from "@/server/embedding/embedding.service";
import { TagExtractionService } from "@/server/llm/tag-extraction.service";

export interface ContentMatchResult {
  contentId: string;
  score: number;
  reasons: string[];
  suggestions: string[];
  vectorSimilarity?: number;
  tagSimilarity?: number;
}

export interface MatchingOptions {
  useVectorSimilarity?: boolean;
  useTagMatching?: boolean;
  vectorWeight?: number;
  tagWeight?: number;
  minSimilarity?: number;
  maxResults?: number;
}

@Injectable()
export class ContentMatchingService {
  private readonly logger = new Logger(ContentMatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentLibraryService: ContentLibraryService,
    private readonly embeddingService: EmbeddingService,
    private readonly tagExtractionService: TagExtractionService,
  ) {}

  /**
   * Match content to job requirements using hybrid approach (vector + tags)
   */
  async matchContentToJob(
    userId: string,
    jobRequirements: string[],
    jobDescription: string,
    options: MatchingOptions = {}
  ): Promise<ContentMatchResult[]> {
    const {
      useVectorSimilarity = true,
      useTagMatching = true,
      vectorWeight = 0.7,
      tagWeight = 0.3,
      minSimilarity = 0.0,
      maxResults = 50,
    } = options;

    this.logger.log(`Matching content for user ${userId} with hybrid approach (vector: ${useVectorSimilarity}, tags: ${useTagMatching})`);

    try {
      // Get all user content
      const allUserContent = await this.contentLibraryService.findAll(userId);
      
      if (allUserContent.length === 0) {
        this.logger.warn(`No content found for user ${userId}`);
        return [];
      }

      let results: ContentMatchResult[] = [];

      if (useVectorSimilarity && this.embeddingService.getStatus().available) {
        // Vector similarity matching
        const vectorResults = await this.matchByVectorSimilarity(
          jobRequirements,
          jobDescription,
          allUserContent,
          maxResults
        );
        results = vectorResults;
        this.logger.log(`Vector similarity found ${vectorResults.length} matches`);
      }

      if (useTagMatching) {
        // Tag-based matching
        const tagResults = await this.matchByTags(
          userId,
          jobRequirements,
          jobDescription,
          allUserContent
        );
        this.logger.log(`Tag matching found ${tagResults.length} matches`);

        if (results.length > 0) {
          // Combine vector and tag results
          results = this.combineResults(results, tagResults, vectorWeight, tagWeight);
        } else {
          // Use only tag results if vector matching failed
          results = tagResults;
        }
      }

      // Filter by minimum similarity and limit results
      const filteredResults = results
        .filter(result => result.score >= minSimilarity)
        .slice(0, maxResults);

      this.logger.log(`Final matching results: ${filteredResults.length} items (min similarity: ${minSimilarity})`);
      return filteredResults;

    } catch (error) {
      this.logger.error(`Content matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Match content using vector similarity
   */
  private async matchByVectorSimilarity(
    jobRequirements: string[],
    jobDescription: string,
    userContent: any[],
    maxResults: number
  ): Promise<ContentMatchResult[]> {
    try {
      // Create job text for embedding
      const jobText = this.createJobEmbeddingText(jobRequirements, jobDescription);
      
      // Generate job embedding
      const jobEmbeddingResult = await this.embeddingService.generateEmbedding(jobText);
      
      // Get content with embeddings
      const contentWithEmbeddings = userContent.filter(content => content.embedding);
      
      if (contentWithEmbeddings.length === 0) {
        this.logger.warn("No content has embeddings available for vector similarity");
        return [];
      }

      // Prepare candidate embeddings
      const candidateEmbeddings = contentWithEmbeddings.map(content => ({
        id: content.id,
        embedding: this.embeddingService.parseEmbedding(content.embedding),
        metadata: content,
      }));

      // Find most similar content
      const similarContent = this.embeddingService.findMostSimilar(
        jobEmbeddingResult.embedding,
        candidateEmbeddings,
        maxResults,
        0.1 // Minimum similarity threshold
      );

      // Convert to ContentMatchResult format
      return similarContent.map(item => ({
        contentId: item.id,
        score: Math.round(item.similarity * 100), // Convert to 0-100 scale
        vectorSimilarity: item.similarity,
        reasons: this.generateVectorSimilarityReasons(item.similarity),
        suggestions: this.generateVectorSimilaritySuggestions(item.similarity),
      }));

    } catch (error) {
      this.logger.error(`Vector similarity matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return [];
    }
  }

  /**
   * Match content using tag-based approach
   */
  private async matchByTags(
    userId: string,
    jobRequirements: string[],
    jobDescription: string,
    userContent: any[]
  ): Promise<ContentMatchResult[]> {
    try {
      // Extract tags from job description
      const jobTags = await this.extractJobTags(jobDescription);
      
      if (jobTags.length === 0) {
        this.logger.warn("No tags extracted from job description");
        return [];
      }

      // Get content with matching tags
      const tagMatchedContent = await this.contentLibraryService.findByTags(userId, jobTags);
      
      // Score content based on tag overlap and other factors
      const scoredContent = this.scoreContentByTags(
        tagMatchedContent,
        jobTags,
        jobRequirements,
        userContent
      );

      return scoredContent;

    } catch (error) {
      this.logger.error(`Tag-based matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return [];
    }
  }

  /**
   * Combine vector and tag results with weighted scoring
   */
  private combineResults(
    vectorResults: ContentMatchResult[],
    tagResults: ContentMatchResult[],
    vectorWeight: number,
    tagWeight: number
  ): ContentMatchResult[] {
    const combinedMap = new Map<string, ContentMatchResult>();

    // Add vector results
    for (const result of vectorResults) {
      combinedMap.set(result.contentId, {
        ...result,
        score: result.score * vectorWeight,
      });
    }

    // Combine with tag results
    for (const tagResult of tagResults) {
      const existing = combinedMap.get(tagResult.contentId);
      
      if (existing) {
        // Combine scores
        const combinedScore = existing.score + (tagResult.score * tagWeight);
        combinedMap.set(tagResult.contentId, {
          ...existing,
          score: Math.min(100, combinedScore), // Cap at 100
          tagSimilarity: tagResult.score / 100,
          reasons: [...existing.reasons, ...tagResult.reasons],
          suggestions: [...existing.suggestions, ...tagResult.suggestions],
        });
      } else {
        // Add tag-only result
        combinedMap.set(tagResult.contentId, {
          ...tagResult,
          score: tagResult.score * tagWeight,
          tagSimilarity: tagResult.score / 100,
        });
      }
    }

    // Convert to array and sort by score
    return Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Extract tags from job description
   */
  private async extractJobTags(jobDescription: string): Promise<string[]> {
    try {
      const result = await this.tagExtractionService.extractJobTags(jobDescription);
      return result.tags;
    } catch (error) {
      this.logger.error(`Tag extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return [];
    }
  }

  /**
   * Score content based on tag overlap and other factors
   */
  private scoreContentByTags(
    tagMatchedContent: any[],
    jobTags: string[],
    jobRequirements: string[],
    allUserContent: any[]
  ): ContentMatchResult[] {
    const scoredContent = tagMatchedContent.map(content => {
      // Get content tags
      const contentTags = content.tags?.map((tag: any) => tag.tag.name) || [];

      // Calculate tag overlap score (0-60 points)
      const tagOverlap = this.calculateTagOverlap(jobTags, contentTags);
      const tagScore = Math.round(tagOverlap * 60);

      // Content type relevance score (0-25 points)
      const typeScore = this.calculateTypeRelevance(content.section?.key || "unknown", jobRequirements);

      // Experience/recency bonus (0-15 points)
      const experienceScore = this.calculateExperienceScore(content);

      // Total score
      const totalScore = Math.min(100, tagScore + typeScore + experienceScore);

      return {
        contentId: content.id,
        score: totalScore,
        tagSimilarity: tagOverlap,
        reasons: this.generateTagScoringReasons(tagScore, typeScore, experienceScore, contentTags, jobTags),
        suggestions: this.generateTagImprovementSuggestions(content, jobTags, contentTags, totalScore),
      };
    });

    // Also include content with no tag matches but assign low scores
    const tagMatchedIds = new Set(tagMatchedContent.map(c => c.id));
    const untaggedContent = allUserContent
      .filter(content => !tagMatchedIds.has(content.id))
      .map(content => ({
        contentId: content.id,
        score: 0,
        tagSimilarity: 0,
        reasons: ["No matching tags found"],
        suggestions: ["Add relevant tags to improve matching"],
      }));

    return [...scoredContent, ...untaggedContent];
  }

  /**
   * Calculate tag overlap percentage
   */
  private calculateTagOverlap(jobTags: string[], contentTags: string[]): number {
    if (jobTags.length === 0 || contentTags.length === 0) return 0;

    const jobTagsSet = new Set(jobTags.map(tag => tag.toLowerCase()));
    const contentTagsSet = new Set(contentTags.map(tag => tag.toLowerCase()));

    const intersection = new Set([...jobTagsSet].filter(tag => contentTagsSet.has(tag)));
    const minSetSize = Math.min(jobTagsSet.size, contentTagsSet.size);
    
    return intersection.size / minSetSize;
  }

  /**
   * Calculate content type relevance score
   */
  private calculateTypeRelevance(contentType: string, jobRequirements: string[]): number {
    const requirementText = jobRequirements.join(" ").toLowerCase();

    const typeRelevanceMap: Record<string, { keywords: string[]; score: number }> = {
      experience: {
        keywords: ["experience", "years", "worked", "led", "managed", "senior", "lead"],
        score: 25,
      },
      skills: {
        keywords: ["skill", "programming", "development", "technology", "framework"],
        score: 20,
      },
      technical_skills: {
        keywords: ["skill", "programming", "development", "technology", "framework"],
        score: 20,
      },
      projects: {
        keywords: ["project", "built", "developed", "created", "portfolio"],
        score: 18,
      },
      education: {
        keywords: ["education", "degree", "university", "bachelor", "master"],
        score: 10,
      },
      certifications: {
        keywords: ["certified", "certification", "license", "credential"],
        score: 12,
      },
    };

    const typeInfo = typeRelevanceMap[contentType];
    if (!typeInfo) return 0;

    const keywordMatches = typeInfo.keywords.filter(keyword =>
      requirementText.includes(keyword)
    ).length;

    const relevanceRatio = keywordMatches / typeInfo.keywords.length;
    return Math.round(typeInfo.score * relevanceRatio);
  }

  /**
   * Calculate experience/recency score
   */
  private calculateExperienceScore(content: any): number {
    let score = 0;

    // Recent content gets bonus points
    if (content.createdAt) {
      const monthsOld = (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld < 6) score += 5;
      else if (monthsOld < 12) score += 3;
    }

    // Work experience duration bonus
    if (content.startDate && content.section?.key === "experience") {
      const yearsExp = this.estimateYearsExperience(content);
      if (yearsExp >= 3) score += 5;
      else if (yearsExp >= 1) score += 3;
    }

    // Skills count bonus
    const skillsCount = this.parseJsonArray(content.skills).length;
    if (skillsCount >= 8) score += 3;
    else if (skillsCount >= 5) score += 2;

    // Achievements bonus
    const achievementsCount = this.parseJsonArray(content.achievements).length;
    if (achievementsCount >= 3) score += 2;

    return Math.min(15, score);
  }

  /**
   * Estimate years of experience from date ranges
   */
  private estimateYearsExperience(content: any): number {
    if (!content.startDate) return 0;

    const startDate = new Date(content.startDate);
    const endDate = content.endDate ? new Date(content.endDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

    return diffYears;
  }

  /**
   * Parse JSON array from string
   */
  private parseJsonArray(value: any): any[] {
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
   * Create job text for embedding generation
   */
  private createJobEmbeddingText(jobRequirements: string[], jobDescription: string): string {
    const requirementsText = jobRequirements.join(". ");
    const descriptionText = jobDescription.length > 500 
      ? jobDescription.substring(0, 500) + "..."
      : jobDescription;
    
    return `${descriptionText}\n\nRequirements: ${requirementsText}`;
  }

  /**
   * Generate reasons for vector similarity scores
   */
  private generateVectorSimilarityReasons(similarity: number): string[] {
    const reasons: string[] = [];
    
    if (similarity >= 0.8) {
      reasons.push("Excellent semantic match with job requirements");
    } else if (similarity >= 0.6) {
      reasons.push("Strong semantic alignment with job description");
    } else if (similarity >= 0.4) {
      reasons.push("Moderate semantic relevance to job requirements");
    } else {
      reasons.push("Limited semantic similarity to job requirements");
    }

    return reasons;
  }

  /**
   * Generate suggestions for vector similarity scores
   */
  private generateVectorSimilaritySuggestions(similarity: number): string[] {
    const suggestions: string[] = [];
    
    if (similarity >= 0.8) {
      suggestions.push("Highlight this content prominently in your resume");
    } else if (similarity >= 0.6) {
      suggestions.push("Consider emphasizing key aspects that align with the job");
    } else if (similarity >= 0.4) {
      suggestions.push("Enhance content with more job-relevant keywords and achievements");
    } else {
      suggestions.push("Consider adding more specific skills and experiences related to this job");
    }

    return suggestions;
  }

  /**
   * Generate human-readable scoring reasons for tag-based matching
   */
  private generateTagScoringReasons(
    tagScore: number,
    typeScore: number,
    experienceScore: number,
    contentTags: string[],
    jobTags: string[]
  ): string[] {
    const reasons: string[] = [];

    if (tagScore > 30) {
      const matchingTags = contentTags.filter(tag =>
        jobTags.some(jobTag => jobTag.toLowerCase() === tag.toLowerCase())
      );
      reasons.push(`Strong tag matches: ${matchingTags.slice(0, 3).join(", ")}`);
    } else if (tagScore > 15) {
      reasons.push("Some relevant tags found");
    } else {
      reasons.push("Limited tag overlap");
    }

    if (typeScore > 15) {
      reasons.push("Content type highly relevant to job requirements");
    } else if (typeScore > 8) {
      reasons.push("Content type moderately relevant");
    }

    if (experienceScore > 10) {
      reasons.push("Recent and substantial experience");
    } else if (experienceScore > 5) {
      reasons.push("Good experience level");
    }

    return reasons;
  }

  /**
   * Generate improvement suggestions for tag-based matching
   */
  private generateTagImprovementSuggestions(
    content: any,
    jobTags: string[],
    contentTags: string[],
    totalScore: number
  ): string[] {
    const suggestions: string[] = [];

    if (totalScore < 50) {
      const missingTags = jobTags.filter(jobTag =>
        !contentTags.some(contentTag => contentTag.toLowerCase() === jobTag.toLowerCase())
      );

      if (missingTags.length > 0) {
        suggestions.push(`Consider adding these relevant tags: ${missingTags.slice(0, 3).join(", ")}`);
      }

      suggestions.push("Enhance content with job-relevant keywords and skills");
    }

    if (totalScore >= 50 && totalScore < 80) {
      suggestions.push("Good match - consider emphasizing shared technologies and achievements");
    }

    if (totalScore >= 80) {
      suggestions.push("Excellent match - highlight this content prominently in your resume");
    }

    return suggestions;
  }
} 