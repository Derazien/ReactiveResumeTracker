import { idSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const llmProviderSchema = z.enum(["OPENAI", "ANTHROPIC", "GOOGLE", "OLLAMA"]);

export const userLLMSettingsSchema = z.object({
  id: idSchema,
  provider: llmProviderSchema.default("OPENAI"),

  // System Fallback Settings
  useSystemDefaultAsBackup: z.boolean().default(false),

  // OpenAI Settings
  openaiApiKey: z.string().nullable(),
  openaiModel: z.string().default("gpt-4-turbo-preview").nullable(),
  openaiBaseUrl: z.string().nullable(),

  // Anthropic Settings
  anthropicApiKey: z.string().nullable(),
  anthropicModel: z.string().default("claude-3-5-sonnet-20241022").nullable(),

  // Ollama/Local Settings
  ollamaApiKey: z.string().default("sk-1234567890abcdef").nullable(),
  ollamaBaseUrl: z.string().default("http://localhost:11434/v1").nullable(),
  ollamaModel: z.string().default("llama3:8b").nullable(),

  // Skyvern Automation Settings
  skyvernApiKey: z.string().nullable(),
  skyvernBaseUrl: z.string().url().default("http://localhost:8000").nullable(),
  skyvernEnabled: z.boolean().default(false),

  // Common Settings
  maxTokens: z.number().default(4000),
  temperature: z.number().default(0.1),

  userId: idSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const createUserLLMSettingsSchema = userLLMSettingsSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserLLMSettingsSchema = createUserLLMSettingsSchema.partial();

export class CreateUserLLMSettingsDto extends createZodDto(createUserLLMSettingsSchema) {}
export class UpdateUserLLMSettingsDto extends createZodDto(updateUserLLMSettingsSchema) {}
export class UserLLMSettingsDto extends createZodDto(userLLMSettingsSchema) {}

export type LLMProvider = z.infer<typeof llmProviderSchema>;
export type UserLLMSettings = z.infer<typeof userLLMSettingsSchema>;
export type CreateUserLLMSettings = z.infer<typeof createUserLLMSettingsSchema>;
export type UpdateUserLLMSettings = z.infer<typeof updateUserLLMSettingsSchema>;
