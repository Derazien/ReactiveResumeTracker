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

export type LLMProvider = {
  readonly name: string;
  readonly model: string;

  // Core chat functionality
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>>;

  // Specialized methods for our use cases
  analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>>;

  matchContent(
    jobRequirements: string[],
    userContent: any[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>>;

  generateResumeSummary(
    jobDescription: string,
    selectedContent: any[],
    userProfile: any,
  ): Promise<LLMResponse<string>>;

  generateCoverLetter(
    jobDescription: string,
    company: string,
    userProfile: any,
    selectedContent: any[],
  ): Promise<LLMResponse<string>>;

  generateInterviewQuestions(
    jobDescription: string,
    userContent: any[],
  ): Promise<LLMResponse<string[]>>;
};

export type ChatOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  stopSequences?: string[];
};

export enum LLMProviderType {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GOOGLE = "google",
  LOCAL = "local",
  OLLAMA = "ollama",
}
