import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";

import { ChatMessage } from "./interfaces/llm-provider.interface";
import { LLMService } from "./llm.service";

@ApiTags("LLM")
@Controller("llm")
@UseGuards(TwoFactorGuard)
export class LLMController {
  constructor(private readonly llmService: LLMService) {}

  @Get("provider")
  @ApiOperation({ summary: "Get current LLM provider information" })
  getProviderInfo() {
    return this.llmService.getProviderInfo();
  }

  @Post("analyze-job")
  @ApiOperation({ summary: "Analyze job posting and extract structured data" })
  async analyzeJobPosting(@Body() body: { jobText: string }) {
    return this.llmService.analyzeJobPosting(body.jobText);
  }

  @Post("match-content")
  @ApiOperation({ summary: "Match user content to job requirements" })
  async matchContent(
    @Body() body: { jobRequirements: string[]; userContent: any[]; jobDescription: string },
  ) {
    return this.llmService.matchContentToJob(
      body.jobRequirements,
      body.userContent,
      body.jobDescription,
    );
  }

  @Post("generate-resume-summary")
  @ApiOperation({ summary: "Generate tailored resume summary" })
  async generateResumeSummary(
    @Body() body: { jobDescription: string; selectedContent: any[]; userProfile: any },
  ) {
    return this.llmService.generateResumeSummary(
      body.jobDescription,
      body.selectedContent,
      body.userProfile,
    );
  }

  @Post("generate-cover-letter")
  @ApiOperation({ summary: "Generate personalized cover letter" })
  async generateCoverLetter(
    @Body()
    body: {
      jobDescription: string;
      company: string;
      userProfile: any;
      selectedContent: any[];
    },
  ) {
    return this.llmService.generateCoverLetter(
      body.jobDescription,
      body.company,
      body.userProfile,
      body.selectedContent,
    );
  }

  @Post("generate-interview-questions")
  @ApiOperation({ summary: "Generate interview practice questions" })
  async generateInterviewQuestions(@Body() body: { jobDescription: string; userContent: any[] }) {
    return this.llmService.generateInterviewQuestions(body.jobDescription, body.userContent);
  }

  @Post("chat")
  @ApiOperation({ summary: "General purpose chat interface" })
  async chat(@Body() body: { messages: ChatMessage[] }) {
    return this.llmService.chat(body.messages);
  }
}
