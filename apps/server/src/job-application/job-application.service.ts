import { Injectable, Logger } from "@nestjs/common";
import { JobApplication } from "@prisma/client";
import { CreateJobApplicationDto, UpdateJobApplicationDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { ContentLibraryService } from "@/server/content-library/content-library.service";
import { LLMService } from "@/server/llm/llm.service";

export type JobAnalysisResult = {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  extractedTags: string[];
  location?: string;
  salaryRange?: string;
  employmentType?: string;
  experienceLevel?: string;
};

@Injectable()
export class JobApplicationService {
  private readonly logger = new Logger(JobApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly contentLibraryService: ContentLibraryService,
  ) {}

  async create(
    userId: string,
    createJobApplicationDto: CreateJobApplicationDto,
  ): Promise<JobApplication> {
    return this.prisma.jobApplication.create({
      data: {
        title: createJobApplicationDto.title,
        company: createJobApplicationDto.company,
        description: createJobApplicationDto.description ?? "",
        url: createJobApplicationDto.url,
        notes: createJobApplicationDto.notes,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<JobApplication[]> {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resumes: true,
        coverLetters: true,
        interviews: true,
      },
    });
  }

  async findOne(id: string, userId: string): Promise<JobApplication | null> {
    return this.prisma.jobApplication.findFirst({
      where: { id, userId },
      include: {
        resumes: true,
        coverLetters: true,
        interviews: true,
        generatedContent: true,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ): Promise<JobApplication> {
    // Convert DTO to Prisma update format
    const updateData: any = {};
    
    // Copy basic fields
    if (updateJobApplicationDto.title !== undefined) updateData.title = updateJobApplicationDto.title;
    if (updateJobApplicationDto.company !== undefined) updateData.company = updateJobApplicationDto.company;
    if (updateJobApplicationDto.description !== undefined) updateData.description = updateJobApplicationDto.description;
    if (updateJobApplicationDto.url !== undefined) updateData.url = updateJobApplicationDto.url;
    if (updateJobApplicationDto.notes !== undefined) updateData.notes = updateJobApplicationDto.notes;
    if (updateJobApplicationDto.status !== undefined) updateData.status = updateJobApplicationDto.status;
    if (updateJobApplicationDto.appliedDate !== undefined) updateData.appliedDate = updateJobApplicationDto.appliedDate;
    
    // Convert arrays to JSON strings for database storage
    if (updateJobApplicationDto.requirements !== undefined) {
      updateData.requirements = JSON.stringify(updateJobApplicationDto.requirements);
    }
    if (updateJobApplicationDto.extractedTags !== undefined) {
      updateData.extractedTags = JSON.stringify(updateJobApplicationDto.extractedTags);
    }

    return this.prisma.jobApplication.update({
      where: { id, userId },
      data: updateData,
    });
  }

  async remove(id: string, userId: string): Promise<JobApplication> {
    return this.prisma.jobApplication.delete({
      where: { id, userId },
    });
  }

  /**
   * Analyze a job posting URL or text - ONLY analysis, no creation
   */
  async analyzeJobPosting(
    jobText: string,
    url?: string,
  ): Promise<{
    analysisResult: JobAnalysisResult;
  }> {
    this.logger.log(`Analyzing job posting text`);

    // Only analyze the job posting with LLM
    const analysisResult = await this.llmService.analyzeJobPosting(jobText);

    if (!analysisResult.success || !analysisResult.data) {
      throw new Error(`Job analysis failed: ${analysisResult.error ?? 'Unknown error'}`);
    }

    return {
      analysisResult: analysisResult.data,
    };
  }

  /**
   * Create job application from analyzed data
   */
  async createFromAnalysis(
    userId: string,
    analysisData: JobAnalysisResult,
    url?: string,
  ): Promise<JobApplication> {
    this.logger.log(`Creating job application from analysis for user ${userId}`);

    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: analysisData.title,
        company: analysisData.company,
        description: analysisData.description,
        requirements: JSON.stringify(analysisData.requirements ?? []),
        extractedTags: JSON.stringify(analysisData.extractedTags ?? []),
        url: url ?? "",
        userId,
      },
    });

    // Store the analysis record (without content matching)
    await this.prisma.generatedContent.create({
      data: {
        type: "job_analysis",
        prompt: `Analyze job posting: ${analysisData.title} at ${analysisData.company}`,
        response: JSON.stringify(analysisData),
        llmProvider: "ANTHROPIC",
        model: "claude-3-5-sonnet",
        contentIds: JSON.stringify([]), // Empty - no content matching at this stage
        jobApplicationId: jobApplication.id,
      },
    });

    return jobApplication;
  }

  /**
   * Analyze a job posting URL or text and create/update a job application
   */
  async analyzeAndCreateFromJobPosting(
    userId: string,
    jobText: string,
    url?: string,
  ): Promise<{
    jobApplication: JobApplication;
    analysisResult: any;
    contentMatches: any[];
  }> {
    this.logger.log(`Analyzing job posting for user ${userId}`);

    // Step 1: Analyze the job posting with LLM using user's settings
    const analysisResult = await this.llmService.analyzeJobPostingForUser(userId, jobText);

    if (!analysisResult.success) {
      throw new Error(`Job analysis failed: ${analysisResult.error}`);
    }

    const jobData = analysisResult.data!;

    // Step 2: Create the job application
    const jobApplication = await this.prisma.jobApplication.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requirements: JSON.stringify(jobData.requirements),
        extractedTags: JSON.stringify(jobData.extractedTags),
        url: url || "",
        userId,
      },
    });

    // Step 3: Get user's content library
    const userContent = await this.contentLibraryService.findAll(userId);

    // Step 4: Match content to job requirements using RAG-based matching
    const contentMatches = await this.llmService.matchContentToJobRAG(
      userId,
      jobData.requirements,
      jobData.description,
    );

    // Step 5: Store the generated content record
    await this.prisma.generatedContent.create({
      data: {
        type: "job_analysis",
        prompt: `Analyze job posting: ${jobText.slice(0, 200)}...`,
        response: JSON.stringify(jobData),
        llmProvider: "ANTHROPIC", // This should come from the service
        model: "claude-3-5-sonnet", // This should come from the service
        contentIds: JSON.stringify(contentMatches.success ? contentMatches.data!.map((m) => m.contentId) : []),
        jobApplicationId: jobApplication.id,
      },
    });

    return {
      jobApplication,
      analysisResult: jobData,
      contentMatches: contentMatches.success ? contentMatches.data! : [],
    };
  }

  /**
   * Generate a tailored resume for a specific job application
   * This creates an actual Resume record with structured data, using primarily content library matching
   * LLM is used minimally - only for optional summary generation if enabled
   */
  async generateTailoredResume(
    jobApplicationId: string,
    userId: string,
    selectedContentIds?: string[],
  ): Promise<{
    resume: any;
    selectedContent: any[];
    suggestions: string[];
  }> {
    this.logger.log(`Generating tailored resume for job application ${jobApplicationId}`);

    // Get job application
    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get user's basic info
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, picture: true },
    });

    // Get user's content
    let selectedContent: any[] = [];

    if (selectedContentIds?.length) {
      // Use user-selected content
      for (const contentId of selectedContentIds) {
        const content = await this.contentLibraryService.findOne(contentId, userId);
        if (content) {
          selectedContent.push(content);
        }
      }
    } else {
      // Auto-select best matching content using tag/keyword matching (NO LLM)
      selectedContent = await this.selectRelevantContentByTags(userId, jobApplication);
      this.logger.log(`Auto-selected ${selectedContent.length} relevant content pieces using tag/keyword matching`);
    }

    // Generate basic summary without LLM - use template-based approach
    const generatedSummary = this.generateBasicSummary(user, jobApplication, selectedContent);

    // Create structured resume data
    const resumeData = await this.buildResumeFromContent(user, selectedContent, generatedSummary, jobApplication);

    // Create the resume record
    const resume = await this.prisma.resume.create({
      data: {
        title: `${jobApplication.title} - ${jobApplication.company}`,
        slug: `${jobApplication.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${jobApplication.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        data: JSON.stringify(resumeData),
        userId,
        jobApplicationId: jobApplication.id,
        visibility: 'private',
      },
    });

    // Store the generation record
    await this.prisma.generatedContent.create({
      data: {
        type: "tailored_resume",
        prompt: `Generate tailored resume for ${jobApplication.title} at ${jobApplication.company}`,
        response: JSON.stringify({
          resumeId: resume.id,
          contentCount: selectedContent.length,
          summary: generatedSummary,
          method: 'tag-based-matching', // No LLM used
        }),
        llmProvider: "OLLAMA", // Use valid enum value to indicate non-LLM generation
        model: "content-library-matching",
        contentIds: JSON.stringify(selectedContent.map((c) => c.id)),
        jobApplicationId: jobApplication.id,
      },
    });

    const suggestions = [
      `Review and customize the generated summary using LLM features in the builder`,
      `Add quantified achievements to highlight impact`,
      `Use the content library in the builder to add more relevant sections`,
      `Consider using AI enhancements within the resume builder for further optimization`,
      `Tailor keywords using the builder's LLM features to match job requirements`,
    ];

    return {
      resume,
      selectedContent,
      suggestions,
    };
  }

  /**
   * Select relevant content using tag-based and keyword matching (NO LLM)
   */
  private async selectRelevantContentByTags(userId: string, jobApplication: any): Promise<any[]> {
    // Get all user content
    const allContent = await this.contentLibraryService.findAll(userId);
    
    // Extract job tags and requirements
    const jobTags = JSON.parse(jobApplication.extractedTags || '[]');
    const jobRequirements = JSON.parse(jobApplication.requirements || '[]');
    
    // Create keyword list from job data
    const jobKeywords = new Set<string>();
    
    // Add tags as keywords
    jobTags.forEach((tag: string) => jobKeywords.add(tag.toLowerCase()));
    
    // Extract keywords from requirements (simple keyword extraction)
    jobRequirements.forEach((req: string) => {
      const words = req.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      words.forEach(word => jobKeywords.add(word));
    });
    
    // Extract keywords from job title and company
    const titleWords = jobApplication.title.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    titleWords.forEach((word: string) => jobKeywords.add(word));

    // Score content based on keyword/tag matches
    const scoredContent = allContent.map(content => {
      let score = 0;
      const contentKeywords = new Set<string>();
      
      // Get content keywords from various fields
      if (content.title) {
        const titleWords = content.title.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        titleWords.forEach((word: string) => contentKeywords.add(word));
      }
      
      if (content.description) {
        const descWords = content.description.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        descWords.forEach((word: string) => contentKeywords.add(word));
      }
      
      // Parse skills and add them
      const skills = typeof content.skills === 'string' ? JSON.parse(content.skills || '[]') : content.skills || [];
      skills.forEach((skill: string) => contentKeywords.add(skill.toLowerCase()));
      
      // Note: content.tags is not available in basic content query, we'll get it separately if needed
      // For now, we'll rely on skills, title, and description matching
      
      // Calculate score based on keyword overlap
      let matches = 0;
      jobKeywords.forEach(jobKeyword => {
        contentKeywords.forEach(contentKeyword => {
          if (contentKeyword.includes(jobKeyword) || jobKeyword.includes(contentKeyword)) {
            matches++;
          }
        });
      });
      
      // Bonus points for content type relevance
      const typeBonus = this.getContentTypeRelevanceScore(content.type, jobRequirements);
      
      // Calculate final score
      score = (matches / Math.max(jobKeywords.size, 1)) * 100 + typeBonus;
      
      return { ...content, matchScore: score };
    });

    // Filter and sort by score - select content with score >= 30
    const relevantContent = scoredContent
      .filter(content => content.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 15); // Limit to top 15 pieces

    this.logger.log(`Content selection scores: ${relevantContent.map(c => `${c.title}: ${c.matchScore.toFixed(1)}`).join(', ')}`);
    
    return relevantContent;
  }

  /**
   * Get content type relevance score for job requirements (NO LLM)
   */
  private getContentTypeRelevanceScore(contentType: string, jobRequirements: string[]): number {
    const requirementText = jobRequirements.join(' ').toLowerCase();
    
    const typeRelevanceMap: Record<string, { keywords: string[], bonus: number }> = {
      'WORK_EXPERIENCE': { 
        keywords: ['experience', 'years', 'worked', 'led', 'managed', 'senior', 'lead'], 
        bonus: 20 
      },
      'TECHNICAL_SKILL': { 
        keywords: ['skill', 'programming', 'development', 'technology', 'framework'], 
        bonus: 15 
      },
      'PROJECT': { 
        keywords: ['project', 'built', 'developed', 'created', 'portfolio'], 
        bonus: 15 
      },
      'SOFT_SKILL': { 
        keywords: ['leadership', 'communication', 'team', 'management', 'collaboration'], 
        bonus: 10 
      },
      'EDUCATION': { 
        keywords: ['education', 'degree', 'university', 'bachelor', 'master'], 
        bonus: 8 
      },
      'CERTIFICATION': { 
        keywords: ['certified', 'certification', 'license', 'credential'], 
        bonus: 12 
      }
    };

    const typeInfo = typeRelevanceMap[contentType];
    if (!typeInfo) return 0;

    const keywordMatches = typeInfo.keywords.filter(keyword => 
      requirementText.includes(keyword)
    ).length;

    return keywordMatches > 0 ? typeInfo.bonus : 0;
  }

  /**
   * Generate basic summary without LLM - template-based approach
   */
  private generateBasicSummary(user: any, jobApplication: any, selectedContent: any[]): string {
    const experienceCount = selectedContent.filter(c => c.type === 'WORK_EXPERIENCE').length;
    const skillsCount = selectedContent.filter(c => c.type === 'TECHNICAL_SKILL' || c.type === 'SOFT_SKILL').length;
    const projectsCount = selectedContent.filter(c => c.type === 'PROJECT').length;
    
    // Get top skills
    const allSkills = selectedContent.reduce((acc, content) => {
      const skills = typeof content.skills === 'string' ? JSON.parse(content.skills || '[]') : content.skills || [];
      return acc.concat(skills);
    }, []);
    
    const uniqueSkills = [...new Set(allSkills)].slice(0, 5);
    const skillsText = uniqueSkills.length > 0 ? uniqueSkills.join(', ') : 'various technologies';
    
    // Template-based summary
    let summary = `Experienced professional seeking ${jobApplication.title} position at ${jobApplication.company}.`;
    
    if (experienceCount > 0) {
      summary += ` With proven experience across ${experienceCount} relevant role${experienceCount > 1 ? 's' : ''},`;
    }
    
    if (projectsCount > 0) {
      summary += ` including ${projectsCount} significant project${projectsCount > 1 ? 's' : ''},`;
    }
    
    summary += ` bringing expertise in ${skillsText}.`;
    
    if (skillsCount > 0) {
      summary += ` Demonstrated proficiency across ${skillsCount} key skill area${skillsCount > 1 ? 's' : ''}.`;
    }
    
    summary += ` Passionate about contributing to team success and delivering high-quality results.`;
    
    return summary;
  }

  /**
   * Build structured resume data from content library items
   */
  private async buildResumeFromContent(
    user: any,
    selectedContent: any[],
    summary: string,
    jobApplication: any,
  ): Promise<any> {
    // Get default resume structure
    const { defaultResumeData } = await import('@reactive-resume/schema');
    const resumeData = JSON.parse(JSON.stringify(defaultResumeData));

    // Set basic info
    resumeData.basics.name = user.name;
    resumeData.basics.email = user.email;
    resumeData.basics.picture.url = user.picture || "";
    resumeData.basics.headline = `${jobApplication.title} | ${user.name}`;
    
    // Set generated summary
    resumeData.sections.summary.content = `<p>${summary}</p>`;

    // Process content by type
    const workExperiences = selectedContent.filter(c => c.type === 'WORK_EXPERIENCE');
    const projects = selectedContent.filter(c => c.type === 'PROJECT');
    const education = selectedContent.filter(c => c.type === 'EDUCATION');
    const skills = selectedContent.filter(c => c.type === 'TECHNICAL_SKILL' || c.type === 'SOFT_SKILL');
    const certifications = selectedContent.filter(c => c.type === 'CERTIFICATION');

    // Add work experience
    resumeData.sections.experience.items = workExperiences.map(exp => {
      const content = typeof exp.content === 'string' ? JSON.parse(exp.content) : exp.content;
      const achievements = typeof exp.achievements === 'string' ? JSON.parse(exp.achievements) : exp.achievements;
      
      return {
        id: `exp_${exp.id}`,
        visible: true,
        company: exp.company || 'Company',
        position: exp.position || exp.title,
        location: exp.location || '',
        date: this.formatDateRange(exp.startDate, exp.endDate),
        summary: this.formatExperienceContent(exp.description, content, achievements),
        url: { label: '', href: '' },
      };
    });

    // Add projects
    resumeData.sections.projects.items = projects.map(proj => {
      const content = typeof proj.content === 'string' ? JSON.parse(proj.content) : proj.content;
      
      return {
        id: `proj_${proj.id}`,
        visible: true,
        name: proj.title,
        description: proj.position || 'Project',
        date: this.formatDateRange(proj.startDate, proj.endDate),
        summary: `<p>${proj.description || ''}</p>`,
        keywords: typeof proj.skills === 'string' ? JSON.parse(proj.skills) : proj.skills || [],
        url: { label: '', href: '' },
      };
    });

    // Add education
    resumeData.sections.education.items = education.map(edu => ({
      id: `edu_${edu.id}`,
      visible: true,
      institution: edu.company || edu.title,
      studyType: edu.position || 'Degree',
      area: edu.location || '',
      score: '',
      date: this.formatDateRange(edu.startDate, edu.endDate),
      summary: `<p>${edu.description || ''}</p>`,
      url: { label: '', href: '' },
    }));

    // Add skills - combine all skills into categories
    const allSkills = skills.reduce((acc, skill) => {
      const skillList = typeof skill.skills === 'string' ? JSON.parse(skill.skills) : skill.skills || [];
      return acc.concat(skillList);
    }, []);

    // Group skills by type/category
    const skillCategories = this.groupSkillsByCategory(allSkills, selectedContent);
    resumeData.sections.skills.items = skillCategories;

    // Add certifications
    resumeData.sections.certifications.items = certifications.map(cert => ({
      id: `cert_${cert.id}`,
      visible: true,
      name: cert.title,
      issuer: cert.company || 'Issuing Organization',
      date: cert.startDate ? new Date(cert.startDate).getFullYear().toString() : '',
      summary: `<p>${cert.description || ''}</p>`,
      url: { label: '', href: '' },
    }));

    return resumeData;
  }

  /**
   * Format date range for resume display
   */
  private formatDateRange(startDate: any, endDate: any): string {
    if (!startDate) return '';
    
    const formatDate = (date: any) => {
      if (!date) return 'Present';
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  /**
   * Format experience content with achievements
   */
  private formatExperienceContent(description: string, content: any, achievements: any[]): string {
    let html = `<p>${description || ''}</p>`;
    
    if (content?.responsibilities && Array.isArray(content.responsibilities)) {
      html += '<ul>';
      content.responsibilities.forEach((resp: string) => {
        html += `<li><p>${resp}</p></li>`;
      });
      html += '</ul>';
    }

    if (achievements && Array.isArray(achievements) && achievements.length > 0) {
      html += '<ul>';
      achievements.forEach((achievement: string) => {
        html += `<li><p>🏆 ${achievement}</p></li>`;
      });
      html += '</ul>';
    }

    return html;
  }

  /**
   * Group skills by category for better organization
   */
  private groupSkillsByCategory(allSkills: string[], selectedContent: any[]): any[] {
    // Categorize skills based on common patterns
    const categories = {
      'Programming Languages': [] as string[],
      'Frameworks & Libraries': [] as string[],
      'Tools & Technologies': [] as string[],
      'Soft Skills': [] as string[],
    };

    const programmingLanguages = ['javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'c++', 'c#', 'php', 'ruby', 'go', 'rust'];
    const frameworks = ['react', 'angular', 'vue', 'node.js', 'express', 'django', 'spring', 'laravel', 'rails'];
    const tools = ['git', 'docker', 'kubernetes', 'aws', 'azure', 'jenkins', 'jira'];
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'project management'];

    allSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (programmingLanguages.some(lang => skillLower.includes(lang))) {
        categories['Programming Languages'].push(skill);
      } else if (frameworks.some(fw => skillLower.includes(fw))) {
        categories['Frameworks & Libraries'].push(skill);
      } else if (tools.some(tool => skillLower.includes(tool))) {
        categories['Tools & Technologies'].push(skill);
      } else if (softSkills.some(soft => skillLower.includes(soft))) {
        categories['Soft Skills'].push(skill);
      } else {
        // Default to Tools & Technologies
        categories['Tools & Technologies'].push(skill);
      }
    });

    // Convert to resume format
    return Object.entries(categories)
      .filter(([_, skills]) => skills.length > 0)
      .map(([category, skills], index) => ({
        id: `skill_cat_${index}`,
        visible: true,
        name: category,
        description: '',
        level: 0,
        keywords: [...new Set(skills)], // Remove duplicates
      }));
  }

  /**
   * Generate a personalized cover letter
   */
  async generateCoverLetter(
    jobApplicationId: string,
    userId: string,
    selectedContentIds?: string[],
  ): Promise<string> {
    this.logger.log(`Generating cover letter for job application ${jobApplicationId}`);

    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    // Get selected content (similar logic to resume generation)
    const selectedContent: any[] = [];
    if (selectedContentIds?.length) {
      for (const contentId of selectedContentIds) {
        const content = await this.contentLibraryService.findOne(contentId, userId);
        if (content) {
          selectedContent.push(content);
        }
      }
    }

    const userProfile = { name: "User", email: "user@example.com" }; // TODO: Get real user profile

    const coverLetterResult = await this.llmService.generateCoverLetter(
      jobApplication.description || "",
      jobApplication.company,
      userProfile,
      selectedContent,
    );

    if (!coverLetterResult.success) {
      throw new Error(`Cover letter generation failed: ${coverLetterResult.error}`);
    }

    // Save cover letter
    await this.prisma.coverLetter.create({
      data: {
        content: coverLetterResult.data!,
        jobApplicationId: jobApplication.id,
      },
    });

    // Store generation record
    await this.prisma.generatedContent.create({
      data: {
        type: "cover_letter",
        prompt: `Generate cover letter for ${jobApplication.title} at ${jobApplication.company}`,
        response: coverLetterResult.data!,
        llmProvider: "ANTHROPIC",
        model: "claude-3-5-sonnet",
        contentIds: JSON.stringify(selectedContent.map((c) => c.id)),
        jobApplicationId: jobApplication.id,
      },
    });

    return coverLetterResult.data!;
  }

  /**
   * Generate interview questions for practice
   */
  async generateInterviewQuestions(jobApplicationId: string, userId: string): Promise<string[]> {
    this.logger.log(`Generating interview questions for job application ${jobApplicationId}`);

    const jobApplication = await this.findOne(jobApplicationId, userId);
    if (!jobApplication) {
      throw new Error("Job application not found");
    }

    const userContent = await this.contentLibraryService.findAll(userId);

    const questionsResult = await this.llmService.generateInterviewQuestions(
      jobApplication.description || "",
      userContent,
    );

    if (!questionsResult.success) {
      throw new Error(`Interview questions generation failed: ${questionsResult.error}`);
    }

    return questionsResult.data!;
  }
}
