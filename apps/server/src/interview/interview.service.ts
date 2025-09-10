import { Injectable, Logger } from "@nestjs/common";

import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { LLMService } from "@/server/llm/llm.service";

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly contentLibraryService: ContentLibraryService,
  ) {}

  async generateInterviewQuestions(jobDescription: string, userId: string): Promise<string[]> {
    const userContent = await this.contentLibraryService.findAll(userId);
    const questionsResult = await this.llmService.generateInterviewQuestions(jobDescription, userContent);
    if (!questionsResult.success) {
      throw new Error(`Interview questions generation failed: ${questionsResult.error}`);
    }
    return questionsResult.data!;
  }

  async conductInterviewForStories(
    jobApplicationDescription: string,
    userId: string,
    companyInfo?: any,
    interviewType: "cover_letter" | "q&a" = "cover_letter",
  ): Promise<{
    interviewQuestions: string[];
    suggestedStoryTypes: string[];
    followUpQuestions: string[];
  }> {
    const result = await this.llmService.conductInterviewForStories(
      userId,
      jobApplicationDescription || "",
      companyInfo,
      interviewType,
    );

    if (result.success && result.data) {
      return {
        interviewQuestions: result.data.interviewQuestions,
        suggestedStoryTypes: result.data.suggestedStoryTypes,
        followUpQuestions: result.data.followUpQuestions,
      };
    }

    throw new Error("Failed to conduct interview");
  }
}


