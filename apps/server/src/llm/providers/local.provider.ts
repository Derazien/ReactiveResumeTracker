import { Injectable } from "@nestjs/common";

import {
  ChatMessage,
  ChatOptions,
  ContentMatchResult,
  CVTailoringResult,
  JobAnalysisResult,
  LLMProvider,
  LLMResponse,
} from "../interfaces/llm-provider.interface";

@Injectable()
export class LocalLLMProvider implements LLMProvider {
  readonly name = "local";
  readonly model: string;

  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.LOCAL_LLM_BASE_URL || "http://localhost:11434";
    this.apiKey = process.env.LOCAL_LLM_API_KEY || "";
    this.model = process.env.LOCAL_LLM_MODEL || "llama3:8b";
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>> {
    try {
      // This can work with OpenAI-compatible APIs like:
      // - Ollama with OpenAI compatibility mode
      // - LM Studio
      // - vLLM
      // - Any other OpenAI-compatible local server

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: options?.temperature || 0.1,
          max_tokens: options?.maxTokens || 4000,
          top_p: options?.topP,
          stop: options?.stopSequences,
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice?.message?.content) {
        throw new Error("No content in local LLM response");
      }

      return {
        success: true,
        data: choice.message.content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens || 0,
              completionTokens: data.usage.completion_tokens || 0,
              totalTokens: data.usage.total_tokens || 0,
            }
          : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async analyzeJobPosting(jobText: string): Promise<LLMResponse<JobAnalysisResult>> {
    const prompt = `
You are an expert job analyst. Analyze the following job posting and extract structured information.

Job Posting:
${jobText}

Extract and return a JSON object with the following structure:
{
  "title": "exact job title",
  "company": "company name",
  "location": "location if mentioned",
  "description": "clean job description summary",
  "requirements": ["requirement 1", "requirement 2"],
  "skills": ["skill 1", "skill 2"],
  "extractedTags": ["tag1", "tag2"],
  "salaryRange": "salary if mentioned",
  "employmentType": "full-time/part-time/contract/etc",
  "experienceLevel": "junior/mid/senior/executive"
}

Guidelines:
- Extract specific technical skills, frameworks, languages
- Identify years of experience required
- Separate hard requirements from nice-to-haves
- Create relevant tags for matching (lowercase, no spaces)
- Be precise and don't hallucinate information not in the posting

Return only the JSON object, no additional text.`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a precise job posting analyzer. Return only valid JSON.",
      },
      { role: "user", content: prompt },
    ]);

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const parsed = JSON.parse(response.data!) as JobAnalysisResult;
      return {
        success: true,
        data: parsed,
        usage: response.usage,
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse job analysis result",
      };
    }
  }

  async matchContent(
    jobRequirements: string[],
    userContent: any[],
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

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const parsed = JSON.parse(response.data!) as ContentMatchResult[];
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
    selectedContent: any[],
    userProfile: any,
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
    userProfile: any,
    selectedContent: any[],
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
    userContent: any[],
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

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const questions = JSON.parse(response.data!) as string[];
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
    selectedContent: any[],
  ): Promise<LLMResponse<CVTailoringResult>> {
    const prompt = `
You are an expert CV optimization specialist. Analyze the job requirements against the current resume content and provide specific tailoring recommendations.

Job Description:
${jobDescription}

Job Requirements:
${jobRequirements.join("\n- ")}

Current Resume Data:
${JSON.stringify(currentResumeData, null, 2)}

Selected Content Library Items:
${JSON.stringify(selectedContent, null, 2)}

Analyze the resume and provide optimization recommendations as a JSON object with this structure:
{
  "adjustedSummary": "Enhanced professional summary that better matches job requirements (optional if current is good)",
  "skillsToAdd": ["skill1", "skill2", "skill3"],
  "skillsToRemove": ["outdated_skill1", "irrelevant_skill2"],
  "experienceAdjustments": [
    {
      "contentId": "content_id_from_selected_content",
      "adjustedTitle": "Better job title that matches role requirements",
      "adjustedDescription": "Enhanced description with job-relevant keywords and achievements",
      "keywordsToEmphasize": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "sectionRecommendations": [
    {
      "section": "education/certifications/projects/etc",
      "action": "add/remove/modify",
      "reasoning": "Why this change will improve job fit"
    }
  ],
  "overallFitScore": 85,
  "suggestions": [
    "Specific actionable advice for improving job match",
    "Additional recommendations for better positioning"
  ]
}

Guidelines:
- Focus on maximizing relevance to the job requirements
- Suggest skill additions/removals based on job needs vs current content
- Enhance experience descriptions with job-relevant keywords
- Score overall fit 0-100 (how well resume matches job after suggested changes)
- Be specific and actionable with suggestions
- Only suggest adjustments if they genuinely improve job fit
- Keep original meaning while optimizing for job relevance

Return only the JSON object, no additional text.`;

    const response = await this.chat([
      {
        role: "system",
        content:
          "You are a precise CV optimization expert. Analyze thoroughly and return only valid JSON with specific, actionable recommendations.",
      },
      { role: "user", content: prompt },
    ]);

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const parsed = JSON.parse(response.data!) as CVTailoringResult;
      return {
        success: true,
        data: parsed,
        usage: response.usage,
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse CV tailoring result",
      };
    }
  }
}
