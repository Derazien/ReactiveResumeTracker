import { Injectable, Logger } from "@nestjs/common";
import compromise from "compromise";
import { extract as extractSearchIndex } from "extract-search-index";
import natural from "natural";
import { retext } from "retext";
import retextKeywords from "retext-keywords";

type TagExtractionResult = {
  tags: string[];
  confidence: number;
  method: "nlp-hybrid" | "fallback-llm";
  processingTime: number;
};

@Injectable()
export class TagExtractionService {
  private readonly logger = new Logger(TagExtractionService.name);

  /**
   * Extract tags from job description using hybrid NLP approach
   * Much faster and cheaper than LLM calls
   */
  async extractJobTags(jobDescription: string): Promise<TagExtractionResult> {
    const startTime = Date.now();

    try {
      // Clean and prepare text
      const cleanText = this.cleanText(jobDescription);

      // Multi-method tag extraction
      const [technicalSkills, softSkills, industryTerms, nlpKeywords, tfidfTerms] =
        await Promise.all([
          this.extractTechnicalSkills(cleanText),
          this.extractSoftSkills(cleanText),
          this.extractIndustryTerms(cleanText),
          this.extractNLPKeywords(cleanText),
          this.extractTFIDFTerms(cleanText),
        ]);

      // Combine and rank all extracted terms
      const allTags = [
        ...technicalSkills.map((tag) => ({ tag, weight: 3, type: "technical" })),
        ...softSkills.map((tag) => ({ tag, weight: 2, type: "soft" })),
        ...industryTerms.map((tag) => ({ tag, weight: 2.5, type: "industry" })),
        ...nlpKeywords.map((tag) => ({ tag, weight: 1.5, type: "keyword" })),
        ...tfidfTerms.map((tag) => ({ tag, weight: 1, type: "tfidf" })),
      ];

      // Score and deduplicate tags
      const scoredTags = this.scoreAndDeduplicateTags(allTags);

      // Convert to our tag format (lowercase, hyphenated)
      const finalTags = scoredTags
        .slice(0, 15) // Top 15 tags
        .map((item) => this.normalizeTag(item.tag));

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Extracted ${finalTags.length} tags in ${processingTime}ms using NLP libraries`,
      );

      return {
        tags: finalTags,
        confidence: 0.85, // High confidence for NLP extraction
        method: "nlp-hybrid",
        processingTime,
      };
    } catch (error) {
      this.logger.error("NLP tag extraction failed:", error);

      // Fallback to simple keyword extraction
      const fallbackTags = this.extractFallbackTags(jobDescription);

      return {
        tags: fallbackTags,
        confidence: 0.6,
        method: "fallback-llm",
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract technical skills using pattern matching and compromise
   */
  private async extractTechnicalSkills(text: string): Promise<string[]> {
    const doc = compromise(text);
    const skills = new Set<string>();

    // Programming languages
    const programmingLanguages = [
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
      "swift",
      "kotlin",
      "scala",
      "r",
      "matlab",
      "perl",
      "shell",
      "bash",
      "powershell",
      "sql",
      "html",
      "css",
    ];

    // Frameworks and libraries
    const frameworks = [
      "react",
      "angular",
      "vue",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      "rails",
      "asp.net",
      ".net",
      "jquery",
      "bootstrap",
      "tailwind",
      "sass",
      "less",
    ];

    // Databases
    const databases = [
      "mysql",
      "postgresql",
      "mongodb",
      "redis",
      "elasticsearch",
      "sqlite",
      "oracle",
      "sql server",
      "dynamodb",
      "cassandra",
      "neo4j",
      "firebase",
    ];

    // Cloud and DevOps
    const cloudDevOps = [
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "gitlab",
      "github",
      "terraform",
      "ansible",
      "chef",
      "puppet",
      "vagrant",
      "nginx",
      "apache",
      "linux",
      "unix",
      "windows",
    ];

    // Tools and technologies
    const tools = [
      "git",
      "jira",
      "confluence",
      "slack",
      "figma",
      "adobe",
      "photoshop",
      "illustrator",
      "sketch",
      "invision",
      "zeplin",
      "postman",
      "swagger",
      "api",
      "rest",
      "graphql",
      "websocket",
    ];

    const allTechTerms = [
      ...programmingLanguages,
      ...frameworks,
      ...databases,
      ...cloudDevOps,
      ...tools,
    ];

    // Pattern-based extraction
    for (const term of allTechTerms) {
      const regex = new RegExp(`\\b${term}\\b`, "gi");
      if (regex.test(text)) {
        skills.add(term.toLowerCase());
      }
    }

    // Use compromise to find technical terms
    const techTerms = doc.match("#Technology").out("array");
    techTerms.forEach((term: string) => skills.add(term.toLowerCase()));

    // Look for version numbers (likely technical)
    const versioned = doc.match("#Value #Noun").out("array");
    versioned.forEach((term: string) => {
      if (/\d+(\.\d+)?/.test(term)) {
        const cleanTerm = term.replace(/\d+(\.\d+)?/g, "").trim();
        if (cleanTerm.length > 2) {
          skills.add(cleanTerm.toLowerCase());
        }
      }
    });

    return [...skills];
  }

  /**
   * Extract soft skills using predefined patterns
   */
  private async extractSoftSkills(text: string): Promise<string[]> {
    const softSkillPatterns = [
      "leadership",
      "communication",
      "teamwork",
      "collaboration",
      "problem-solving",
      "critical-thinking",
      "analytical",
      "creativity",
      "innovation",
      "adaptability",
      "flexibility",
      "time-management",
      "organization",
      "attention-to-detail",
      "multitasking",
      "decision-making",
      "negotiation",
      "presentation",
      "public-speaking",
      "mentoring",
      "coaching",
      "project-management",
      "agile",
      "scrum",
      "kanban",
      "waterfall",
      "lean",
      "six-sigma",
    ];

    const skills = new Set<string>();
    const lowerText = text.toLowerCase();

    for (const skill of softSkillPatterns) {
      const regex = new RegExp(`\\b${skill.replace("-", String.raw`[-\s]?`)}\\b`, "gi");
      if (regex.test(lowerText)) {
        skills.add(skill);
      }
    }

    return [...skills];
  }

  /**
   * Extract industry-specific terms
   */
  private async extractIndustryTerms(text: string): Promise<string[]> {
    const doc = compromise(text);
    const terms = new Set<string>();

    // Industry buzzwords
    const industryTerms = [
      "fintech",
      "healthtech",
      "edtech",
      "proptech",
      "insurtech",
      "regtech",
      "martech",
      "adtech",
      "e-commerce",
      "saas",
      "paas",
      "iaas",
      "b2b",
      "b2c",
      "b2g",
      "enterprise",
      "startup",
      "digital-transformation",
      "automation",
      "ai",
      "machine-learning",
      "artificial-intelligence",
      "blockchain",
      "cryptocurrency",
      "iot",
      "internet-of-things",
      "cybersecurity",
      "data-science",
      "big-data",
      "analytics",
      "business-intelligence",
      "data-visualization",
      "reporting",
    ];

    for (const term of industryTerms) {
      const regex = new RegExp(`\\b${term.replace("-", String.raw`[-\s]?`)}\\b`, "gi");
      if (regex.test(text)) {
        terms.add(term);
      }
    }

    // Extract organizations and companies (likely industry context)
    const orgs = doc.organizations().out("array");
    orgs.forEach((org: string) => {
      if (org.length > 2 && org.length < 20) {
        terms.add(org.toLowerCase().replace(/\s+/g, "-"));
      }
    });

    return [...terms];
  }

  /**
   * Extract keywords using retext-keywords
   */
  private async extractNLPKeywords(text: string): Promise<string[]> {
    try {
      const file = await retext().use(retextKeywords, { maximum: 10 }).process(text);

      const keywords = file.data.keywords || [];
      const keyphrases = file.data.keyphrases || [];

      const allKeywords = [
        ...keywords.map((kw: any) => kw.stem),
        ...keyphrases.map((kp: any) => kp.stems.join("-")),
      ];

      return allKeywords.filter((kw) => kw && kw.length > 2);
    } catch (error) {
      this.logger.warn("retext-keywords extraction failed:", error);
      return [];
    }
  }

  /**
   * Extract terms using TF-IDF scoring
   */
  private async extractTFIDFTerms(text: string): Promise<string[]> {
    try {
      // Tokenize and clean
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(text.toLowerCase());

      if (!tokens) return [];

      // Remove stop words
      const stopWords = new Set(natural.stopwords);
      const filteredTokens = tokens.filter(
        (token) => !stopWords.has(token) && token.length > 2 && /^[A-Za-z]+$/.test(token),
      );

      // Calculate term frequency
      const termFreq: Record<string, number> = {};
      for (const token of filteredTokens) {
        termFreq[token] = (termFreq[token] || 0) + 1;
      }

      // Sort by frequency and return top terms
      const sortedTerms = Object.entries(termFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([term]) => term);

      return sortedTerms;
    } catch (error) {
      this.logger.warn("TF-IDF extraction failed:", error);
      return [];
    }
  }

  /**
   * Score and deduplicate tags
   */
  private scoreAndDeduplicateTags(tagItems: { tag: string; weight: number; type: string }[]) {
    const tagScores: Record<string, { score: number; types: Set<string> }> = {};

    // Aggregate scores for duplicate tags
    for (const { tag, weight, type } of tagItems) {
      const normalizedTag = tag.toLowerCase().trim();
      if (normalizedTag.length < 2) continue;

      if (!tagScores[normalizedTag]) {
        tagScores[normalizedTag] = { score: 0, types: new Set() };
      }

      tagScores[normalizedTag].score += weight;
      tagScores[normalizedTag].types.add(type);
    }

    // Boost tags that appear in multiple extraction methods
    for (const [tag, data] of Object.entries(tagScores)) {
      if (data.types.size > 1) {
        data.score *= 1.5; // Boost multi-method tags
      }
    }

    // Sort by score and return
    return Object.entries(tagScores)
      .map(([tag, data]) => ({ tag, score: data.score }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Normalize tag to our format (lowercase, hyphenated)
   */
  private normalizeTag(tag: string): string {
    return tag
      .toLowerCase()
      .trim()
      .replace(/[^\d\sa-z-]/g, "") // Remove special chars
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove multiple hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Clean text for processing
   */
  private cleanText(text: string): string {
    return text
      .replace(/[^\s\w.-]/g, " ") // Keep only alphanumeric, spaces, dots, hyphens
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Fallback tag extraction using simple keyword extraction
   */
  private extractFallbackTags(text: string): string[] {
    try {
      const keywords = extractSearchIndex(text);
      return keywords
        .split(" ")
        .filter((word) => word.length > 2)
        .slice(0, 10)
        .map((word) => this.normalizeTag(word));
    } catch (error) {
      this.logger.error("Fallback tag extraction failed:", error);
      return [];
    }
  }
}
