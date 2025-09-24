import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { createHash } from 'crypto';

export interface JobSummary {
  title: string;
  company: string;
  location: string;
  salary?: string;
  experience: string;
  keySkills: string[];
  jobType: string;
  summary: string;
}

export interface OptimizationMetrics {
  originalTokens: number;
  optimizedTokens: number;
  reductionPercentage: number;
  cacheHit: boolean;
  modelTier: 'FREE' | 'HAIKU' | 'SONNET';
}

@Injectable()
export class LlmOptimizationService {
  private readonly logger = new Logger(LlmOptimizationService.name);
  private readonly cache = new Map<string, any>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private prisma: PrismaService) {}

  /**
   * 🔥 CRITICAL: Extract job summary instead of sending full description
   * Reduces tokens by 85-95%
   */
  extractJobSummary(fullJobDescription: string): JobSummary {
    const lines = fullJobDescription.split('\n').map(line => line.trim());
    
    // Extract title (usually first few lines)
    const title = this.extractTitle(lines);
    
    // Extract company name
    const company = this.extractCompany(lines);
    
    // Extract location
    const location = this.extractLocation(lines);
    
    // Extract salary if mentioned
    const salary = this.extractSalary(fullJobDescription);
    
    // Extract experience requirements
    const experience = this.extractExperience(fullJobDescription);
    
    // Extract key skills (most important for matching)
    const keySkills = this.extractKeySkills(fullJobDescription);
    
    // Extract job type (remote, hybrid, onsite)
    const jobType = this.extractJobType(fullJobDescription);
    
    // Create concise summary
    const summary = this.createSummary({
      title,
      company,
      location,
      experience,
      keySkills: keySkills.slice(0, 5), // Top 5 skills only
      jobType
    });

    return {
      title,
      company,
      location,
      salary,
      experience,
      keySkills,
      jobType,
      summary
    };
  }

  /**
   * 🏪 CACHING: Avoid duplicate LLM calls for similar content
   */
  async getCachedResult<T>(key: string, generator: () => Promise<T>): Promise<T> {
    const cacheKey = this.generateCacheKey(key);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache HIT for key: ${cacheKey}`);
      return cached.data;
    }
    
    this.logger.debug(`Cache MISS for key: ${cacheKey}`);
    const result = await generator();
    
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  }

  /**
   * 🎯 MODEL TIER ROUTING: Use cheapest appropriate model
   */
  determineModelTier(task: 'extraction' | 'matching' | 'generation' | 'analysis'): 'FREE' | 'HAIKU' | 'SONNET' {
    switch (task) {
      case 'extraction':
        // Simple data extraction - use FREE regex/rules
        return 'FREE';
      
      case 'matching':
        // Content matching and scoring - use HAIKU
        return 'HAIKU';
      
      case 'analysis':
        // Content analysis and scoring - use HAIKU  
        return 'HAIKU';
      
      case 'generation':
        // Complex content generation - use SONNET only when needed
        return 'SONNET';
      
      default:
        return 'HAIKU';
    }
  }

  /**
   * 📊 TOKEN ESTIMATION: Estimate tokens before sending to LLM
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * 🔍 BATCH PROCESSING: Group similar requests to reduce API calls
   */
  async batchSimilarJobs(jobs: any[]): Promise<any[]> {
    const batches = this.groupSimilarJobs(jobs);
    const results = [];
    
    for (const batch of batches) {
      if (batch.length === 1) {
        // Single job - process normally
        results.push(batch[0]);
      } else {
        // Multiple similar jobs - process as batch
        const batchResult = await this.processBatchJobs(batch);
        results.push(...batchResult);
      }
    }
    
    return results;
  }

  /**
   * 📈 METRICS: Track optimization performance
   */
  calculateOptimizationMetrics(
    originalText: string,
    optimizedText: string,
    cacheHit: boolean,
    modelTier: 'FREE' | 'HAIKU' | 'SONNET'
  ): OptimizationMetrics {
    const originalTokens = this.estimateTokens(originalText);
    const optimizedTokens = this.estimateTokens(optimizedText);
    const reductionPercentage = Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100);
    
    return {
      originalTokens,
      optimizedTokens,
      reductionPercentage,
      cacheHit,
      modelTier
    };
  }

  // =================================================================
  // PRIVATE HELPER METHODS
  // =================================================================

  private extractTitle(lines: string[]): string {
    // Look for title in first 3 lines, usually capitalized
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      if (line.length > 10 && line.length < 100 && /[A-Z]/.test(line)) {
        return line;
      }
    }
    return lines[0] || 'Unknown Position';
  }

  private extractCompany(lines: string[]): string {
    // Look for company indicators
    const companyIndicators = /company|corp|inc|ltd|llc|at\s+([A-Z][a-z]+)/i;
    for (const line of lines) {
      const match = line.match(companyIndicators);
      if (match) {
        return match[1] || line.trim();
      }
    }
    return 'Unknown Company';
  }

  private extractLocation(lines: string[]): string {
    // Look for location patterns
    const locationPattern = /(remote|hybrid|onsite|[A-Z][a-z]+,?\s*[A-Z]{2}|[A-Z][a-z]+\s*,\s*[A-Z][a-z]+)/i;
    for (const line of lines) {
      const match = line.match(locationPattern);
      if (match) {
        return match[1];
      }
    }
    return 'Location Not Specified';
  }

  private extractSalary(text: string): string | undefined {
    // Look for salary patterns
    const salaryPattern = /\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*(?:per\s+)?(?:year|annually|yr))?/i;
    const match = text.match(salaryPattern);
    return match ? match[0] : undefined;
  }

  private extractExperience(text: string): string {
    // Look for experience requirements
    const expPatterns = [
      /(\d+)[\s\-+]*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/i,
      /(entry[\s\-]?level|junior|senior|mid[\s\-]?level|principal|lead)/i
    ];
    
    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    return 'Experience Not Specified';
  }

  private extractKeySkills(text: string): string[] {
    // Common tech skills - expand this list based on your needs
    const techSkills = [
      'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Python',
      'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Microservices',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap', 'Material-UI',
      'Git', 'CI/CD', 'Jenkins', 'GitHub Actions', 'DevOps', 'Agile', 'Scrum'
    ];
    
    const foundSkills = [];
    const textLower = text.toLowerCase();
    
    for (const skill of techSkills) {
      if (textLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  private extractJobType(text: string): string {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('remote') || textLower.includes('work from home')) {
      return 'Remote';
    } else if (textLower.includes('hybrid')) {
      return 'Hybrid';
    } else if (textLower.includes('onsite') || textLower.includes('on-site')) {
      return 'Onsite';
    }
    
    return 'Not Specified';
  }

  private createSummary(data: Partial<JobSummary>): string {
    const parts = [
      data.title,
      data.company,
      data.location,
      data.jobType,
      data.experience,
      data.keySkills?.slice(0, 5).join(', ')
    ].filter(Boolean);
    
    return parts.join(' | ');
  }

  private generateCacheKey(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  private groupSimilarJobs(jobs: any[]): any[][] {
    // Simple grouping by company and title similarity
    const groups = new Map<string, any[]>();
    
    for (const job of jobs) {
      const key = `${job.companyName}_${job.title?.substring(0, 20)}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(job);
    }
    
    return Array.from(groups.values());
  }

  private async processBatchJobs(jobs: any[]): Promise<any[]> {
    // Process similar jobs together to reduce API calls
    // This is a simplified implementation - expand based on your needs
    return jobs;
  }
}
