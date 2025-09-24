import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { ContentMatchingModule } from "@/server/content-matching/content-matching.module";
import { EmbeddingModule } from "@/server/embedding/embedding.module";
import { UserModule } from "@/server/user/user.module";

import { ContentLibraryModule } from "../content-library/content-library.module";
import { LLMController } from "./llm.controller";
import { LLMService } from "./llm.service";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { LocalLLMProvider } from "./providers/local.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { TagExtractionService } from "./tag-extraction.service";
import { LlmOptimizationService } from "./llm-optimization.service";

@Module({
  imports: [
    AuthModule,
    UserModule,
    EmbeddingModule,
    forwardRef(() => ContentLibraryModule),
    forwardRef(() => ContentMatchingModule),
  ],
  controllers: [LLMController],
  providers: [
    LLMService,
    AnthropicProvider,
    OpenAIProvider,
    LocalLLMProvider,
    TagExtractionService,
    LlmOptimizationService,
  ],
  exports: [LLMService, TagExtractionService],
})
export class LLMModule {}
