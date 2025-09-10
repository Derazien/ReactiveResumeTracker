import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { AnthropicProvider } from "./anthropic.provider";
import { OpenAIProvider } from "./openai.provider";
import { RESEARCH_TOOLS, RESEARCH_STRATEGIES, ResearchStrategy } from "../research-tools.config";

export interface ResearchEnhancedResponse {
  success: boolean;
  data?: any;
  error?: string;
  researchMetadata?: {
    toolsUsed: string[];
    confidence: "high" | "medium" | "low";
    cost: number;
    timeSpent: number;
    sources: string[];
  };
}

@Injectable()
export class ResearchEnhancedProvider {
  private readonly logger = new Logger(ResearchEnhancedProvider.name);
  private anthropicProvider: AnthropicProvider;
  private openaiProvider: OpenAIProvider;

  constructor(
    private configService: ConfigService,
    anthropicProvider: AnthropicProvider,
    openaiProvider: OpenAIProvider,
  ) {
    this.anthropicProvider = anthropicProvider;
    this.openaiProvider = openaiProvider;
  }

  /**
   * Enhanced company research with multiple data sources
   */
  async researchCompany(
    companyName: string,
    companyUrl?: string,
    jobDescription?: string,
    strategy: keyof typeof RESEARCH_STRATEGIES = "comprehensive",
  ): Promise<ResearchEnhancedResponse> {
    const startTime = Date.now();
    const researchStrategy = RESEARCH_STRATEGIES[strategy];
    
    this.logger.log(`Starting ${strategy} research for company: ${companyName}`);

    try {
      // Step 1: Basic company information gathering
      const basicInfo = await this.gatherBasicInfo(companyName, companyUrl, researchStrategy);
      
      // Step 2: Technology stack analysis
      const techStack = await this.analyzeTechnologyStack(companyUrl, jobDescription, researchStrategy);
      
      // Step 3: News and recent developments
      const newsData = await this.gatherNewsData(companyName, researchStrategy);
      
      // Step 4: Social media presence
      const socialData = await this.gatherSocialMediaData(companyName, researchStrategy);
      
      // Step 5: Company culture and reviews
      const cultureData = await this.gatherCultureData(companyName, researchStrategy);
      
      // Step 6: Synthesize all data with LLM
      const synthesizedData = await this.synthesizeResearchData({
        companyName,
        companyUrl,
        jobDescription,
        basicInfo,
        techStack,
        newsData,
        socialData,
        cultureData,
      });

      const timeSpent = Date.now() - startTime;
      const cost = this.calculateResearchCost(researchStrategy);

      return {
        success: true,
        data: synthesizedData,
        researchMetadata: {
          toolsUsed: researchStrategy.tools,
          confidence: this.calculateConfidence(synthesizedData),
          cost,
          timeSpent,
          sources: this.extractSources([basicInfo, techStack, newsData, socialData, cultureData]),
        },
      };
    } catch (error) {
      this.logger.error(`Research failed for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Gather basic company information
   */
  private async gatherBasicInfo(
    companyName: string,
    companyUrl?: string,
    strategy?: ResearchStrategy,
  ): Promise<any> {
    const info: any = { name: companyName };

    try {
      // Website scraping if URL provided
      if (companyUrl && strategy?.tools.includes('scrapingBee')) {
        const websiteData = await this.scrapeWebsite(companyUrl);
        Object.assign(info, websiteData);
      }

      // LinkedIn company data
      if (strategy?.tools.includes('linkedin')) {
        const linkedinData = await this.getLinkedInData(companyName);
        Object.assign(info, linkedinData);
      }

      // Apollo.io company data
      if (strategy?.tools.includes('apollo')) {
        const apolloData = await this.getApolloData(companyName);
        Object.assign(info, apolloData);
      }

      return info;
    } catch (error) {
      this.logger.warn(`Failed to gather basic info for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return info;
    }
  }

  /**
   * Analyze technology stack
   */
  private async analyzeTechnologyStack(
    companyUrl?: string,
    jobDescription?: string,
    strategy?: ResearchStrategy,
  ): Promise<any> {
    const techData: any = {};

    try {
      // Wappalyzer technology detection
      if (companyUrl && strategy?.tools.includes('wappalyzer')) {
        const wappalyzerData = await this.getWappalyzerData(companyUrl);
        Object.assign(techData, wappalyzerData);
      }

      // BuiltWith technology detection
      if (companyUrl && strategy?.tools.includes('builtWith')) {
        const builtWithData = await this.getBuiltWithData(companyUrl);
        Object.assign(techData, builtWithData);
      }

      // Extract tech from job description
      if (jobDescription) {
        const jobTechData = this.extractTechFromJobDescription(jobDescription);
        Object.assign(techData, jobTechData);
      }

      return techData;
    } catch (error) {
      this.logger.warn(`Failed to analyze technology stack: ${error instanceof Error ? error.message : "Unknown error"}`);
      return techData;
    }
  }

  /**
   * Gather news and recent developments
   */
  private async gatherNewsData(companyName: string, strategy?: ResearchStrategy): Promise<any> {
    const newsData: any = { recentNews: [] };

    try {
      // NewsAPI.org
      if (strategy?.tools.includes('newsApi')) {
        const newsApiData = await this.getNewsApiData(companyName);
        newsData.recentNews.push(...newsApiData);
      }

      // GNews API
      if (strategy?.tools.includes('gnews')) {
        const gnewsData = await this.getGNewsData(companyName);
        newsData.recentNews.push(...gnewsData);
      }

      return newsData;
    } catch (error) {
      this.logger.warn(`Failed to gather news data for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return newsData;
    }
  }

  /**
   * Gather social media presence
   */
  private async gatherSocialMediaData(companyName: string, strategy?: ResearchStrategy): Promise<any> {
    const socialData: any = {};

    try {
      // LinkedIn company page
      if (strategy?.tools.includes('linkedin')) {
        const linkedinSocial = await this.getLinkedInSocialData(companyName);
        Object.assign(socialData, linkedinSocial);
      }

      // Twitter mentions
      if (strategy?.tools.includes('twitter')) {
        const twitterData = await this.getTwitterData(companyName);
        Object.assign(socialData, twitterData);
      }

      return socialData;
    } catch (error) {
      this.logger.warn(`Failed to gather social media data for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return socialData;
    }
  }

  /**
   * Gather company culture and reviews
   */
  private async gatherCultureData(companyName: string, strategy?: ResearchStrategy): Promise<any> {
    const cultureData: any = {};

    try {
      // Glassdoor reviews
      if (strategy?.tools.includes('glassdoor')) {
        const glassdoorData = await this.getGlassdoorData(companyName);
        Object.assign(cultureData, glassdoorData);
      }

      return cultureData;
    } catch (error) {
      this.logger.warn(`Failed to gather culture data for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return cultureData;
    }
  }

  /**
   * Synthesize all research data using LLM
   */
  private async synthesizeResearchData(researchData: any): Promise<any> {
    try {
      const prompt = this.buildSynthesisPrompt(researchData);
      
      // Use Claude for synthesis (better for complex analysis)
      const result = await this.anthropicProvider.chat([
        {
          role: "system",
          content: "You are an expert business analyst. Synthesize the provided research data into a comprehensive, structured company profile. Return only valid JSON with the exact structure specified."
        },
        { role: "user", content: prompt }
      ]);

      if (result.success && result.data) {
        const cleanedResponse = result.data.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleanedResponse);
      }

      throw new Error("Failed to synthesize research data");
    } catch (error) {
      this.logger.error(`Failed to synthesize research data: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  // API Integration Methods (Implementation examples)

  private async scrapeWebsite(url: string): Promise<any> {
    // Implementation would use ScrapingBee or similar service
    const apiKey = this.configService.get<string>('SCRAPING_BEE_API_KEY');
    if (!apiKey) return {};

    try {
      const response = await axios.get('https://app.scrapingbee.com/api/v1/', {
        params: {
          api_key: apiKey,
          url: url,
          render_js: 'true',
          extract_rules: JSON.stringify({
            title: { selector: 'title' },
            description: { selector: 'meta[name="description"]', type: 'attr', attr: 'content' },
            logo: { selector: 'link[rel="icon"], link[rel="shortcut icon"]', type: 'attr', attr: 'href' }
          })
        }
      });

      return response.data;
    } catch (error) {
      this.logger.warn(`Website scraping failed for ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {};
    }
  }

  private async getWappalyzerData(url: string): Promise<any> {
    const apiKey = this.configService.get<string>('WAPPALYZER_API_KEY');
    if (!apiKey) return {};

    try {
      const response = await axios.get(`https://api.wappalyzer.com/lookup/v2/?urls=${encodeURIComponent(url)}`, {
        headers: { 'x-api-key': apiKey }
      });

      return { technology: response.data[0]?.technologies || [] };
    } catch (error) {
      this.logger.warn(`Wappalyzer API failed for ${url}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {};
    }
  }

  private async getNewsApiData(companyName: string): Promise<string[]> {
    const apiKey = this.configService.get<string>('NEWS_API_KEY');
    if (!apiKey) return [];

    try {
      const response = await axios.get(`https://newsapi.org/v2/everything`, {
        params: {
          q: companyName,
          apiKey: apiKey,
          sortBy: 'publishedAt',
          pageSize: 5
        }
      });

      return response.data.articles?.map((article: any) => article.title) || [];
    } catch (error) {
      this.logger.warn(`NewsAPI failed for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`);
      return [];
    }
  }

  private extractTechFromJobDescription(jobDescription: string): any {
    const techKeywords = [
      "React", "Angular", "Vue", "Node.js", "Python", "Java", "C#", "Go", "Rust",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "MongoDB", "PostgreSQL",
      "Redis", "Elasticsearch", "Kafka", "GraphQL", "REST", "TypeScript", "JavaScript"
    ];

    const foundTech = techKeywords.filter(tech => 
      jobDescription.toLowerCase().includes(tech.toLowerCase())
    );

    return { jobDescriptionTech: foundTech };
  }

  // Placeholder methods for other APIs
  private async getLinkedInData(companyName: string): Promise<any> {
    // LinkedIn API implementation would go here
    return {};
  }

  private async getApolloData(companyName: string): Promise<any> {
    // Apollo.io API implementation would go here
    return {};
  }

  private async getBuiltWithData(url: string): Promise<any> {
    // BuiltWith API implementation would go here
    return {};
  }

  private async getGNewsData(companyName: string): Promise<string[]> {
    // GNews API implementation would go here
    return [];
  }

  private async getLinkedInSocialData(companyName: string): Promise<any> {
    // LinkedIn social data implementation would go here
    return {};
  }

  private async getTwitterData(companyName: string): Promise<any> {
    // Twitter API implementation would go here
    return {};
  }

  private async getGlassdoorData(companyName: string): Promise<any> {
    // Glassdoor API implementation would go here
    return {};
  }

  // Helper methods

  private buildSynthesisPrompt(researchData: any): string {
    return `Synthesize the following research data into a comprehensive company profile:

RESEARCH DATA:
${JSON.stringify(researchData, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "companyInfo": {
    "name": "exact company name",
    "website": "official website URL",
    "logo": "logo URL if found",
    "industry": "primary industry",
    "size": "employee count range",
    "location": "headquarters location",
    "founded": "year founded if found",
    "description": "comprehensive company description"
  },
  "culture": {
    "mission": "company mission statement",
    "vision": "company vision if available",
    "values": ["value1", "value2", "value3"],
    "culture": "detailed culture description",
    "workStyle": "remote/hybrid/onsite preferences"
  },
  "business": {
    "reputation": "market reputation and standing",
    "growth": "growth stage and recent developments",
    "technology": "technology stack and tools",
    "competitiveAdvantages": ["advantage1", "advantage2"],
    "recentNews": ["news item 1", "news item 2"]
  },
  "career": {
    "benefits": "employee benefits and perks",
    "opportunities": "career growth opportunities",
    "workEnvironment": "work environment description",
    "teamStructure": "team and collaboration style"
  },
  "socialMedia": {
    "linkedin": "LinkedIn company page URL",
    "twitter": "Twitter/X handle or URL",
    "facebook": "Facebook page URL",
    "instagram": "Instagram handle or URL",
    "youtube": "YouTube channel URL",
    "github": "GitHub organization URL"
  }
}`;
  }

  private calculateConfidence(data: any): "high" | "medium" | "low" {
    const hasWebsite = !!data.companyInfo?.website;
    const hasLinkedIn = !!data.socialMedia?.linkedin;
    const hasDescription = !!data.companyInfo?.description;
    const hasMission = !!data.culture?.mission;
    const hasTechnology = !!data.business?.technology;
    const hasNews = data.business?.recentNews?.length > 0;

    let score = 0;
    if (hasWebsite) score += 1;
    if (hasLinkedIn) score += 1;
    if (hasDescription) score += 1;
    if (hasMission) score += 1;
    if (hasTechnology) score += 1;
    if (hasNews) score += 1;

    if (score >= 4) return "high";
    if (score >= 2) return "medium";
    return "low";
  }

  private calculateResearchCost(strategy: ResearchStrategy): number {
    // Simplified cost calculation
    return strategy.maxCost;
  }

  private extractSources(dataArrays: any[]): string[] {
    const sources: string[] = [];
    dataArrays.forEach(data => {
      if (data.sources) {
        sources.push(...data.sources);
      }
    });
    return [...new Set(sources)]; // Remove duplicates
  }
} 