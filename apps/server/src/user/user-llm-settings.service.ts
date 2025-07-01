import { Injectable } from "@nestjs/common";
import { UserLLMSettings } from "@prisma/client";
import { CreateUserLLMSettingsDto, UpdateUserLLMSettingsDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class UserLLMSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserLLMSettings | null> {
    return this.prisma.userLLMSettings.findUnique({
      where: { userId },
    });
  }

  async create(userId: string, data: CreateUserLLMSettingsDto): Promise<UserLLMSettings> {
    return this.prisma.userLLMSettings.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(userId: string, data: UpdateUserLLMSettingsDto): Promise<UserLLMSettings> {
    // First try to update existing settings
    const existing = await this.findByUserId(userId);

    if (existing) {
      return this.prisma.userLLMSettings.update({
        where: { userId },
        data,
      });
    } else {
      // Create new settings if none exist
      return this.create(userId, data as CreateUserLLMSettingsDto);
    }
  }

  async upsert(userId: string, data: CreateUserLLMSettingsDto): Promise<UserLLMSettings> {
    return this.prisma.userLLMSettings.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        userId,
      },
    });
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.userLLMSettings.delete({
      where: { userId },
    });
  }

  /**
   * Get user's current LLM configuration or return default settings
   */
  async getEffectiveSettings(userId: string) {
    const settings = await this.findByUserId(userId);

    if (!settings) {
      return {
        provider: "OPENAI" as const,
        useSystemDefaultAsBackup: false,
        openaiApiKey: null,
        openaiModel: "gpt-4-turbo-preview",
        openaiBaseUrl: null,
        anthropicApiKey: null,
        anthropicModel: "claude-3-5-sonnet-20241022",
        ollamaApiKey: "sk-1234567890abcdef",
        ollamaBaseUrl: "http://localhost:11434/v1",
        ollamaModel: "llama3:8b",
        maxTokens: 4000,
        temperature: 0.1,
      };
    }

    return settings;
  }

  /**
   * Check if user has configured API key for their selected provider
   */
  async hasValidConfiguration(userId: string): Promise<boolean> {
    const settings = await this.getEffectiveSettings(userId);

    // Check if user has their own API keys
    const hasUserKeys = this.hasUserApiKeys(settings);

    // User can use LLM if they have either:
    // 1. Their own API keys, OR
    // 2. System backup enabled (system environment keys available)
    return hasUserKeys || settings.useSystemDefaultAsBackup;
  }

  /**
   * Check if user has valid API keys for their selected provider
   */
  private hasUserApiKeys(settings: any): boolean {
    switch (settings.provider) {
      case "OPENAI": {
        return !!settings.openaiApiKey;
      }
      case "ANTHROPIC": {
        return !!settings.anthropicApiKey;
      }
      case "OLLAMA": {
        return !!settings.ollamaBaseUrl; // Ollama might not need API key
      }
      default: {
        return false;
      }
    }
  }
}
