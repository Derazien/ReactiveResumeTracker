import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";

import { LLMController } from "./llm.controller";
import { LLMService } from "./llm.service";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { OpenAIProvider } from "./providers/openai.provider";

@Module({
  imports: [AuthModule],
  controllers: [LLMController],
  providers: [LLMService, AnthropicProvider, OpenAIProvider],
  exports: [LLMService],
})
export class LLMModule {}
