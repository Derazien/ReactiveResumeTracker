import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  ChatMessage,
  ContentMatchResult,
  JobAnalysisResult,
  LLMProvider,
  LLMProviderType,
  LLMResponse,
} from "./interfaces/llm-provider.interface";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { OpenAIProvider } from "./providers/openai.provider";

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private provider: LLMProvider;

  constructor(
    private configService: ConfigService,
    private anthropicProvider: AnthropicProvider,
    private openaiProvider: OpenAIProvider,
  ) {
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
   * Match user's content against job requirements and return scored matches
   */
  async matchContentToJob(
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    this.logger.log(`Matching ${userContent.length} content items against job requirements`);

    try {
      const result = await this.provider.matchContent(jobRequirements, userContent, jobDescription);

      if (result.success) {
        const highScores = result.data?.filter((match) => match.score >= 70).length || 0;
        this.logger.log(`Content matching complete: ${highScores} high-relevance matches found`);
      } else {
        this.logger.error(`Content matching failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      this.logger.error("Content matching error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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
}
