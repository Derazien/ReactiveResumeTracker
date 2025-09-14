// Job Automation Service
// Handles communication with the automation backend

export interface AutomationStatus {
  skyvern: {
    status: 'running' | 'down';
    url: string;
    uiUrl: string;
  };
  message: string;
  error?: string;
}

export interface JobSearchRequest {
  instruction: string;
  targetUrl?: string;
  maxJobs?: number;
}

export interface AutomationResult {
  success: boolean;
  taskId: string;
  message: string;
  monitorUrl: string;
  skyvernResult?: any;
  error?: string;
}

export interface QuickSearchRequest {
  jobBoard: 'linkedin' | 'indeed' | 'glassdoor' | 'monster';
  searchTerm: string;
  location?: string;
  applyAutomatically?: boolean;
}

class AutomationService {
  private baseUrl = '/api/automation';

  /**
   * Check if automation services are available
   */
  async getStatus(): Promise<AutomationStatus> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) {
      throw new Error('Failed to check automation status');
    }
    return response.json();
  }

  /**
   * Execute job search automation
   */
  async executeJobSearch(request: JobSearchRequest): Promise<AutomationResult> {
    const response = await fetch(`${this.baseUrl}/execute-job-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Job search automation failed');
    }
    return result;
  }

  /**
   * Test automation with a simple task
   */
  async testAutomation(): Promise<AutomationResult> {
    const response = await fetch(`${this.baseUrl}/test-automation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Automation test failed');
    }
    return result;
  }

  /**
   * Get popular job board URLs
   */
  getJobBoardUrls() {
    return {
      linkedin: 'https://linkedin.com/jobs',
      indeed: 'https://indeed.com',
      glassdoor: 'https://glassdoor.com/Jobs',
      monster: 'https://monster.com/jobs',
      dice: 'https://dice.com',
      ziprecruiter: 'https://ziprecruiter.com/Jobs'
    };
  }

  /**
   * Get example automation instructions for different platforms
   */
  getExampleInstructions() {
    return {
      linkedin: [
        "Find React developer jobs in San Francisco and apply to 5 positions",
        "Search for remote frontend engineer roles at tech companies",
        "Apply to senior software engineer positions with salary over $120k",
        "Find JavaScript developer jobs and connect with hiring managers"
      ],
      indeed: [
        "Search for full-stack developer jobs with React and Node.js",
        "Find remote software engineering positions in the US",
        "Apply to JavaScript developer roles at startups",
        "Search for senior developer jobs with competitive salaries"
      ],
      glassdoor: [
        "Find software engineer jobs with great company ratings",
        "Search for developer positions at well-reviewed companies",
        "Apply to frontend roles at companies with good work-life balance"
      ],
      custom: [
        "Navigate to Apple careers and apply to iOS developer positions",
        "Search Google careers for software engineering roles",
        "Find and apply to developer jobs at this company's career page",
        "Extract all available tech positions and their requirements"
      ]
    };
  }

  /**
   * Build Skyvern monitoring URL for a task
   */
  getMonitoringUrl(taskId: string): string {
    return `http://localhost:8080/tasks/${taskId}`;
  }
}

export const automationService = new AutomationService();












