import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

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
export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  readonly name = "openai";
  readonly model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || "gpt-4-turbo-preview";
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    return text.replace(/^```(?:json)?\n/, "").replace(/\n```$/, "");
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<LLMResponse<string>> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature || 0.1,
        max_tokens: options?.maxTokens || 4000,
        top_p: options?.topP,
        stop: options?.stopSequences,
      });

      const choice = response.choices[0];
      if (!choice.message.content) {
        throw new Error("No content in OpenAI response");
      }

      return {
        success: true,
        data: choice.message.content,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
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
      const parsed = JSON.parse(response.data!) as string[];
      return {
        success: true,
        data: parsed,
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
9. For title make sure it's relevent to the job description but relative to the user's experience, you may add 2 titles seperated by a "|" for example "Lead Software Engineer | Full Stack Developer".

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

    const response = await this.chat(
      [
        {
          role: "system",
          content:
            "You are a precise CV optimization expert. Return the complete optimized resume in exact JSON format with a summary of changes. Ensure 1-page layout optimization.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 4000 },
    );

    if (!response.success) {
      return {
        success: false,
        error: response.error,
      };
    }

    try {
      const cleanedResponse = this.cleanJsonResponse(response.data!);
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
    } catch {
      return {
        success: false,
        error: "Failed to parse complete CV tailoring result",
      };
    }
  }
}
