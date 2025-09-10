export interface ResearchToolConfig {
  name: string;
  type: 'api' | 'scraper' | 'database';
  description: string;
  cost: 'free' | 'paid' | 'freemium';
  rateLimit: string;
  features: string[];
  apiKey?: string;
  endpoint?: string;
}

export const RESEARCH_TOOLS: Record<string, ResearchToolConfig> = {
  // News and Information APIs
  newsApi: {
    name: 'NewsAPI.org',
    type: 'api',
    description: 'Comprehensive news search API',
    cost: 'freemium',
    rateLimit: '1,000 requests/day (free)',
    features: ['Company news', 'Recent developments', 'Industry trends'],
    endpoint: 'https://newsapi.org/v2/everything'
  },
  
  gnews: {
    name: 'GNews API',
    type: 'api',
    description: 'Google News API alternative',
    cost: 'freemium',
    rateLimit: '100 requests/day (free)',
    features: ['News search', 'Company mentions', 'Sentiment analysis'],
    endpoint: 'https://gnews.io/api/v4/search'
  },
  
  // Company Information APIs
  crunchbase: {
    name: 'Crunchbase API',
    type: 'api',
    description: 'Comprehensive company database',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Company profiles', 'Funding data', 'Employee count', 'Industry'],
    endpoint: 'https://api.crunchbase.com/v3.1'
  },
  
  apollo: {
    name: 'Apollo.io',
    type: 'api',
    description: 'B2B company and contact database',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Company search', 'Employee data', 'Contact information'],
    endpoint: 'https://api.apollo.io/v1'
  },
  
  // Social Media APIs
  linkedin: {
    name: 'LinkedIn API',
    type: 'api',
    description: 'Official LinkedIn company data',
    cost: 'paid',
    rateLimit: 'Strict rate limiting',
    features: ['Company pages', 'Employee count', 'Industry', 'Recent posts'],
    endpoint: 'https://api.linkedin.com/v2'
  },
  
  twitter: {
    name: 'Twitter API v2',
    type: 'api',
    description: 'Twitter company mentions and data',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Company mentions', 'Social sentiment', 'Recent activity'],
    endpoint: 'https://api.twitter.com/2'
  },
  
  // Web Scraping Services
  scrapingBee: {
    name: 'ScrapingBee',
    type: 'scraper',
    description: 'Professional web scraping service',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Website scraping', 'JavaScript rendering', 'Anti-bot protection'],
    endpoint: 'https://app.scrapingbee.com/api/v1'
  },
  
  brightData: {
    name: 'Bright Data',
    type: 'scraper',
    description: 'Enterprise web scraping platform',
    cost: 'paid',
    rateLimit: 'High volume',
    features: ['Residential proxies', 'Data center proxies', 'Web scraping'],
    endpoint: 'https://brightdata.com/api'
  },
  
  // Technology Stack Detection
  wappalyzer: {
    name: 'Wappalyzer API',
    type: 'api',
    description: 'Technology stack detection',
    cost: 'freemium',
    rateLimit: '100 requests/day (free)',
    features: ['Tech stack detection', 'Frameworks', 'Libraries', 'Tools'],
    endpoint: 'https://api.wappalyzer.com/lookup/v2'
  },
  
  builtWith: {
    name: 'BuiltWith API',
    type: 'api',
    description: 'Website technology profiler',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Technology detection', 'Hosting info', 'Analytics tools'],
    endpoint: 'https://api.builtwith.com/v19'
  },
  
  // Company Review Platforms
  glassdoor: {
    name: 'Glassdoor API',
    type: 'api',
    description: 'Company reviews and ratings',
    cost: 'paid',
    rateLimit: 'Varies by plan',
    features: ['Company reviews', 'Culture ratings', 'Benefits info'],
    endpoint: 'https://api.glassdoor.com/api/api.htm'
  },
  
  // Financial Data
  alphaVantage: {
    name: 'Alpha Vantage',
    type: 'api',
    description: 'Financial market data',
    cost: 'freemium',
    rateLimit: '5 requests/minute (free)',
    features: ['Stock data', 'Company overview', 'Financial statements'],
    endpoint: 'https://www.alphavantage.co/query'
  }
};

export const RESEARCH_PRIORITIES = {
  high: ['newsApi', 'wappalyzer', 'linkedin'],
  medium: ['gnews', 'apollo', 'twitter'],
  low: ['crunchbase', 'glassdoor', 'alphaVantage']
};

export const WEB_SCRAPING_TOOLS = {
  puppeteer: {
    name: 'Puppeteer',
    description: 'Headless Chrome automation',
    useCase: 'Dynamic website scraping',
    pros: ['JavaScript rendering', 'Full browser automation'],
    cons: ['Resource intensive', 'Complex setup']
  },
  
  playwright: {
    name: 'Playwright',
    description: 'Multi-browser automation',
    useCase: 'Cross-browser scraping',
    pros: ['Multiple browsers', 'Better performance'],
    cons: ['Learning curve', 'Resource usage']
  },
  
  cheerio: {
    name: 'Cheerio',
    description: 'Server-side jQuery',
    useCase: 'Static HTML parsing',
    pros: ['Lightweight', 'Fast', 'Simple'],
    cons: ['No JavaScript execution']
  }
};

export interface ResearchStrategy {
  phase: 'basic' | 'comprehensive' | 'deep';
  tools: string[];
  maxCost: number;
  timeLimit: number; // seconds
  confidenceTarget: 'low' | 'medium' | 'high';
}

export const RESEARCH_STRATEGIES: Record<string, ResearchStrategy> = {
  basic: {
    phase: 'basic',
    tools: ['newsApi', 'wappalyzer'],
    maxCost: 0.10, // $0.10
    timeLimit: 30,
    confidenceTarget: 'low'
  },
  
  comprehensive: {
    phase: 'comprehensive',
    tools: ['newsApi', 'wappalyzer', 'linkedin', 'apollo'],
    maxCost: 0.50, // $0.50
    timeLimit: 60,
    confidenceTarget: 'medium'
  },
  
  deep: {
    phase: 'deep',
    tools: ['newsApi', 'wappalyzer', 'linkedin', 'apollo', 'crunchbase', 'glassdoor'],
    maxCost: 2.00, // $2.00
    timeLimit: 120,
    confidenceTarget: 'high'
  }
}; 