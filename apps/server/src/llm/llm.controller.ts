import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { EditResumeDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { ChatMessage } from "./interfaces/llm-provider.interface";
import { LLMService } from "./llm.service";

// Types for request bodies
type AnalyzeJobRequest = {
  jobText: string;
};

type MatchContentRequest = {
  jobRequirements: string[];
  userContent: Record<string, unknown>[];
  jobDescription: string;
};

type GenerateResumeSummaryRequest = {
  jobDescription: string;
  selectedContent: Record<string, unknown>[];
  userProfile: Record<string, unknown>;
};

type GenerateCoverLetterRequest = {
  jobDescription: string;
  company: string;
  userProfile: Record<string, unknown>;
  selectedContent: Record<string, unknown>[];
};

type GenerateInterviewQuestionsRequest = {
  jobDescription: string;
  userContent: Record<string, unknown>[];
};

type ChatRequest = {
  messages: ChatMessage[];
};

type CoverLetterDraftRequest = {
  jobDescription: string;
  jobRequirements?: string[];
  templateName?: string;
  tone?: string;
  userProfile?: Record<string, unknown>;
};

type QuestionAnswerRequest = {
  questionText: string;
  jobDescription?: string;
  questionTag?: string;
};

type LLMActionRequest = {
  action: "improve" | "fix" | "tone" | "custom";
  value: string;
  mood?: "casual" | "professional" | "confident" | "friendly";
  customPrompt?: string;
  includeJobContext?: boolean;
  resumeId?: string;
};

@ApiTags("LLM")
@Controller("llm")
@UseGuards(TwoFactorGuard)
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Get("provider")
  @ApiOperation({ summary: "Get current LLM provider information" })
  getProviderInfo(@User("id") userId: string) {
    return this.llmService.getProviderInfo();
  }

  @Post("analyze-job")
  @ApiOperation({ summary: "Analyze job posting and extract structured data" })
  async analyzeJobPosting(@User("id") userId: string, @Body() body: AnalyzeJobRequest) {
    return this.llmService.analyzeJobPosting(body.jobText);
  }

  @Post("match-content")
  @ApiOperation({ summary: "Match user content to job requirements" })
  async matchContent(@User("id") userId: string, @Body() body: MatchContentRequest) {
    return this.llmService.matchContentToJob(
      body.jobRequirements,
      body.userContent,
      body.jobDescription,
    );
  }

  @Post("generate-resume-summary")
  @ApiOperation({ summary: "Generate tailored resume summary" })
  async generateResumeSummary(
    @User("id") userId: string,
    @Body() body: GenerateResumeSummaryRequest,
  ) {
    return this.llmService.generateResumeSummary(
      body.jobDescription,
      body.selectedContent,
      body.userProfile,
    );
  }

  @Post("generate-cover-letter")
  @ApiOperation({ summary: "Generate personalized cover letter" })
  async generateCoverLetter(@User("id") userId: string, @Body() body: GenerateCoverLetterRequest) {
    return this.llmService.generateCoverLetter(
      body.jobDescription,
      body.company,
      body.userProfile,
      body.selectedContent,
    );
  }

  @Post("generate-interview-questions")
  @ApiOperation({ summary: "Generate interview practice questions" })
  async generateInterviewQuestions(
    @User("id") userId: string,
    @Body() body: GenerateInterviewQuestionsRequest,
  ) {
    return this.llmService.generateInterviewQuestions(body.jobDescription, body.userContent);
  }

  @Post("chat")
  @ApiOperation({ summary: "General purpose chat interface" })
  async chat(@User("id") userId: string, @Body() body: ChatRequest) {
    return this.llmService.chat(body.messages);
  }

  @Post("cover-letter/draft")
  @ApiOperation({ summary: "Generate cover letter draft using RAG-matched stories" })
  async generateCoverLetterDraft(
    @User("id") userId: string,
    @Body() body: CoverLetterDraftRequest,
  ) {
    return this.llmService.generateCoverLetterDraft(
      userId,
      body.jobDescription,
      body.jobRequirements,
      body.templateName,
      body.tone,
      body.userProfile,
    );
  }

  @Post("question-answer/draft")
  @ApiOperation({ summary: "Generate answer to job application question using user's stories" })
  async generateQuestionAnswer(@User("id") userId: string, @Body() body: QuestionAnswerRequest) {
    return this.llmService.generateQuestionAnswer(
      userId,
      body.questionText,
      body.jobDescription,
      body.questionTag,
    );
  }

  @Post("edit-resume")
  @ApiOperation({ summary: "Edit resume using natural language prompt" })
  async editResume(@User("id") userId: string, @Body() body: EditResumeDto) {
    return this.llmService.editResume(
      userId,
      body.prompt,
      body.resumeData,
      body.includeJobContext,
      body.selectedSections,
    );
  }

  @Post("action")
  @ApiOperation({
    summary: "Perform AI-powered resume editing action (improve, fix, tone, custom)",
  })
  async processAction(@User("id") userId: string, @Body() body: LLMActionRequest) {
    const { action, value, mood, customPrompt, includeJobContext, resumeId } = body;
    try {
      const result = await this.llmService.processAction(
        userId,
        action,
        value,
        mood,
        customPrompt,
        includeJobContext,
        resumeId,
      );
      return { result };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }
}
