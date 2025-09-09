import { Injectable, Logger } from "@nestjs/common";
import { Company } from "@prisma/client";
import { PrismaService } from "nestjs-prisma";

import { LLMService } from "@/server/llm/llm.service";
import { CompanyService } from "./company.service";

export interface CompanyAnalysisResult {
  culture: string;
  values: string[];
  mission: string;
  industry: string;
  reputation: string;
  growth: string;
  technology: string;
  benefits: string;
  opportunities: string;
}

export interface CompanyMatchResult {
  companyId: string;
  isNew: boolean;
  analysisStatus: "pending" | "completed";
}

/**
 * Service responsible for company research and analysis
 * Handles company extraction from job postings, enrichment, and analysis
 */
@Injectable()
export class CompanyResearchService {
  private readonly logger = new Logger(CompanyResearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
    private readonly companyService: CompanyService,
  ) {}

  /**
   * Extract company information from job posting and match/create company record
   * This method will find existing companies or create new ones with background analysis
   */
  async extractAndMatchCompany(
    companyName: string,
    jobDescription: string,
    jobUrl?: string,
  ): Promise<CompanyMatchResult> {
    this.logger.log(`Extracting and matching company: ${companyName}`);

    // Normalize company name
    const normalizedName = companyName.trim();

    // First, try to find existing company by name
    const existingCompany = await this.companyService.findByName(normalizedName);

    if (existingCompany) {
      this.logger.log(
        `Found existing company: ${existingCompany.name} (ID: ${existingCompany.id})`,
      );
      return {
        companyId: existingCompany.id,
        isNew: false,
        analysisStatus: "completed",
      };
    }

    // Create new company with basic info
    this.logger.log(`Creating new company: ${normalizedName}`);

    const newCompany = await this.companyService.create("system", {
      name: normalizedName,
      description: `Company extracted from job posting`,
      website: jobUrl ? new URL(jobUrl).origin : undefined,
      values: "[]",
    });

    // Start background analysis
    this.analyzeCompanyInBackground(newCompany.id, normalizedName, jobDescription, jobUrl);

    return {
      companyId: newCompany.id,
      isNew: true,
      analysisStatus: "pending",
    };
  }

