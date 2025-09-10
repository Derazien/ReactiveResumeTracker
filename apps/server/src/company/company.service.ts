import { Injectable, Logger } from "@nestjs/common";
import { Company } from "@prisma/client";
import { CreateCompanyDto, UpdateCompanyDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

import { LLMService } from "../llm/llm.service";

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LLMService,
  ) {}

  /**
   * Create a new company
   */
  async create(userId: string, createDto: CreateCompanyDto): Promise<Company> {
    this.logger.debug(`Creating company for user ${userId}`);

    try {
      const company = await this.prisma.company.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          website: createDto.website,
          logo: createDto.logo,
          industry: createDto.industry,
          size: createDto.size,
          location: createDto.location,
          values: createDto.values || "[]",
          mission: createDto.mission,
          culture: createDto.culture,
          linkedinUrl: createDto.linkedinUrl,
          twitterUrl: createDto.twitterUrl,
          facebookUrl: createDto.facebookUrl,
          instagramUrl: createDto.instagramUrl,
          youtubeUrl: createDto.youtubeUrl,
          githubUrl: createDto.githubUrl,
        },
      });

      this.logger.debug(`Company created with ID: ${company.id}`);
      return company;
    } catch (error) {
      this.logger.error(
        `Failed to create company: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Find all companies
   */
  async findAll(): Promise<Company[]> {
    this.logger.debug("Finding all companies");

    return this.prisma.company.findMany({
      include: {
        contacts: true,
        jobApplications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find company by ID
   */
  async findOne(id: string): Promise<Company | null> {
    this.logger.debug(`Finding company ${id}`);

    return this.prisma.company.findUnique({
      where: { id },
      include: {
        contacts: true,
        jobApplications: true,
      },
    });
  }

  /**
   * Find company by name
   */
  async findByName(name: string): Promise<Company | null> {
    this.logger.debug(`Finding company by name: ${name}`);

    return this.prisma.company.findFirst({
      where: { name: { equals: name } },
      include: {
        contacts: true,
        jobApplications: true,
      },
    });
  }

  /**
   * Find companies by industry
   */
  async findByIndustry(industry: string): Promise<Company[]> {
    this.logger.debug(`Finding companies by industry: ${industry}`);

    return this.prisma.company.findMany({
      where: { industry: { equals: industry } },
      include: {
        contacts: true,
        jobApplications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update company
   */
  async update(id: string, updateDto: UpdateCompanyDto): Promise<Company> {
    this.logger.debug(`Updating company ${id}`);

    try {
      const company = await this.prisma.company.update({
        where: { id },
        data: {
          name: updateDto.name,
          description: updateDto.description,
          website: updateDto.website,
          logo: updateDto.logo,
          industry: updateDto.industry,
          size: updateDto.size,
          location: updateDto.location,
          values: updateDto.values,
          mission: updateDto.mission,
          culture: updateDto.culture,
          linkedinUrl: updateDto.linkedinUrl,
          twitterUrl: updateDto.twitterUrl,
          facebookUrl: updateDto.facebookUrl,
          instagramUrl: updateDto.instagramUrl,
          youtubeUrl: updateDto.youtubeUrl,
          githubUrl: updateDto.githubUrl,
        },
      });

      this.logger.debug(`Company updated: ${id}`);
      return company;
    } catch (error) {
      this.logger.error(
        `Failed to update company: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Delete company
   */
  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting company ${id}`);

    try {
      await this.prisma.company.delete({
        where: { id },
      });

      this.logger.debug(`Company deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete company: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Perform enhanced research on company
   */
  async researchCompany(id: string, strategy: "basic" | "comprehensive" | "deep" = "comprehensive") {
    this.logger.debug(`Starting enhanced research for company ${id} with strategy: ${strategy}`);

    // Generate unique log ID for this research request
    const logId = `research_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const timestamp = new Date().toISOString();

    // Prepare logging data
    let llmInput: any = null;
    let llmOutput: any = null;
    let originalCompany: any = null;
    let updatedCompany: any = null;
    let researchData: any = null;

    try {
      // Get the company
      const company = await this.findOne(id);
      if (!company) {
        throw new Error("Company not found");
      }

      originalCompany = company;

      // Capture LLM input for logging
      llmInput = {
        companyId: id,
        companyName: company.name,
        companyWebsite: company.website,
        strategy,
        timestamp,
      };

      // Perform enhanced research using LLM
      const researchResult = await this.llmService.analyzeCompanyAdvanced(
        company.name,
        company.website || undefined,
        undefined // No job description for general research
      );

      // Capture LLM output for logging
      llmOutput = researchResult;

      if (!researchResult.success || !researchResult.data) {
        throw new Error("Research failed");
      }

      researchData = researchResult.data;

      // Update company with research results
      updatedCompany = await this.prisma.company.update({
        where: { id },
        data: {
          // Basic company info
          name: researchData.companyInfo?.name || company.name,
          description: researchData.companyInfo?.description || company.description,
          industry: researchData.companyInfo?.industry || company.industry,
          size: researchData.companyInfo?.size || company.size,
          location: researchData.companyInfo?.location || company.location,
          website: researchData.companyInfo?.website || company.website,
          logo: researchData.companyInfo?.logo || company.logo,
          
          // Culture and values
          values: researchData.culture?.values ? JSON.stringify(researchData.culture.values) : company.values,
          mission: researchData.culture?.mission || company.mission,
          culture: researchData.culture?.culture || company.culture,
          
          // Social media links
          linkedinUrl: researchData.socialMedia?.linkedin || company.linkedinUrl,
          twitterUrl: researchData.socialMedia?.twitter || company.twitterUrl,
          facebookUrl: researchData.socialMedia?.facebook || company.facebookUrl,
          instagramUrl: researchData.socialMedia?.instagram || company.instagramUrl,
          youtubeUrl: researchData.socialMedia?.youtube || company.youtubeUrl,
          githubUrl: researchData.socialMedia?.github || company.githubUrl,
        },
      });

      this.logger.debug(`Company research completed and updated: ${id}`);

      // Generate comprehensive log file
      await this.generateResearchLog(logId, timestamp, id, llmInput, llmOutput, originalCompany, updatedCompany, researchData);

      return {
        success: true,
        company: updatedCompany,
        researchData: researchData,
        metadata: {
          strategy,
          confidence: researchData.researchMetadata?.confidence || "medium",
          sources: researchData.researchMetadata?.sources || [],
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to research company ${id}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      // Generate error log file
      await this.generateResearchLog(logId, timestamp, id, llmInput, llmOutput, originalCompany, updatedCompany, researchData, error);

      throw error;
    }
  }

  /**
   * Analyze company from URL (basic implementation)
   */
  async analyzeFromUrl(url: string): Promise<Partial<CreateCompanyDto>> {
    this.logger.debug(`Analyzing company from URL: ${url}`);

    try {
      // Basic URL parsing to extract company name
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");
      const companyName = domain.split(".")[0];

      // This is a basic implementation
      // In a real scenario, you would:
      // 1. Scrape the website for company information
      // 2. Use APIs to get company data (LinkedIn, Crunchbase, etc.)
      // 3. Extract social media links
      // 4. Analyze company culture and values

      return {
        name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
        website: url,
        // Other fields would be populated by actual scraping/API calls
      };
    } catch (error) {
      this.logger.error(
        `Failed to analyze company from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Extract company information from job posting
   */
  async extractFromJobPosting(
    jobDescription: string,
    companyName: string,
  ): Promise<Partial<CreateCompanyDto>> {
    this.logger.debug(`Extracting company info from job posting for: ${companyName}`);

    try {
      // Basic extraction - in a real scenario, you would use LLM to extract more detailed information
      const extractedInfo: Partial<CreateCompanyDto> = {
        name: companyName,
      };

      // Look for common patterns in job descriptions
      if (jobDescription.toLowerCase().includes("startup")) {
        extractedInfo.size = "10-50";
      } else if (jobDescription.toLowerCase().includes("fortune 500")) {
        extractedInfo.size = "1000+";
      }

      // Extract industry hints
      const industryKeywords = {
        software: "Technology",
        tech: "Technology",
        finance: "Financial Services",
        banking: "Financial Services",
        healthcare: "Healthcare",
        medical: "Healthcare",
        education: "Education",
        retail: "Retail",
        manufacturing: "Manufacturing",
      };

      for (const [keyword, industry] of Object.entries(industryKeywords)) {
        if (jobDescription.toLowerCase().includes(keyword)) {
          extractedInfo.industry = industry;
          break;
        }
      }

      return extractedInfo;
    } catch (error) {
      this.logger.error(
        `Failed to extract company info from job posting: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Generate comprehensive log file for research company operations
   */
  private async generateResearchLog(
    logId: string,
    timestamp: string,
    companyId: string,
    llmInput: any,
    llmOutput: any,
    originalCompany: any,
    updatedCompany: any,
    researchData?: any,
    error?: any,
  ): Promise<void> {
    try {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");

      // Create logs directory if it doesn't exist
      const logsDir = path.join(process.cwd(), "logs", "api-calls");
      await fs.mkdir(logsDir, { recursive: true });

      // Generate log filename
      const logFilename = `research_${logId}_${timestamp.replace(/[.:]/g, "-")}.md`;
      const logPath = path.join(logsDir, logFilename);

      // Build log content
      const logContent = `# API Call: researchCompany
- **Timestamp:** ${new Date(timestamp).toLocaleString()}
- **Log ID:** \`${logId}\`
- **Company ID:** \`${companyId}\`
- **Status:** ${error ? "❌ Failed" : "✅ Success"}
${error ? `- **Error:** ${error.message || "Unknown error"}` : ""}

## Request Details
- **Company Name:** "${llmInput?.companyName || "N/A"}"
- **Company Website:** ${llmInput?.companyWebsite || "N/A"}
- **Research Strategy:** ${llmInput?.strategy || "N/A"}

## Original Company Data
\`\`\`json
${JSON.stringify(originalCompany, null, 2)}
\`\`\`

## LLM Input
\`\`\`json
${JSON.stringify(llmInput, null, 2)}
\`\`\`

## LLM Output
\`\`\`json
${JSON.stringify(llmOutput, null, 2)}
\`\`\`

## Research Data
${
  researchData
    ? `
\`\`\`json
${JSON.stringify(researchData, null, 2)}
\`\`\`
`
    : "No research data available due to error"
}

## Updated Company Data
${
  updatedCompany
    ? `
\`\`\`json
${JSON.stringify(updatedCompany, null, 2)}
\`\`\`
`
    : "No updated data available due to error"
}

## Usage Information
${
  llmOutput?.usage
    ? `
\`\`\`json
${JSON.stringify(llmOutput.usage, null, 2)}
\`\`\`
`
    : "No usage information available"
}

## Changes Summary
${
  originalCompany && updatedCompany
    ? `
### Basic Information Changes
- **Name:** ${originalCompany.name} → ${updatedCompany.name}
- **Description:** ${originalCompany.description ? "Updated" : "Added"} ${updatedCompany.description ? "✓" : "✗"}
- **Industry:** ${originalCompany.industry || "N/A"} → ${updatedCompany.industry || "N/A"}
- **Size:** ${originalCompany.size || "N/A"} → ${updatedCompany.size || "N/A"}
- **Location:** ${originalCompany.location || "N/A"} → ${updatedCompany.location || "N/A"}
- **Website:** ${originalCompany.website || "N/A"} → ${updatedCompany.website || "N/A"}

### Culture & Values Changes
- **Mission:** ${originalCompany.mission ? "Updated" : "Added"} ${updatedCompany.mission ? "✓" : "✗"}
- **Culture:** ${originalCompany.culture ? "Updated" : "Added"} ${updatedCompany.culture ? "✓" : "✗"}
- **Values:** ${originalCompany.values ? "Updated" : "Added"} ${updatedCompany.values ? "✓" : "✗"}

### Social Media Links Changes
- **LinkedIn:** ${originalCompany.linkedinUrl || "N/A"} → ${updatedCompany.linkedinUrl || "N/A"}
- **Twitter:** ${originalCompany.twitterUrl || "N/A"} → ${updatedCompany.twitterUrl || "N/A"}
- **Facebook:** ${originalCompany.facebookUrl || "N/A"} → ${updatedCompany.facebookUrl || "N/A"}
- **Instagram:** ${originalCompany.instagramUrl || "N/A"} → ${updatedCompany.instagramUrl || "N/A"}
- **YouTube:** ${originalCompany.youtubeUrl || "N/A"} → ${updatedCompany.youtubeUrl || "N/A"}
- **GitHub:** ${originalCompany.githubUrl || "N/A"} → ${updatedCompany.githubUrl || "N/A"}
`
    : "No changes summary available due to error"
}

---
*Generated automatically by ReactiveResumeTracker Company Service*
`;

      // Write log file
      await fs.writeFile(logPath, logContent, "utf8");
      this.logger.log(`Research log generated: ${logPath}`);
    } catch (logError) {
      this.logger.error(
        `Failed to generate research log: ${logError instanceof Error ? logError.message : "Unknown error"}`,
      );
    }
  }
}
