import Anthropic from "@anthropic-ai/sdk";
import { Injectable, Logger } from "@nestjs/common";

import {
  ChatMessage,
  ChatOptions,
  ContentMatchResult,
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

@Injectable()
export class AnthropicProvider implements LLMProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private client: Anthropic;

  readonly name = "anthropic";
  readonly model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-3-sonnet-20240229";
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    return text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>> {
    try {
      this.logger.debug(`Sending chat request to Anthropic with ${messages.length} messages`);
      
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
    } catch (error) {
      this.logger.error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
        content: "You are a precise job posting analyzer. Extract comprehensive details and return only valid JSON without any markdown formatting.",
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
      this.logger.error(`Failed to parse job analysis result: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
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
        content: "You are an expert resume writer specializing in ATS-optimized professional summaries.",
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
        content: "You are an expert cover letter writer with deep knowledge of recruitment best practices.",
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
}
