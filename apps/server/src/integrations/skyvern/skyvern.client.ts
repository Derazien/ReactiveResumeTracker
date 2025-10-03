import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@/server/config/schema';

/**
 * Skyvern HTTP Client
 * 
 * Centralized client for all Skyvern API interactions.
 * Reads configuration from environment variables and provides
 * a consistent interface for calling Skyvern endpoints.
 * 
 * @see https://docs.skyvern.com/introduction
 */
@Injectable()
export class SkyvernClient {
  private readonly logger = new Logger(SkyvernClient.name);
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService<Config>) {
    this.enabled = this.configService.get('SKYVERN_ENABLED') ?? false;
    this.baseUrl = this.configService.get('SKYVERN_BASE_URL') ?? 'http://localhost:8000';
    this.timeout = this.configService.get('SKYVERN_TIMEOUT_MS') ?? 30000;

    if (this.enabled) {
      this.logger.log(`Skyvern client initialized: ${this.baseUrl}`);
    } else {
      this.logger.warn('Skyvern is DISABLED - automation endpoints will return 501');
    }
  }

  /**
   * Check if Skyvern is enabled globally
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the configured Skyvern base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the configured timeout
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Make a GET request to Skyvern API
   */
  async get<T = any>(
    endpoint: string,
    apiKey: string,
    options?: RequestInit
  ): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'x-api-key': apiKey, // Skyvern accepts both formats
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Skyvern GET ${endpoint} failed: ${response.status}`, data);
        return {
          ok: false,
          status: response.status,
          data: null as T,
          error: data.detail || data.message || `HTTP ${response.status}`,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (error) {
      this.logger.error(`Skyvern GET ${endpoint} error:`, error);
      return {
        ok: false,
        status: 0,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make a POST request to Skyvern API
   */
  async post<T = any>(
    endpoint: string,
    apiKey: string,
    body?: any,
    options?: RequestInit
  ): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'x-api-key': apiKey,
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`Skyvern POST ${endpoint} failed: ${response.status}`, data);
        return {
          ok: false,
          status: response.status,
          data: null as T,
          error: data.detail || data.message || `HTTP ${response.status}`,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (error) {
      this.logger.error(`Skyvern POST ${endpoint} error:`, error);
      return {
        ok: false,
        status: 0,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Make a DELETE request to Skyvern API
   */
  async delete<T = any>(
    endpoint: string,
    apiKey: string,
    options?: RequestInit
  ): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-API-Key': apiKey,
          'x-api-key': apiKey,
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      // DELETE might return empty response
      let data: T | undefined;
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }

      if (!response.ok) {
        this.logger.error(`Skyvern DELETE ${endpoint} failed: ${response.status}`, data);
        return {
          ok: false,
          status: response.status,
          data,
          error: (data as any)?.detail || (data as any)?.message || `HTTP ${response.status}`,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (error) {
      this.logger.error(`Skyvern DELETE ${endpoint} error:`, error);
      return {
        ok: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if Skyvern service is reachable
   */
  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled) {
      return { healthy: false, message: 'Skyvern is disabled in configuration' };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s health check timeout

      const response = await fetch(this.baseUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Skyvern is healthy if we get any response < 500
      const healthy = response.status < 500;
      return {
        healthy,
        message: healthy 
          ? `Skyvern is reachable at ${this.baseUrl}` 
          : `Skyvern returned ${response.status}`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Failed to reach Skyvern',
      };
    }
  }

  /**
   * Build webhook callback URL for Skyvern workflows
   * This URL allows Skyvern to send results back to our server
   */
  getWebhookCallbackUrl(userId: string, endpoint: string = '/api/automation/process-linkedin-jobs'): string {
    // Use host.docker.internal for local Docker communication
    // In production, this should be the public server URL
    const serverUrl = this.baseUrl.includes('localhost') 
      ? 'http://host.docker.internal:3000'
      : this.configService.get('PUBLIC_URL');

    return `${serverUrl}${endpoint}?userId=${encodeURIComponent(userId)}`;
  }
}








