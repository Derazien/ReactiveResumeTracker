import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { EmbeddingService } from "@/server/embedding/embedding.service";
import { TagExtractionService } from "@/server/llm/tag-extraction.service";

export type ContentMatchResult = {
  contentId: string;
  score: number;
  reasons: string[];
  suggestions: string[];
  vectorSimilarity?: number;
  tagSimilarity?: number;
};

export type StructuredContentSelection = {
  experiences: ContentMatchResult[];
  projects: ContentMatchResult[];
  interests: ContentMatchResult[];
  languages: ContentMatchResult[];
  summary: ContentMatchResult[];
  contact: ContentMatchResult[];
  skills: ContentMatchResult[];
  education: ContentMatchResult[];
  certificates: ContentMatchResult[];
  volunteer: ContentMatchResult[];
  causes: ContentMatchResult[];
};

export type MatchingOptions = {
  useVectorSimilarity?: boolean;
  useTagMatching?: boolean;
  vectorWeight?: number;
  tagWeight?: number;
  minSimilarity?: number;
  maxResults?: number;
  // New structured selection options
  maxExperiences?: number;
  maxProjects?: number;
  includeAllInterests?: boolean;
  includeAllLanguages?: boolean;
  includeAllSkills?: boolean;
  includeAllEducation?: boolean;
  includeAllCertificates?: boolean;
  includeAllVolunteer?: boolean;
  includeAllCauses?: boolean;
  // Content-type specific minimum similarity thresholds
  minSimilarityForLanguages?: number;
  minSimilarityForSkills?: number;
  minSimilarityForEducation?: number;
  minSimilarityForCertificates?: number;
  minSimilarityForInterests?: number;
  minSimilarityForVolunteer?: number;
  minSimilarityForCauses?: number;
};

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
   * Enhanced with structured content selection by type
   */
  async matchContentToJob(
    userId: string,
    jobRequirements: string[],
    jobDescription: string,
    options: MatchingOptions = {},
    jobEmbedding?: number[],
  ): Promise<ContentMatchResult[]> {
    const {
      useVectorSimilarity = false,
      useTagMatching = true,
      vectorWeight = 0.7,
      tagWeight = 0.3,
      minSimilarity = 0,
      maxResults = 50,
    } = options;

    this.logger.log(
      `Matching content for user ${userId} with hybrid approach (vector: ${useVectorSimilarity}, tags: ${useTagMatching})`,
    );

    if (!useVectorSimilarity) {
      this.logger.log(
        "⚠️ VECTOR MATCHING DISABLED - Using tag-only matching for performance testing",
      );
    }

    try {
      // Get all user content
      const allUserContent = await this.contentLibraryService.findAll(userId);

      if (allUserContent.length === 0) {
        this.logger.warn(`No content found for user ${userId}`);
        return [];
      }

      // Filter out variants and get best versions
      const filteredContent = this.filterBestContentVariants(allUserContent);
      this.logger.log(
        `Filtered ${allUserContent.length} total content items to ${filteredContent.length} best variants`,
      );

      let results: ContentMatchResult[] = [];

      if (useVectorSimilarity && this.embeddingService.getStatus().available) {
        // Vector similarity matching with optional job embedding
        const vectorResults = await this.matchByVectorSimilarity(
          jobRequirements,
          jobDescription,
          filteredContent,
          maxResults,
          jobEmbedding,
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
          filteredContent,
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
        .filter((result) => result.score >= minSimilarity)
        .slice(0, maxResults);

      this.logger.log(
        `Final matching results: ${filteredResults.length} items (min similarity: ${minSimilarity})`,
      );

      // Log all matched content with titles and IDs
      this.logMatchedContent(filteredResults, filteredContent);

      return filteredResults;
    } catch (error) {
      this.logger.error(
        `Content matching failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * NEW: Structured content selection by type with specific limits
   */
  async selectStructuredContent(
    userId: string,
    jobRequirements: string[],
    jobDescription: string,
    options: MatchingOptions = {},
    jobEmbedding?: number[],
  ): Promise<StructuredContentSelection> {
    const {
      maxExperiences = 3,
      maxProjects = 3,
      includeAllInterests = true,
      includeAllLanguages = true,
      includeAllSkills = true,
      includeAllEducation = true,
      includeAllCertificates = true,
      includeAllVolunteer = true,
      includeAllCauses = true,
      minSimilarityForLanguages = 5,
      minSimilarityForSkills = 5,
      minSimilarityForEducation = 5,
      minSimilarityForCertificates = 5,
      minSimilarityForInterests = 5,
      minSimilarityForVolunteer = 5,
      minSimilarityForCauses = 5,
    } = options;

    this.logger.log(
      `Selecting structured content for user ${userId} with limits: experiences=${maxExperiences}, projects=${maxProjects}`,
    );

    try {
      // Get all matched content first with the main threshold
      const allMatchedContent = await this.matchContentToJob(
        userId,
        jobRequirements,
        jobDescription,
        options,
        jobEmbedding,
      );

      // Get content details for section filtering
      const contentDetails = await this.getContentWithSections(
        allMatchedContent.map((c) => c.contentId),
      );

      // Group content by section type
      const groupedContent = this.groupContentBySection(contentDetails, allMatchedContent);

      // Apply structured selection rules with current job priority for experiences
      const structuredSelection: StructuredContentSelection = {
        experiences: this.selectExperienceContentWithCurrentJobPriority(
          groupedContent.experience ?? [],
          contentDetails,
          maxExperiences,
        ),
        projects: this.selectTopContent(groupedContent.projects ?? [], 3), // Max 3 projects regardless of score
        interests: this.selectTopContent(groupedContent.interests ?? [], 10), // Max 10 interests (reasonable limit)
        languages: this.selectTopContent(groupedContent.languages ?? [], 20), // Max 20 languages (very permissive)
        summary: this.selectTopContent(groupedContent.summary ?? [], 1), // Only 1 summary
        contact: this.selectTopContent(groupedContent.contact ?? [], 1), // Only 1 contact
        skills: this.selectTopContent(
          [...(groupedContent.skills ?? []), ...(groupedContent.technical_skills ?? [])],
          15,
        ), // Max 15 skill categories (both soft and technical)
        education: this.selectTopContent(groupedContent.education ?? [], 10), // Max 10 education items
        certificates: this.selectTopContent(
          [...(groupedContent.certificates ?? []), ...(groupedContent.certifications ?? [])],
          10,
        ), // Max 10 certificates
        volunteer: this.selectTopContent(groupedContent.volunteer ?? [], 5), // Max 5 volunteer experiences
        causes: this.selectTopContent(groupedContent.causes ?? [], 5), // Max 5 causes
      };

      // Log structured selection results
      this.logStructuredSelection(structuredSelection);

      return structuredSelection;
    } catch (error) {
      this.logger.error(
        `Structured content selection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * NEW: Filter out content variants and keep only the best version of each source content
   */
  private filterBestContentVariants(allContent: any[]): any[] {
    // Group content by sourceContentId
    const contentGroups = new Map<string, any[]>();

    for (const content of allContent) {
      const sourceId = content.sourceContentId || content.id;
      if (!contentGroups.has(sourceId)) {
        contentGroups.set(sourceId, []);
      }
      contentGroups.get(sourceId)!.push(content);
    }

    // For each group, select the best version
    const bestContent: any[] = [];

    for (const [sourceId, variants] of contentGroups) {
      if (variants.length === 1) {
        // Single content item (not a variant)
        bestContent.push(variants[0]);
      } else {
        // Multiple variants - select the best one
        const bestVariant = this.selectBestVariant(variants);
        bestContent.push(bestVariant);
        this.logger.debug(
          `Selected best variant for source ${sourceId}: ${bestVariant.title} (ID: ${bestVariant.id})`,
        );
      }
    }

    return bestContent;
  }

  /**
   * NEW: Select the best variant from a group of content variants
   */
  private selectBestVariant(variants: any[]): any {
    // Sort variants by quality indicators
    const sortedVariants = variants.sort((a, b) => {
      // Priority 1: Has embedding (better for RAG)
      if (a.embedding && !b.embedding) return -1;
      if (!a.embedding && b.embedding) return 1;

      // Priority 2: More recent (assumed to be better)
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;

      // Priority 3: More tags (more detailed)
      const tagsA = this.parseJsonArray(a.tags || []).length;
      const tagsB = this.parseJsonArray(b.tags || []).length;
      if (tagsA > tagsB) return -1;
      if (tagsA < tagsB) return 1;

      // Priority 4: Longer description (more detailed)
      const descA = (a.description || "").length;
      const descB = (b.description || "").length;
      if (descA > descB) return -1;
      if (descA < descB) return 1;

      return 0;
    });

    return sortedVariants[0];
  }

  /**
   * NEW: Get content details with section information
   */
  private async getContentWithSections(contentIds: string[]): Promise<any[]> {
    if (contentIds.length === 0) return [];

    return await this.prisma.content.findMany({
      where: { id: { in: contentIds } },
      include: {
        section: true,
        tags: {
          include: { tag: true },
        },
      },
    });
  }

  /**
   * NEW: Group content by section type
   */
  private groupContentBySection(
    contentDetails: any[],
    matchedResults: ContentMatchResult[],
  ): Record<string, ContentMatchResult[]> {
    const grouped: Record<string, ContentMatchResult[]> = {};

    // Create a map of contentId to matched result
    const resultMap = new Map(matchedResults.map((r) => [r.contentId, r]));

    for (const content of contentDetails) {
      const sectionKey = content.section?.key || "unknown";
      const matchedResult = resultMap.get(content.id);

      if (matchedResult) {
        if (!grouped[sectionKey]) {
          grouped[sectionKey] = [];
        }
        grouped[sectionKey].push(matchedResult);
      }
    }

    return grouped;
  }

  /**
   * NEW: Select top N content items by score
   */
  private selectTopContent(
    contentList: ContentMatchResult[],
    maxCount: number,
  ): ContentMatchResult[] {
    // For now, use default sorting since we need content data to determine current jobs
    // The current job priority is handled in the experience scoring logic
    return contentList.sort((a, b) => b.score - a.score).slice(0, maxCount);
  }

  /**
   * Select experience content with guaranteed current job inclusion
   */
  private selectExperienceContentWithCurrentJobPriority(
    contentList: ContentMatchResult[],
    contentDetails: any[],
    maxCount: number,
  ): ContentMatchResult[] {
    // Create a map of content details for easy lookup
    const contentMap = new Map(contentDetails.map((content) => [content.id, content]));

    // Separate current jobs from past jobs
    const currentJobs = contentList.filter((item) => {
      const content = contentMap.get(item.contentId);
      return content && this.isCurrentJob(content);
    });
    const pastJobs = contentList.filter((item) => {
      const content = contentMap.get(item.contentId);
      return content && !this.isCurrentJob(content);
    });

    // Sort both lists by score
    const sortedCurrentJobs = currentJobs.sort((a, b) => b.score - a.score);
    const sortedPastJobs = pastJobs.sort((a, b) => b.score - a.score);

    // Ensure at least 1 current job is included if available
    let result: ContentMatchResult[] = [];

    if (sortedCurrentJobs.length > 0) {
      // Include the best current job
      result.push(sortedCurrentJobs[0]);

      // Fill remaining slots with best overall jobs (current or past)
      const remainingSlots = maxCount - 1;
      const allJobs = [...sortedCurrentJobs.slice(1), ...sortedPastJobs];
      const bestRemaining = allJobs.slice(0, remainingSlots);

      result.push(...bestRemaining);

      this.logger.log(
        `Experience selection: ${sortedCurrentJobs.length} current jobs, ${sortedPastJobs.length} past jobs. Selected ${result.length} total.`,
      );
    } else {
      // No current jobs, use best past jobs
      result = sortedPastJobs.slice(0, maxCount);
      this.logger.log(
        `Experience selection: No current jobs found. Selected ${result.length} past jobs.`,
      );
    }

    return result;
  }

  /**
   * NEW: Log all matched content with titles and IDs
   */
  private logMatchedContent(matchedResults: ContentMatchResult[], allContent: any[]): void {
    const contentMap = new Map(allContent.map((c) => [c.id, c]));

    this.logger.log(`=== MATCHED CONTENT SUMMARY ===`);
    this.logger.log(`Total matched items: ${matchedResults.length}`);

    for (const result of matchedResults) {
      const content = contentMap.get(result.contentId);
      const title = content?.title || "Unknown";
      const section = content?.section?.key || "unknown";

      this.logger.log(
        `[${result.score}/100] ${title} (ID: ${result.contentId}, Section: ${section})`,
      );
      if (result.reasons.length > 0) {
        this.logger.log(`  Reasons: ${result.reasons.join(", ")}`);
      }
    }
    this.logger.log(`=== END MATCHED CONTENT SUMMARY ===`);
  }

  /**
   * NEW: Log structured selection results
   */
  private logStructuredSelection(selection: StructuredContentSelection): void {
    this.logger.log(`=== STRUCTURED CONTENT SELECTION ===`);
    this.logger.log(`Experiences: ${selection.experiences.length} items`);
    this.logger.log(`Projects: ${selection.projects.length} items`);
    this.logger.log(`Interests: ${selection.interests.length} items`);
    this.logger.log(`Languages: ${selection.languages.length} items`);
    this.logger.log(`Summary: ${selection.summary.length} items`);
    this.logger.log(`Contact: ${selection.contact.length} items`);
    this.logger.log(`Skills: ${selection.skills.length} items`);
    this.logger.log(`Education: ${selection.education.length} items`);
    this.logger.log(`Certificates: ${selection.certificates.length} items`);
    this.logger.log(`Volunteer: ${selection.volunteer.length} items`);
    this.logger.log(`Causes: ${selection.causes.length} items`);
    this.logger.log(`=== END STRUCTURED SELECTION ===`);
  }

  /**
   * Match content using vector similarity
   */
  private async matchByVectorSimilarity(
    jobRequirements: string[],
    jobDescription: string,
    userContent: any[],
    maxResults: number,
    jobEmbedding?: number[],
  ): Promise<ContentMatchResult[]> {
    try {
      let queryEmbedding: number[];

      if (jobEmbedding) {
        // Use provided job embedding
        queryEmbedding = jobEmbedding;
        this.logger.log("Using provided job embedding for vector similarity");
      } else {
        // Generate job embedding from job text
        const jobText = this.createJobEmbeddingText(jobRequirements, jobDescription);
        const jobEmbeddingResult = await this.embeddingService.generateEmbedding(jobText);
        queryEmbedding = jobEmbeddingResult.embedding;
        this.logger.log("Generated new job embedding for vector similarity");
      }

      // Get content with embeddings
      const contentWithEmbeddings = userContent.filter((content) => content.embedding);

      if (contentWithEmbeddings.length === 0) {
        this.logger.warn("No content has embeddings available for vector similarity");
        return [];
      }

      // Prepare candidate embeddings
      const candidateEmbeddings = contentWithEmbeddings.map((content) => ({
        id: content.id,
        embedding: this.embeddingService.parseEmbedding(content.embedding),
        metadata: content,
      }));

      // Find most similar content
      const similarContent = this.embeddingService.findMostSimilar(
        queryEmbedding,
        candidateEmbeddings,
        maxResults,
        0.1, // Minimum similarity threshold
      );

      // Convert to ContentMatchResult format
      return similarContent.map((item) => ({
        contentId: item.id,
        score: Math.round(item.similarity * 100), // Convert to 0-100 scale
        vectorSimilarity: item.similarity,
        reasons: this.generateVectorSimilarityReasons(item.similarity),
        suggestions: this.generateVectorSimilaritySuggestions(item.similarity),
      }));
    } catch (error) {
      this.logger.error(
        `Vector similarity matching failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
    userContent: any[],
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
        userContent,
      );

      return scoredContent;
    } catch (error) {
      this.logger.error(
        `Tag-based matching failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
    tagWeight: number,
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
    return [...combinedMap.values()].sort((a, b) => b.score - a.score);
  }

  /**
   * Extract tags from job description
   */
  private async extractJobTags(jobDescription: string): Promise<string[]> {
    try {
      const result = await this.tagExtractionService.extractJobTags(jobDescription);
      return result.tags;
    } catch (error) {
      this.logger.error(
        `Tag extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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
    allUserContent: any[],
  ): ContentMatchResult[] {
    const scoredContent = tagMatchedContent.map((content) => {
      // Get content tags
      const contentTags = content.tags?.map((tag: any) => tag.tag.name) || [];

      // Calculate tag overlap score (0-60 points)
      const tagOverlap = this.calculateTagOverlap(jobTags, contentTags);
      const tagScore = Math.round(tagOverlap * 60);

      // Content type relevance score (0-25 points)
      const typeScore = this.calculateTypeRelevance(
        content.section?.key || "unknown",
        jobRequirements,
      );

      // Experience/recency bonus (0-15 points)
      const experienceScore = this.calculateExperienceScore(content);

      // Total score
      const totalScore = Math.min(100, tagScore + typeScore + experienceScore);

      return {
        contentId: content.id,
        score: totalScore,
        tagSimilarity: tagOverlap,
        reasons: this.generateTagScoringReasons(
          tagScore,
          typeScore,
          experienceScore,
          contentTags,
          jobTags,
        ),
        suggestions: this.generateTagImprovementSuggestions(
          content,
          jobTags,
          contentTags,
          totalScore,
        ),
      };
    });

    // Also include content with no tag matches but assign low scores
    const tagMatchedIds = new Set(tagMatchedContent.map((c) => c.id));
    const untaggedContent = allUserContent
      .filter((content) => !tagMatchedIds.has(content.id))
      .map((content) => ({
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

    const jobTagsSet = new Set(jobTags.map((tag) => tag.toLowerCase()));
    const contentTagsSet = new Set(contentTags.map((tag) => tag.toLowerCase()));

    const intersection = new Set([...jobTagsSet].filter((tag) => contentTagsSet.has(tag)));
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

    const keywordMatches = typeInfo.keywords.filter((keyword) =>
      requirementText.includes(keyword),
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
      const monthsOld =
        (Date.now() - new Date(content.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsOld < 6) score += 5;
      else if (monthsOld < 12) score += 3;
    }

    // Job recency bonus (when the job itself was held)
    if (content.startDate && content.section?.key === "experience") {
      const jobRecency = this.calculateJobRecency(content);
      if (jobRecency < 1)
        score += 8; // Very recent job
      else if (jobRecency < 3)
        score += 5; // Recent job
      else if (jobRecency < 5) score += 3; // Moderately recent
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

    return Math.min(50, score); // Increased max score to accommodate current job bonus
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
   * Check if a job is current (ongoing position)
   */
  private isCurrentJob(content: any): boolean {
    // Check for "current" keyword in date field (temporary solution)
    if (content.date && typeof content.date === "string") {
      return content.date.toLowerCase().includes("current");
    }

    // Check for null/undefined endDate (current position)
    if (content.endDate === null || content.endDate === undefined) {
      return true;
    }

    // Check if endDate is in the future or very recent (within 1 month)
    if (content.endDate) {
      const endDate = new Date(content.endDate);
      const now = new Date();
      const diffTime = now.getTime() - endDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 30; // Within 30 days
    }

    return false;
  }

  /**
   * Calculate how recent a job is (in years)
   */
  private calculateJobRecency(content: any): number {
    if (!content.startDate) return 999; // Very old if no start date

    const startDate = new Date(content.startDate);
    const endDate = content.endDate ? new Date(content.endDate) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);

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
    const descriptionText =
      jobDescription.length > 500 ? jobDescription.slice(0, 500) + "..." : jobDescription;

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
    jobTags: string[],
  ): string[] {
    const reasons: string[] = [];

    if (tagScore > 30) {
      const matchingTags = contentTags.filter((tag) =>
        jobTags.some((jobTag) => jobTag.toLowerCase() === tag.toLowerCase()),
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
    totalScore: number,
  ): string[] {
    const suggestions: string[] = [];

    if (totalScore < 50) {
      const missingTags = jobTags.filter(
        (jobTag) =>
          !contentTags.some((contentTag) => contentTag.toLowerCase() === jobTag.toLowerCase()),
      );

      if (missingTags.length > 0) {
        suggestions.push(
          `Consider adding these relevant tags: ${missingTags.slice(0, 3).join(", ")}`,
        );
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
