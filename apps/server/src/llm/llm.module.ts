import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { UserModule } from "@/server/user/user.module";

import { LLMController } from "./llm.controller";
import { LLMService } from "./llm.service";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { LocalLLMProvider } from "./providers/local.provider";
import { OpenAIProvider } from "./providers/openai.provider";

@Module({
  imports: [AuthModule, UserModule],
  controllers: [LLMController],
  providers: [LLMService, AnthropicProvider, OpenAIProvider, LocalLLMProvider],
  exports: [LLMService],
})
export class LLMModule {}
