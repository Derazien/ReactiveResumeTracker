import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { UserModule } from "@/server/user/user.module";

import { ContentLibraryModule } from "../content-library/content-library.module";
import { LLMController } from "./llm.controller";
import { LLMService } from "./llm.service";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { LocalLLMProvider } from "./providers/local.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { TagExtractionService } from "./tag-extraction.service";

@Module({
  imports: [AuthModule, UserModule, forwardRef(() => ContentLibraryModule)],
  controllers: [LLMController],
  providers: [
    LLMService,
    AnthropicProvider,
    OpenAIProvider,
    LocalLLMProvider,
    TagExtractionService,
  ],
  exports: [LLMService, TagExtractionService],
})
export class LLMModule {}
