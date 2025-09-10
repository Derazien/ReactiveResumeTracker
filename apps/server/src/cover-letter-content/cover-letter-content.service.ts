import { Injectable, Logger } from "@nestjs/common";
import { CoverLetterContent, CoverLetterContentType } from "@prisma/client";
import { CreateCoverLetterContentDto, UpdateCoverLetterContentDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { EmbeddingService } from "@/server/embedding/embedding.service";
import { LLMService } from "@/server/llm/llm.service";
import { InterviewService } from "@/server/interview/interview.service";

@Injectable()
export class CoverLetterContentService {
  private readonly logger = new Logger(CoverLetterContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly llmService: LLMService,
    private readonly interviewService: InterviewService,
  ) {}

  /**
   * Create a new cover letter content entry
   */
  async create(
    userId: string,
    createDto: CreateCoverLetterContentDto,
  ): Promise<CoverLetterContent> {
    this.logger.debug(`Creating cover letter content for user ${userId}`);

    try {
      let contentId = createDto.contentId;

      // If no contentId provided or the contentId doesn't exist, create a Content record
      if (!contentId) {
        const contentRecord = await this.createContentForStory(userId, createDto);
        contentId = contentRecord.id;
      } else {
        // Verify the contentId exists
        const existingContent = await this.prisma.content.findFirst({
          where: { id: contentId, userId },
        });
        
        if (!existingContent) {
          // Create a Content record if the provided ID doesn't exist
          const contentRecord = await this.createContentForStory(userId, createDto);
          contentId = contentRecord.id;
        }
      }

      // Generate embedding for the story text
      const embeddingResult = await this.embeddingService.generateEmbedding(createDto.storyText);

      const coverLetterContent = await this.prisma.coverLetterContent.create({
        data: {
          contentType: createDto.contentType,
          contentId: contentId,
          storyText: createDto.storyText,
          skillTheme: createDto.skillTheme,
          tone: createDto.tone || "professional",
          tags: createDto.tags || "[]",
          embedding: this.embeddingService.serializeEmbedding(embeddingResult.embedding),
          embeddingHash: embeddingResult.hash,
          userId,
        },
        include: {
          content: true,
        },
      });

      this.logger.debug(`Cover letter content created with ID: ${coverLetterContent.id}`);
      return coverLetterContent;
    } catch (error) {
      this.logger.error(
        `Failed to create cover letter content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Create a Content record for a manual story
   */
  private async createContentForStory(userId: string, storyData: CreateCoverLetterContentDto) {
    // Ensure we have a "cover-letter-stories" section
    const storiesSection = await this.ensureStoriesSection();

    return this.prisma.content.create({
      data: {
        title: `Manual Story: ${storyData.skillTheme}`,
        description: storyData.storyText.substring(0, 200) + (storyData.storyText.length > 200 ? '...' : ''),
        sectionId: storiesSection.id,
        userId,
        data: JSON.stringify({
          storyText: storyData.storyText,
          skillTheme: storyData.skillTheme,
          contentType: storyData.contentType,
          extractedFromInterview: false,
          createdAt: new Date().toISOString(),
        }),
      },
    });
  }

  /**
   * Find all cover letter content for a user
   */
  async findAllByUser(userId: string): Promise<CoverLetterContent[]> {
    this.logger.debug(`Finding all cover letter content for user ${userId}`);

    return this.prisma.coverLetterContent.findMany({
      where: { userId },
      include: {
        content: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find cover letter content by ID
   */
  async findOne(id: string, userId: string): Promise<CoverLetterContent | null> {
    this.logger.debug(`Finding cover letter content ${id} for user ${userId}`);

    return this.prisma.coverLetterContent.findFirst({
      where: { id, userId },
      include: {
        content: true,
      },
    });
  }

  /**
   * Find cover letter content by content ID (linked to existing content)
   */
  async findByContentId(contentId: string, userId: string): Promise<CoverLetterContent[]> {
    this.logger.debug(`Finding cover letter content for content ${contentId} and user ${userId}`);

    return this.prisma.coverLetterContent.findMany({
      where: { contentId, userId },
      include: {
        content: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find cover letter content by type
   */
  async findByType(
    contentType: CoverLetterContentType,
    userId: string,
  ): Promise<CoverLetterContent[]> {
    this.logger.debug(`Finding cover letter content of type ${contentType} for user ${userId}`);

    return this.prisma.coverLetterContent.findMany({
      where: { contentType, userId },
      include: {
        content: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update cover letter content
   */
  async update(
    id: string,
    userId: string,
    updateDto: UpdateCoverLetterContentDto,
  ): Promise<CoverLetterContent> {
    this.logger.debug(`Updating cover letter content ${id} for user ${userId}`);

    try {
      const updateData: any = {};

      // Copy fields that are provided
      if (updateDto.contentType !== undefined) updateData.contentType = updateDto.contentType;
      if (updateDto.contentId !== undefined) updateData.contentId = updateDto.contentId;
      if (updateDto.storyText !== undefined) updateData.storyText = updateDto.storyText;
      if (updateDto.skillTheme !== undefined) updateData.skillTheme = updateDto.skillTheme;
      if (updateDto.tone !== undefined) updateData.tone = updateDto.tone;
      if (updateDto.tags !== undefined) updateData.tags = updateDto.tags;

      // If story text is updated, regenerate embedding
      if (updateDto.storyText) {
        const embeddingResult = await this.embeddingService.generateEmbedding(updateDto.storyText);
        updateData.embedding = this.embeddingService.serializeEmbedding(embeddingResult.embedding);
        updateData.embeddingHash = embeddingResult.hash;
      }

      const coverLetterContent = await this.prisma.coverLetterContent.update({
        where: { id, userId },
        data: updateData,
        include: {
          content: true,
        },
      });

      this.logger.debug(`Cover letter content updated: ${coverLetterContent.id}`);
      return coverLetterContent;
    } catch (error) {
      this.logger.error(
        `Failed to update cover letter content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Delete cover letter content
   */
  async delete(id: string, userId: string): Promise<void> {
    this.logger.debug(`Deleting cover letter content ${id} for user ${userId}`);

    try {
      await this.prisma.coverLetterContent.delete({
        where: { id, userId },
      });

      this.logger.debug(`Cover letter content deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete cover letter content: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Find similar stories using semantic search
   */
  async findSimilarStories(
    query: string,
    userId: string,
    limit = 10,
  ): Promise<CoverLetterContent[]> {
    this.logger.debug(`Finding similar stories for query: "${query}" for user ${userId}`);

    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Get all user's cover letter content with embeddings
      const coverLetterContents = await this.prisma.coverLetterContent.findMany({
        where: {
          userId,
          embedding: { not: null },
        },
        include: {
          content: true,
        },
      });

      // Calculate similarities
      const candidateEmbeddings = coverLetterContents.map((content) => ({
        id: content.id,
        embedding: this.embeddingService.parseEmbedding(content.embedding!),
        metadata: content,
      }));

      const similarities = this.embeddingService.findMostSimilar(
        queryEmbedding.embedding,
        candidateEmbeddings,
        limit,
        0.3, // Minimum similarity threshold
      );

      return similarities.map((result) => result.metadata);
    } catch (error) {
      this.logger.error(
        `Failed to find similar stories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Select best stories for a job application
   */
  async selectBestStoriesForJob(
    jobDescription: string,
    userId: string,
    maxStories = 3,
  ): Promise<CoverLetterContent[]> {
    this.logger.debug(`Selecting best stories for job application for user ${userId}`);

    try {
      // Find similar stories based on job description
      const similarStories = await this.findSimilarStories(jobDescription, userId, maxStories * 2);

      // Ensure diversity in story types
      const selectedStories: CoverLetterContent[] = [];
      const usedTypes = new Set<CoverLetterContentType>();

      for (const story of similarStories) {
        if (selectedStories.length >= maxStories) break;

        if (!usedTypes.has(story.contentType)) {
          selectedStories.push(story);
          usedTypes.add(story.contentType);
        }
      }

      // If we don't have enough diverse stories, add more
      if (selectedStories.length < maxStories) {
        for (const story of similarStories) {
          if (selectedStories.length >= maxStories) break;
          if (!selectedStories.find((s) => s.id === story.id)) {
            selectedStories.push(story);
          }
        }
      }

      this.logger.debug(`Selected ${selectedStories.length} stories for job application`);
      return selectedStories;
    } catch (error) {
      this.logger.error(
        `Failed to select best stories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Extract multiple stories from interview responses using LLM
   */
  async extractStoriesFromInterview(
    responses: Array<{ question: string; answer: string }>,
    userId: string,
  ): Promise<{
    success: boolean;
    stories?: CoverLetterContent[];
    error?: string;
  }> {
    this.logger.debug(`Extracting stories from interview for user ${userId}`);

    try {
      if (!responses || responses.length === 0) {
        return {
          success: false,
          error: "No interview responses provided"
        };
      }

      // Use LLM service to extract stories
      const llmResult = await this.llmService.extractStoriesFromInterview(responses);

      if (!llmResult.success || !llmResult.stories) {
        return {
          success: false,
          error: llmResult.error || "Failed to extract stories"
        };
      }

      // Ensure we have a "cover-letter-stories" section
      const storiesSection = await this.ensureStoriesSection();

      // Create cover letter content entries for the extracted stories
      const createdStories: CoverLetterContent[] = [];

      for (const story of llmResult.stories) {
        try {
          // First create a Content record for this story
          const contentRecord = await this.prisma.content.create({
            data: {
              title: `Interview Story: ${story.skillTheme}`,
              description: story.storyText.substring(0, 200) + (story.storyText.length > 200 ? '...' : ''),
              sectionId: storiesSection.id,
              userId,
              data: JSON.stringify({
                storyText: story.storyText,
                skillTheme: story.skillTheme,
                contentType: story.contentType,
                extractedFromInterview: true,
                extractedAt: new Date().toISOString(),
              }),
            },
          });

          // Generate embedding for the story text
          const embeddingResult = await this.embeddingService.generateEmbedding(story.storyText);

          // Now create the CoverLetterContent record that references the Content
          const coverLetterContent = await this.prisma.coverLetterContent.create({
            data: {
              contentType: story.contentType as CoverLetterContentType,
              contentId: contentRecord.id, // Reference the actual Content record
              storyText: story.storyText,
              skillTheme: story.skillTheme,
              tone: story.tone,
              tags: JSON.stringify(story.tags),
              embedding: this.embeddingService.serializeEmbedding(embeddingResult.embedding),
              embeddingHash: embeddingResult.hash,
              userId,
            },
            include: {
              content: true,
            },
          });

          createdStories.push(coverLetterContent);
          this.logger.debug(`Story created with ID: ${coverLetterContent.id}, Content ID: ${contentRecord.id}`);
        } catch (error) {
          this.logger.error(`Failed to create story: ${error}`);
          // Continue with other stories even if one fails
        }
      }

      return {
        success: true,
        stories: createdStories
      };

    } catch (error) {
      this.logger.error(`Error extracting stories from interview: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Ensure a "cover-letter-stories" section exists for interview-derived stories
   */
  private async ensureStoriesSection() {
    const existingSection = await this.prisma.section.findFirst({
      where: { key: "cover-letter-stories" },
    });

    if (existingSection) {
      return existingSection;
    }

    // Create the section if it doesn't exist
    return this.prisma.section.create({
      data: {
        key: "cover-letter-stories",
        name: "Cover Letter Stories",
        description: "Stories extracted from interviews for cover letter personalization",
        icon: "MessageCircle",
        schema: JSON.stringify({
          type: "object",
          properties: {
            storyText: { type: "string" },
            skillTheme: { type: "string" },
            contentType: { type: "string" },
            extractedFromInterview: { type: "boolean" },
            extractedAt: { type: "string" }
          }
        }),
        validation: JSON.stringify({}),
        order: 1000, // Place at the end
        isActive: true,
        isDefault: false,
        isCustomizable: true,
      },
    });
  }

  /**
   * Conduct interview for story extraction using job application context
   */
  async conductInterviewForJob(
    jobApplicationId: string,
    userId: string,
    interviewType: "cover_letter" | "q&a" = "cover_letter",
  ): Promise<{
    interviewQuestions: string[];
    suggestedStoryTypes: string[];
    followUpQuestions: string[];
  }> {
    this.logger.debug(`Conducting interview for job application ${jobApplicationId}`);

    // Get job application context
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId },
    });

    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get company information if available
    const companyInfo = jobApplication.companyId
      ? await this.prisma.company.findUnique({ where: { id: jobApplication.companyId } })
      : null;

    // Delegate to InterviewService
    return this.interviewService.conductInterviewForStories(
      jobApplication.description ?? "",
      userId,
      companyInfo,
      interviewType,
    );
  }

  /**
   * Generate interview questions for job application
   */
  async generateInterviewQuestionsForJob(
    jobApplicationId: string,
    userId: string,
  ): Promise<string[]> {
    this.logger.debug(`Generating interview questions for job application ${jobApplicationId}`);

    // Get job application context
    const jobApplication = await this.prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId },
    });

    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Delegate to InterviewService
    return this.interviewService.generateInterviewQuestions(
      jobApplication.description ?? "",
      userId,
    );
  }
}
