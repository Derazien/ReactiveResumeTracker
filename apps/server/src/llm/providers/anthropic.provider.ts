import Anthropic from "@anthropic-ai/sdk";
import { Injectable, Logger } from "@nestjs/common";

import {
  ChatMessage,
  ChatOptions,
  ContentMatchResult,
  CVTailoringResult,
  JobAnalysisResult,
  LLMProvider,
  LLMResponse,
} from "../interfaces/llm-provider.interface";

// Define types for user content and profile
type UserContent = {
  id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
};

type UserProfile = {
  name: string;
  title: string;
  experience: number;
  skills: string[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: number;
  }[];
  metadata?: Record<string, unknown>;
};

// Retry configuration
type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
};

@Injectable()
export class AnthropicProvider implements LLMProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: Anthropic;

  readonly name = "anthropic";
  readonly model: string;

  // Default retry configuration
  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000, // 1 second
    maxDelay: 30_000, // 30 seconds
    backoffFactor: 2,
  };

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-3-sonnet-20240229";
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    return text.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!error) return false;

    // Check for specific error types that should be retried
    let errorMessage = "";
    let errorCode: number | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    if (typeof error === "object" && error !== null && !Array.isArray(error)) {
      const errorObj = error as { status?: number; code?: number };
      errorCode = errorObj.status ?? errorObj.code;
    }

    // Retryable HTTP status codes
    const retryableStatusCodes = [
      429, // Too Many Requests
      500, // Internal Server Error
      502, // Bad Gateway
      503, // Service Unavailable
      504, // Gateway Timeout
      529, // Overloaded (Anthropic specific)
    ];

    // Check for status codes
    if (errorCode && retryableStatusCodes.includes(errorCode)) {
      return true;
    }

    // Check for specific error messages
    const retryableMessages = [
      "overloaded",
      "rate limit",
      "timeout",
      "connection",
      "network",
      "temporary",
      "unavailable",
    ];

    return retryableMessages.some((msg) => errorMessage.toLowerCase().includes(msg.toLowerCase()));
  }

  /**
   * Calculate delay for exponential backoff with jitter
   */
  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
      this.retryConfig.maxDelay,
    );

    // Add jitter (random variation) to prevent thundering herd
    const jitter = Math.random() * 0.3 * delay;
    return Math.floor(delay + jitter);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute API call with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt - 1);
          this.logger.warn(
            `${operationName} attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1} after ${delay}ms delay`,
          );
          await this.sleep(delay);
        }

        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.retryConfig.maxRetries) {
          this.logger.error(
            `${operationName} failed after ${this.retryConfig.maxRetries + 1} attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          break;
        }

        if (!this.isRetryableError(error)) {
          this.logger.error(
            `${operationName} failed with non-retryable error: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          break;
        }

        this.logger.warn(
          `${operationName} attempt ${attempt + 1} failed (retryable): ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    throw lastError;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>> {
    try {
      this.logger.debug(`Sending chat request to Anthropic with ${messages.length} messages`);

      const result = await this.executeWithRetry(async () => {
        // Separate system message from conversation messages
        const systemMessage = messages.find((m) => m.role === "system");
        const conversationMessages = messages.filter((m) => m.role !== "system");

        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: options?.maxTokens ?? 1000,
          temperature: options?.temperature ?? 0.7,
          system: systemMessage?.content ?? "",
          messages: conversationMessages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        });

        this.logger.debug(`Received response from Anthropic: ${JSON.stringify(response, null, 2)}`);

        const content = response.content[0];
        if (content.type !== "text") {
          throw new Error("Unexpected response type from Anthropic API");
        }

        return {
          success: true,
          data: content.text,
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        };
      }, "Anthropic Chat API");

      return result;
    } catch (error) {
      this.logger.error(
        `Anthropic API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>> {
    const prompt = `
You are an expert job analyst. Analyze the following job posting and extract key information for job application purposes.

Job Posting:
${jobText}

Extract and return a JSON object with the following structure:
{
  "title": "exact job title from posting",
  "company": "company name",
  "location": "full location details (city, country, remote/hybrid/onsite status)",
  "description": "comprehensive description including: company background, role responsibilities, requirements, qualifications, benefits, salary info, team details, company culture, and any other relevant details from the posting",
  "requirements": ["key requirement 1", "key requirement 2", "key requirement 3"],
  "skills": ["skill 1", "skill 2", "skill 3"],
  "extractedTags": ["tag1", "tag2", "tag3"],
  "salaryRange": "salary range if mentioned or 'Not specified'",
  "employmentType": "full-time/part-time/contract/freelance",
  "experienceLevel": "junior/mid/senior/executive"
}

Guidelines:
- Put ALL posting details in the description field (company info, role details, requirements, benefits, culture, etc.)
- Keep requirements array simple with 5-8 key requirements only
- Keep skills array focused on 8-12 most important technical skills
- Generate 10-15 relevant lowercase tags for matching (use hyphens for multi-word tags)
- Extract exact job title as written
- Include work arrangement (remote/hybrid/onsite) in location
- Don't hallucinate information not in the posting
- If salary not mentioned, use "Not specified"

Return only the JSON object, no additional text or formatting.`;

    this.logger.debug(`Analyzing job posting with text: ${jobText.slice(0, 100)}...`);

    const response = await this.chat([
      {
        role: "system",
        content:
          "You are a precise job posting analyzer. Extract comprehensive details and return only valid JSON without any markdown formatting.",
      },
      { role: "user", content: prompt },
    ]);

    if (!response.success || !response.data) {
      this.logger.error(`Job analysis failed: ${response.error}`);
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      this.logger.debug(`Parsing job analysis result: ${response.data}`);
      const cleanedResponse = this.cleanJsonResponse(response.data);
      const parsed = JSON.parse(cleanedResponse) as JobAnalysisResult;
      return {
        success: true,
        data: parsed,
        usage: response.usage,
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse job analysis result: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        success: false,
        error: "Failed to parse job analysis result",
      };
    }
  }

  async matchContent(
    jobRequirements: string[],
    userContent: UserContent[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    const prompt = `
You are an expert resume optimizer. Match the user's content to job requirements and score relevance.

Job Requirements:
${jobRequirements.join("\n- ")}

Job Description:
${jobDescription}

User Content:
${JSON.stringify(userContent, null, 2)}

For each piece of user content, provide a match score (0-100) and explain why it's relevant.

Return a JSON array with this structure:
[
  {
    "contentId": "content_id",
    "score": 85,
    "reasons": ["reason 1", "reason 2"],
    "suggestions": ["how to improve/highlight this content"]
  }
]

Scoring criteria:
- 90-100: Perfect match, directly addresses key requirements
- 70-89: Strong relevance, matches several requirements
- 50-69: Moderate relevance, some transferable skills
- 30-49: Weak relevance, minimal connection
- 0-29: No significant relevance

Return only the JSON array, no additional text.`;

    const response = await this.chat([
      { role: "system", content: "You are a precise content matcher. Return only valid JSON." },
      { role: "user", content: prompt },
    ]);

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const parsed = JSON.parse(response.data) as ContentMatchResult[];
      return {
        success: true,
        data: parsed,
        usage: response.usage,
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse content match result",
      };
    }
  }

  async generateResumeSummary(
    jobDescription: string,
    selectedContent: UserContent[],
    userProfile: UserProfile,
  ): Promise<LLMResponse<string>> {
    const prompt = `
Create a compelling professional summary for a resume targeting this specific job.

Job Description:
${jobDescription}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Selected Experience/Content:
${JSON.stringify(selectedContent, null, 2)}

Guidelines:
- 3-4 sentences maximum
- Lead with years of experience and key expertise
- Highlight 2-3 most relevant achievements from selected content
- Use action verbs and quantify impact where possible
- Mirror key terms from job description naturally
- Professional tone, first person implied

Return only the summary text, no formatting or additional comments.`;

    return this.chat([
      {
        role: "system",
        content:
          "You are an expert resume writer specializing in ATS-optimized professional summaries.",
      },
      { role: "user", content: prompt },
    ]);
  }

  async generateCoverLetter(
    jobDescription: string,
    company: string,
    userProfile: UserProfile,
    selectedContent: UserContent[],
  ): Promise<LLMResponse<string>> {
    const prompt = `
Write a compelling cover letter for this job application.

Job Description:
${jobDescription}

Company: ${company}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Selected Experience/Content:
${JSON.stringify(selectedContent, null, 2)}

Guidelines:
- Professional business letter format
- 3-4 paragraphs maximum
- Opening: Express interest and briefly state qualifications
- Body: Highlight 2-3 most relevant experiences from selected content
- Closing: Call to action and professional sign-off
- Quantify achievements where possible
- Research-based insights about the company if possible
- Enthusiastic but professional tone

Return the complete cover letter text.`;

    return this.chat([
      {
        role: "system",
        content:
          "You are an expert cover letter writer with deep knowledge of recruitment best practices.",
      },
      { role: "user", content: prompt },
    ]);
  }

  async generateInterviewQuestions(
    jobDescription: string,
    userContent: UserContent[],
  ): Promise<LLMResponse<string[]>> {
    const prompt = `
Generate interview practice questions based on this job and the user's background.

Job Description:
${jobDescription}

User Content/Experience:
${JSON.stringify(userContent, null, 2)}

Create 10-15 interview questions covering:
- Technical skills relevant to the role
- Behavioral questions about past experiences
- Situation-specific questions for this role
- Questions that help the user practice talking about their experience

Return as a JSON array of question strings only.`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are an expert interview coach. Generate thoughtful, relevant questions.",
      },
      { role: "user", content: prompt },
    ]);

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const questions = JSON.parse(response.data) as string[];
      return {
        success: true,
        data: questions,
        usage: response.usage,
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse interview questions",
      };
    }
  }

  async tailorResumeContent(
    jobDescription: string,
    jobRequirements: string[],
    currentResumeData: any,
  ): Promise<LLMResponse<CVTailoringResult>> {
    const prompt = `
You are an expert CV optimization specialist. Instead of just suggesting changes, output the COMPLETE tailored resume in the exact JSON format provided, optimized for the job.

Job Description:
${jobDescription}

Job Requirements:
${jobRequirements.join("\n- ")}

Current Resume Data:
${JSON.stringify(currentResumeData, null, 2)}

CRITICAL ONE-PAGE OPTIMIZATION INSTRUCTIONS:
- This resume MUST fit on exactly ONE PAGE
- The LLM should determine optimal number of experiences (2-3 are ideal, preferably 3 if space allows)
- If using only 2 experiences, prioritize the most relevant ones and mention space optimization in changesSummary
- Summary must be 1-2 short sentences maximum
- All sections must be concise and optimized for single-page layout
- Prioritize: most relevant experiences, key technical skills, education, certifications, projects

CRITICAL FORMATTING REQUIREMENTS FOR EXPERIENCE, PROJECTS, AND VOLUNTEER SECTIONS:
- Experience, Projects, and Volunteer sections MUST use clean HTML bullet point formatting
- Each achievement/description should be formatted as: <li>Key result in <strong>bold</strong> followed by supporting details</li>
- Use <strong> tags to highlight quantifiable achievements, key skills, and important results
- Example format: <li>Increased team productivity by <strong>25%</strong> through implementation of automated testing</li>
- Keep bullet points concise but impactful
- Do NOT apply this formatting to other sections (education, skills, etc.)

CRITICAL REQUIREMENTS: Return the COMPLETE resume JSON structure with all optimizations applied. You MUST:
1. Keep resume to 1 PAGE maximum (limit content strategically)
2. Optimize section order for job relevance
3. Enhance descriptions with job-relevant keywords
4. Add/modify skills to match job requirements
5. Improve professional summary for job fit, only 2 lines maximum with information given from existing summaries. 1 line max for the immigration or highlighted status, 1 line max for catchy experience description.
6. Maintain original JSON structure exactly - especially metadata.layout
7. Do not create new Projects or rename their names, only a small addition or tweak to the titles, and tailor the summary of the projectto highlight the most relevant skills and experiences for the job.
8. Do not create new Experiences, you may tweak the titles slightly, and tailor the summary of the experience to highlight the most relevant skills and experiences for the job. No need to add the job title to the summary 
9. For basics.headline make sure it's relevent to the job description but relative to the user's experience, you may add 2 titles seperated by a "|" for example "Lead Software Engineer | Full Stack Developer".

CRITICAL: PRESERVE METADATA LAYOUT STRUCTURE EXACTLY as provided. The metadata.layout field is a 3-level nested array: [pages][columns][sections]. Do NOT change this structure - it MUST remain as:
layout: [
  [
    ["array", "of", "section", "names", "for", "left", "column"],
    ["array", "of", "section", "names", "for", "right", "column"]
  ]
]

Return the complete optimized resume as a JSON object with this structure:
{
  "optimizedResumeData": { 
    "basics": { ... keep all basic fields ... },
    "sections": { ... all optimized sections ... },
    "metadata": { 
      "layout": [ /* MUST keep exact 3-level array structure */ ],
      "template": "keep original",
      "css": { ... keep original ... },
      "page": { ... keep original ... },
      "theme": { ... keep original ... },
      "typography": { ... keep original ... },
      "notes": "your optimized content notes"
    }
  },
  "changesSummary": "Brief summary of key changes made for resume notes",
  "overallFitScore": 85
}

Guidelines for 1-page optimization:
- Prioritize most relevant experiences (limit to 2-3 work experiences)
- Keep project descriptions concise but impactful
- Focus on skills that match job requirements
- Remove or minimize less relevant sections
- Use bullet points effectively
- Ensure content fits on single page when printed

Return only the JSON object, no additional text.`;

    this.logger.debug(`Tailoring complete resume content for job optimization`);

    const response = await this.chat(
      [
        {
          role: "system",
          content:
            "You are a precise CV optimization expert. Return the complete optimized resume in exact JSON format with a summary of changes. Ensure 1-page layout optimization.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 8000 },
    );

    if (!response.success || !response.data) {
      this.logger.error(`Complete CV tailoring failed: ${response.error}`);
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      this.logger.debug(`Parsing complete CV tailoring result`);
      const cleanedResponse = this.cleanJsonResponse(response.data);
      const parsed = JSON.parse(cleanedResponse);

      // Transform to expected format
      const result: CVTailoringResult = {
        optimizedResumeData: parsed.optimizedResumeData,
        changesSummary: parsed.changesSummary,
        overallFitScore: parsed.overallFitScore,
        suggestions: [`Resume optimized for 1-page layout: ${parsed.changesSummary}`],
      };

      return {
        success: true,
        data: result,
        usage: response.usage,
      };
    } catch (error) {
      this.logger.error(
        `Failed to parse complete CV tailoring result: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        success: false,
        error: "Failed to parse complete CV tailoring result",
      };
    }
  }
}
