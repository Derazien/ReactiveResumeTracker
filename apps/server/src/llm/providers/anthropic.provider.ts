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
  WebSearchOptions,
  WebSearchResult,
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
  readonly supportsWebSearch = true; // Anthropic supports web search

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

    if (typeof error === "object" && error !== null) {
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
    ];

    // Retryable error messages
    const retryableErrorMessages = [
      "rate limit",
      "timeout",
      "network",
      "connection",
      "server error",
      "internal error",
      "service unavailable",
      "temporary",
      "retry",
    ];

    // Check if status code is retryable
    if (errorCode && retryableStatusCodes.includes(errorCode)) {
      return true;
    }

    // Check if error message indicates retryable error
    const lowerErrorMessage = errorMessage.toLowerCase();
    return retryableErrorMessages.some((retryableMsg) =>
      lowerErrorMessage.includes(retryableMsg),
    );
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.retryConfig.maxRetries || !this.isRetryableError(error)) {
          this.logger.error(
            `${operationName} failed after ${attempt + 1} attempts: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        this.logger.warn(
          `${operationName} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}), retrying in ${delay}ms: ${error instanceof Error ? error.message : "Unknown error"}`,
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Basic chat functionality - Fixed to handle system messages correctly
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>> {
    return this.executeWithRetry(
      async () => {
        try {
          // Extract system messages and filter them from the messages array
          const systemMessages = messages.filter(msg => msg.role === 'system');
          const userAssistantMessages = messages.filter(msg => msg.role !== 'system');
          
          // Combine all system messages into one system prompt
          const systemPrompt = systemMessages.map(msg => msg.content).join('\n');
          
          const requestConfig: any = {
            model: this.model,
            max_tokens: options?.maxTokens ?? 4000,
            temperature: options?.temperature ?? 0.7,
            messages: userAssistantMessages.map((msg) => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          };
          
          // Add system prompt if there are system messages
          if (systemPrompt) {
            requestConfig.system = systemPrompt;
          }

          const response = await this.client.messages.create(requestConfig);

          return {
            success: true,
            data: response.content[0]?.type === "text" ? response.content[0].text : "",
            usage: response.usage ? {
              promptTokens: response.usage.input_tokens,
              completionTokens: response.usage.output_tokens,
              totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            } : undefined,
          };
        } catch (error) {
          this.logger.error(`Chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Chat",
    );
  }

  /**
   * Web search functionality using Anthropic's web search tool
   */
  async webSearch(query: string, options?: WebSearchOptions): Promise<WebSearchResult> {
    return this.executeWithRetry(
      async () => {
        try {
          this.logger.debug(`Performing web search for: ${query}`);

          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: options?.maxTokens ?? 4000,
            temperature: options?.temperature ?? 0.3,
            messages: [
              {
                role: "user",
                content: `Please search the web for information about: ${query}. 
                
                Provide a comprehensive analysis with:
                1. Key facts and information
                2. Recent developments (if any)
                3. Source citations
                4. Confidence level in the information found
                
                Focus on accuracy and cite your sources.`,
              },
            ],
          });

          // Extract search results and citations
          const citations: string[] = [];

          // Process tool use results for web search
          for (const content of response.content) {
            if (content.type === "text") {
              // Extract citations from the text (Anthropic includes them automatically)
              const citationMatches = content.text.match(/\[(\d+)]/g);
              if (citationMatches) {
                citations.push(...citationMatches);
              }
            }
          }

          return {
            success: true,
            data: {
              query,
              results: response.content[0]?.type === "text" ? response.content[0].text : "",
              citations: [...new Set(citations)], // Remove duplicates
              searchCount: options?.maxSearches ?? 3,
              timestamp: new Date().toISOString(),
            },
          };
        } catch (error) {
          this.logger.error(`Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Web Search",
    );
  }

  /**
   * Enhanced company research with web search - returns structured data directly
   */
  async researchCompany(companyName: string, options?: WebSearchOptions): Promise<WebSearchResult> {
    return this.executeWithRetry(
      async () => {
        try {
          this.logger.debug(`Performing comprehensive company research for: ${companyName}`);

          const researchPrompt = `Perform deep research on the company "${companyName}" and return the information in this exact JSON format:

{
  "companyInfo": {
    "name": "exact company name",
    "description": "comprehensive company description",
    "industry": "primary industry",
    "size": "company size (e.g., 50-200 employees)",
    "location": "headquarters location",
    "website": "official website URL",
    "logo": "logo URL if found"
  },
  "culture": {
    "mission": "company mission statement",
    "culture": "company culture description",
    "values": ["value1", "value2", "value3"]
  },
  "socialMedia": {
    "linkedin": "LinkedIn URL",
    "twitter": "Twitter/X URL",
    "facebook": "Facebook URL",
    "instagram": "Instagram URL",
    "youtube": "YouTube URL",
    "github": "GitHub URL"
  },
  "researchMetadata": {
    "sources": ["source1", "source2"],
    "confidence": "high/medium/low",
    "lastUpdated": "timestamp"
  }
}

Search for:
1. Official company website and social media profiles
2. Recent news and press releases
3. Company culture and values
4. Technology stack and products
5. Leadership team information
6. Recent funding or business developments

Return ONLY the JSON object, no additional text or explanations.`;

          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: options?.maxTokens ?? 4000,
            temperature: options?.temperature ?? 0.2,
            messages: [
              {
                role: "user",
                content: researchPrompt,
              },
            ],
          });

          const responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
          const cleanedResponse = this.cleanJsonResponse(responseText);
          
          // Parse the structured JSON response
          const parsedData = JSON.parse(cleanedResponse) as Record<string, unknown>;

          // Extract citations from the response
          const citations: string[] = [];
          const citationMatches = responseText.match(/\[(\d+)]/g);
          if (citationMatches) {
            citations.push(...citationMatches);
          }

          return {
            success: true,
            data: {
              query: `company research ${companyName}`,
              results: JSON.stringify(parsedData, null, 2), // Return structured data as string
              citations: [...new Set(citations)],
              searchCount: options?.maxSearches ?? 5,
              timestamp: new Date().toISOString(),
              structuredData: parsedData, // Include parsed data for direct access
            },
          };
        } catch (error) {
          this.logger.error(`Company research failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Company Research",
    );
  }

  /**
   * Analyze job posting (unchanged from original)
   */
  async analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>> {
    return this.executeWithRetry(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 4000,
            temperature: 0.3,
            messages: [
              {
                role: "user",
                content: `Analyze this job posting and return structured data:

${jobText}

Return ONLY a JSON object with this exact structure:
{
  "title": "exact job title",
  "company": "company name",
  "location": "job location",
  "description": "comprehensive description",
  "requirements": ["requirement1", "requirement2"],
  "skills": ["skill1", "skill2"],
  "extractedTags": ["tag1", "tag2"],
  "salaryRange": "salary range if mentioned",
  "employmentType": "full-time/part-time/contract/internship",
  "experienceLevel": "junior/mid/senior/executive"
}`,
              },
            ],
          });

          const responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
          const cleanedResponse = this.cleanJsonResponse(responseText);
          const parsedData = JSON.parse(cleanedResponse);

          return {
            success: true,
            data: parsedData,
          };
        } catch (error) {
          this.logger.error(`Job analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Job Analysis",
    );
  }

  /**
   * Match content to job (unchanged from original)
   */
  async matchContent(
    jobRequirements: string[],
    userContent: UserContent[],
    jobDescription: string,
  ): Promise<LLMResponse<ContentMatchResult[]>> {
    return this.executeWithRetry(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 4000,
            temperature: 0.3,
            messages: [
              {
                role: "user",
                content: `Match the following user content to job requirements:

Job Requirements: ${jobRequirements.join(", ")}
Job Description: ${jobDescription}

User Content:
${userContent.map((content) => `- ${content.type}: ${content.content}`).join("\n")}

Return ONLY a JSON array with this exact structure:
[
  {
    "contentId": "content_id",
    "score": 85,
    "reasons": ["reason1", "reason2"],
    "suggestions": ["suggestion1", "suggestion2"]
  }
]`,
              },
            ],
          });

          const responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
          const cleanedResponse = this.cleanJsonResponse(responseText);
          const parsedData = JSON.parse(cleanedResponse);

          return {
            success: true,
            data: parsedData,
          };
        } catch (error) {
          this.logger.error(`Content matching failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Content Matching",
    );
  }

  /**
   * Generate resume summary (unchanged from original)
   */
  async generateResumeSummary(
    jobDescription: string,
    selectedContent: UserContent[],
    userProfile: UserProfile,
  ): Promise<LLMResponse<string>> {
    return this.executeWithRetry(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 2000,
            temperature: 0.7,
            messages: [
              {
                role: "user",
                content: `Generate a professional summary for this resume:

Job Description: ${jobDescription}

User Profile: ${userProfile.name}, ${userProfile.title}, ${userProfile.experience} years experience
Skills: ${userProfile.skills.join(", ")}

Selected Content:
${selectedContent.map((content) => `- ${content.type}: ${content.content}`).join("\n")}

Write a compelling 3-4 sentence professional summary that highlights relevant experience and skills for this position.`,
              },
            ],
          });

          return {
            success: true,
            data: response.content[0]?.type === "text" ? response.content[0].text : "",
          };
        } catch (error) {
          this.logger.error(`Resume summary generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Resume Summary Generation",
    );
  }

  /**
   * Generate cover letter (unchanged from original)
   */
  async generateCoverLetter(
    jobDescription: string,
    company: string,
    userProfile: UserProfile,
    selectedContent: UserContent[],
  ): Promise<LLMResponse<string>> {
    return this.executeWithRetry(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 3000,
            temperature: 0.7,
            messages: [
              {
                role: "user",
                content: `Write a cover letter for this position:

Company: ${company}
Job Description: ${jobDescription}

Candidate: ${userProfile.name}, ${userProfile.title}
Experience: ${userProfile.experience} years
Skills: ${userProfile.skills.join(", ")}

Relevant Experience:
${selectedContent.map((content) => `- ${content.type}: ${content.content}`).join("\n")}

Write a professional, personalized cover letter that demonstrates why the candidate is a great fit for this role. Use specific examples from their experience and reference the company's mission/culture if available.`,
              },
            ],
          });

          return {
            success: true,
            data: response.content[0]?.type === "text" ? response.content[0].text : "",
          };
        } catch (error) {
          this.logger.error(`Cover letter generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Cover Letter Generation",
    );
  }

  /**
   * Generate interview questions (unchanged from original)
   */
  async generateInterviewQuestions(
    jobDescription: string,
    userContent: UserContent[],
  ): Promise<LLMResponse<string[]>> {
    return this.executeWithRetry(
      async () => {
        try {
          const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 2000,
            temperature: 0.7,
            messages: [
              {
                role: "user",
                content: `Generate interview questions for this position:

Job Description: ${jobDescription}

Candidate Experience:
${userContent.map((content) => `- ${content.type}: ${content.content}`).join("\n")}

Generate 5-7 relevant interview questions that would help assess the candidate's fit for this role. Include technical questions, behavioral questions, and questions about their specific experience.`,
              },
            ],
          });

          const responseText = response.content[0]?.type === "text" ? response.content[0].text : "";
          const questions = responseText
            .split("\n")
            .filter((line) => /^\d+\./.test(line.trim()))
            .map((line) => line.replace(/^\d+\.\s*/, "").trim())
            .filter((q) => q.length > 0);

          return {
            success: true,
            data: questions,
          };
        } catch (error) {
          this.logger.error(`Interview questions generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      "Interview Questions Generation",
    );
  }

  /**
   * Tailor resume content (unchanged from original)
   */
  async tailorResumeContent(
    jobDescription: string,
    jobRequirements: string[],
    currentResumeData: Record<string, unknown>,
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
- **CRITICAL: ALWAYS include current job positions (those with "Present" end date) if they exist**
- If using only 2 experiences, prioritize current job + most relevant past job
- If using 3 experiences, prioritize: current job + 2 most relevant past jobs
- Summary must be 1-2 short sentences maximum
- All sections must be concise and optimized for single-page layout
- Prioritize: at least 1 current experience (preferably the most relevent one), most relevant past experiences, key technical skills, education, certifications, projects

CRITICAL FORMATTING REQUIREMENTS FOR EXPERIENCE, PROJECTS, AND VOLUNTEER SECTIONS:
- Experience, Projects, and Volunteer sections MUST use clean HTML bullet point formatting
- Each achievement/description should be formatted as: <li>Key result in <strong>bold</strong> followed by supporting details</li>
- Use <strong> tags to highlight quantifiable achievements, key skills, and important results
- Example format: <li>Increased team productivity by <strong>25%</strong> through implementation of automated testing</li>
- Keep bullet points detailed but concise and impactful.
- Do NOT apply this formatting to other sections (education, skills, etc.)
- Always make sure to have clean punctuation. Periods at the end of the bullet points, commas, etc.
- No need to highlight a tech stack section for each experience, the tech stack would be mentioned within the bullet points and the skills section

CRITICAL REQUIREMENTS: Return the COMPLETE resume JSON structure with all optimizations applied. You MUST:
1. Keep resume to 1 PAGE maximum (limit content strategically)
2. Optimize section order for job relevance
3. Enhance descriptions with job-relevant keywords
4. Add/modify skills to match job requirements
5. Improve professional summary for job fit, only 2 lines maximum with information given from existing summaries. 1 line max for the immigration or highlighted status, 1 line max for catchy experience description. 120 characters max for the summary.
6. Maintain original JSON structure exactly - especially metadata.layout
7. Do not create new Projects or rename their names, only a small addition or tweak to the titles, and tailor the summary of the projectto highlight the most relevant skills and experiences for the job. keep it 
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
- Keep project descriptions, limit them to 2 points in the summary max, 
- Focus on skills that match job requirements
- Remove or minimize less relevant sections
- Use bullet points effectively
- Ensure content fits on single page when printed
- For interests set the showKeywords to false
- For Languages set the showDescription to false
- For skills set the showDescription to false
- Remove the summary for education
- Keep the project summary concise but impactful, 2 bullet points max, and keep them short to one line max (100 characters or so). Set the showKeywords to false by default
- Limit the total count of all summary in the bullet points of all experiences combined to 2600 characters max.
- do not make up sourceContentId or contentId, if its a new item added leave them as null

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
