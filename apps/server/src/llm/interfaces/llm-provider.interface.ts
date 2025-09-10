export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type JobAnalysisResult = {
  title: string;
  company: string;
  location?: string;
  description: string;
  requirements: string[];
  skills: string[];
  extractedTags: string[];
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
};

export type ContentMatchResult = {
  contentId: string;
  score: number;
  reasons: string[];
  suggestions?: string[];
};

export type CVTailoringResult = {
  // New complete resume approach
  optimizedResumeData?: Record<string, unknown>; // Complete resume JSON structure
  changesSummary?: string; // Brief summary for resume notes

  // Legacy fields (for backwards compatibility)
  adjustedSummary?: string;
  skillsToAdd?: string[];
  skillsToRemove?: string[];
  experienceAdjustments?: {
    contentId: string;
    adjustedTitle?: string;
    adjustedDescription?: string;
    keywordsToEmphasize?: string[];
  }[];
  sectionRecommendations?: {
    section: string;
    action: string;
    reasoning: string;
  }[];
  overallFitScore: number;
  suggestions?: string[];
};

export type LLMResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

// Web search types
export type WebSearchOptions = {
  maxSearches?: number;
  temperature?: number;
  maxTokens?: number;
  domainAllowList?: string[];
  domainBlockList?: string[];
};

export type WebSearchResult = {
  success: boolean;
  data?: {
    query: string;
    results: string;
    citations: string[];
    searchCount: number;
    timestamp: string;
    structuredData?: Record<string, unknown>; // For structured data returned by researchCompany
  };
  error?: string;
};

export type LLMProvider = {
  readonly name: string;
  readonly model: string;
  readonly supportsWebSearch?: boolean;

  // Core chat functionality
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>>;

  // Web search functionality (optional - only for providers that support it)
  webSearch?(query: string, options?: WebSearchOptions): Promise<WebSearchResult>;
  researchCompany?(companyName: string, options?: WebSearchOptions): Promise<WebSearchResult>;

  // Specialized methods for our use cases
  analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>>;

  matchContent(
    jobRequirements: string[],
    userContent: Record<string, unknown>[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>>;

  generateResumeSummary(
    jobDescription: string,
    selectedContent: Record<string, unknown>[],
    userProfile: Record<string, unknown>,
  ): Promise<LLMResponse<string>>;

  generateCoverLetter(
    jobDescription: string,
    company: string,
    userProfile: Record<string, unknown>,
    selectedContent: Record<string, unknown>[],
  ): Promise<LLMResponse<string>>;

  generateInterviewQuestions(
    jobDescription: string,
    userContent: Record<string, unknown>[],
  ): Promise<LLMResponse<string[]>>;

  // New method for CV tailoring
  tailorResumeContent(
    jobDescription: string,
    jobRequirements: string[],
    currentResumeData: Record<string, unknown>,
  ): Promise<LLMResponse<CVTailoringResult>>;
};

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  stopSequences?: string[];
  // Web search options
  enableWebSearch?: boolean;
  maxWebSearchUses?: number;
};

export enum LLMProviderType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  LOCAL = "local",
  OLLAMA = "ollama",
}