  /**
   * Analyze company in background using LLM
   * This runs asynchronously to avoid blocking the main flow
   */
  private async analyzeCompanyInBackground(
    companyId: string,
    companyName: string,
    jobDescription: string,
    jobUrl?: string,
  ): Promise<void> {
    this.logger.log(`Starting background analysis for company: ${companyName}`);

    try {
      // Use LLM to analyze company
      const analysisResult = await this.llmService.analyzeCompanyAdvanced(
        companyName,
        jobUrl,
        jobDescription,
      );

      const companyData = analysisResult.data;

      // Update company with enhanced structured data only if analysis succeeded
      if (companyData) {
        await this.companyService.update(companyId, {
          // Basic company info
          name: companyData.companyInfo?.name || companyName,
          description: companyData.companyInfo?.description || `Company: ${companyName}`,
          industry: companyData.companyInfo?.industry,
          size: companyData.companyInfo?.size,
          location: companyData.companyInfo?.location,
          website: companyData.companyInfo?.website || companyData.socialMedia?.linkedin || jobUrl,
          logo: companyData.companyInfo?.logo,
          
          // Culture and values
          values: JSON.stringify(companyData.culture?.values || []),
          mission: companyData.culture?.mission,
          culture: companyData.culture?.culture,
          
          // Social media links
          linkedinUrl: companyData.socialMedia?.linkedin,
          twitterUrl: companyData.socialMedia?.twitter,
          facebookUrl: companyData.socialMedia?.facebook,
          instagramUrl: companyData.socialMedia?.instagram,
          youtubeUrl: companyData.socialMedia?.youtube,
          githubUrl: companyData.socialMedia?.github,
        });
      }

      this.logger.log(`Completed background analysis for company: ${companyName}`);
    } catch (error) {
      this.logger.error(
        `Error in background company analysis for ${companyName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Analyze company for a specific job application
   * Returns detailed company analysis including culture, values, etc.
   */
  async analyzeCompanyForJob(
    companyId: string | null,
    companyName: string,
    jobUrl?: string,
    jobDescription?: string,
  ): Promise<CompanyAnalysisResult> {
    this.logger.debug(`Analyzing company ${companyName} (ID: ${companyId})`);

    try {
      // Check if company already exists in database
      let company: Company | null = null;
      if (companyId) {
        company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
      }

      // If company exists with full data, return it
      if (company && company.culture && company.values) {
        return {
          culture: company.culture || "",
          values: JSON.parse(company.values || "[]"),
          mission: company.mission || "",
          industry: company.industry || company.description || "",
          reputation: "",
          growth: "",
          technology: "",
          benefits: "",
          opportunities: "",
        };
      }

      // Otherwise, perform LLM analysis
      const result = await this.llmService.analyzeCompanyAdvanced(
        companyName,
        jobUrl,
        jobDescription,
      );

      if (result.success && result.data) {
        const analysisData = result.data;
        
        // If we have a company record, update it
        if (company) {
          await this.companyService.update(company.id, {
            description: analysisData.companyInfo?.description,
            industry: analysisData.companyInfo?.industry,
            values: JSON.stringify(analysisData.culture?.values || []),
            mission: analysisData.culture?.mission,
            culture: analysisData.culture?.culture,
            website: jobUrl,
          });
        } else if (!companyId) {
          // Create new company record if none exists
          const newCompany = await this.prisma.company.create({
            data: {
              name: companyName,
              description: analysisData.companyInfo?.description || `Company: ${companyName}`,
              industry: analysisData.companyInfo?.industry,
              values: JSON.stringify(analysisData.culture?.values || []),
              mission: analysisData.culture?.mission,
              culture: analysisData.culture?.culture,
              website: jobUrl,
            },
          });
          
          this.logger.log(`Created new company record: ${newCompany.id}`);
        }

        // Return the expected CompanyAnalysisResult structure
        return {
          culture: analysisData.culture?.culture || "",
          values: analysisData.culture?.values || [],
          mission: analysisData.culture?.mission || "",
          industry: analysisData.companyInfo?.industry || "",
          reputation: "",
          growth: "",
          technology: "",
          benefits: "",
          opportunities: "",
        };
      } else {
        throw new Error("Failed to analyze company");
      }
    } catch (error) {
      this.logger.error(
        `Company analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Enrich company data from public sources
   * Non-agentic approach using APIs and web scraping
   */
  async enrichCompanyFromPublicSources(
    companyName: string,
    websiteUrl?: string,
  ): Promise<Partial<Company>> {
    this.logger.log(`Enriching company data for: ${companyName}`);

    const enrichedData: Partial<Company> = {
      name: companyName,
    };

    try {
      // TODO: Implement API integrations
      // - Clearbit API for company data
      // - Hunter.io for contacts
      // - LinkedIn API for company info
      // - Crunchbase for funding/size info

      // For now, just parse basic info from website URL
      if (websiteUrl) {
        try {
          const url = new URL(websiteUrl);
          enrichedData.website = url.origin;
          
          // TODO: Fetch and parse website for:
          // - About page
          // - Careers page
          // - Values/Mission statements
          // - Team/Leadership info
        } catch (urlError) {
          this.logger.warn(`Invalid website URL: ${websiteUrl}`);
        }
      }

      return enrichedData;
    } catch (error) {
      this.logger.error(
        `Error enriching company data: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return enrichedData;
    }
  }

  /**
   * Search for similar companies in the database
   * Useful for finding companies with variations in naming
   */
  async findSimilarCompanies(companyName: string): Promise<Company[]> {
    const normalizedName = companyName.toLowerCase().trim();
    
    // Search for companies with similar names
    // Note: SQLite doesn't support case-insensitive mode, so we use contains only
    const similarCompanies = await this.prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: normalizedName } },
          { name: { startsWith: normalizedName } },
          { name: { endsWith: normalizedName } },
        ],
      },
      take: 5,
    });

    return similarCompanies;
  }
}
