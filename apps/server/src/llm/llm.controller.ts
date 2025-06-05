import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { ChatMessage } from "./interfaces/llm-provider.interface";
import { LLMService } from "./llm.service";

// TODO: Re-enable authentication when adding back user management
// import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";

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

@ApiTags("LLM")
@Controller("llm")
// TODO: Re-enable authentication when adding back user management
// @UseGuards(TwoFactorGuard)
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Get("provider")
  @ApiOperation({ summary: "Get current LLM provider information" })
  getProviderInfo() {
    return this.llmService.getProviderInfo();
  }

  @Post("analyze-job")
  @ApiOperation({ summary: "Analyze job posting and extract structured data" })
  async analyzeJobPosting(@Body() body: AnalyzeJobRequest) {
    return this.llmService.analyzeJobPosting(body.jobText);
  }

  @Post("match-content")
  @ApiOperation({ summary: "Match user content to job requirements" })
  async matchContent(@Body() body: MatchContentRequest) {
    return this.llmService.matchContentToJob(
      body.jobRequirements,
      body.userContent,
      body.jobDescription,
    );
  }

  @Post("generate-resume-summary")
  @ApiOperation({ summary: "Generate tailored resume summary" })
  async generateResumeSummary(@Body() body: GenerateResumeSummaryRequest) {
    return this.llmService.generateResumeSummary(
      body.jobDescription,
      body.selectedContent,
      body.userProfile,
    );
  }

  @Post("generate-cover-letter")
  @ApiOperation({ summary: "Generate personalized cover letter" })
  async generateCoverLetter(@Body() body: GenerateCoverLetterRequest) {
    return this.llmService.generateCoverLetter(
      body.jobDescription,
      body.company,
      body.userProfile,
      body.selectedContent,
    );
  }

  @Post("generate-interview-questions")
  @ApiOperation({ summary: "Generate interview practice questions" })
  async generateInterviewQuestions(@Body() body: GenerateInterviewQuestionsRequest) {
    return this.llmService.generateInterviewQuestions(body.jobDescription, body.userContent);
  }

  @Post("chat")
  @ApiOperation({ summary: "General purpose chat interface" })
  async chat(@Body() body: ChatRequest) {
    return this.llmService.chat(body.messages);
  }
}
