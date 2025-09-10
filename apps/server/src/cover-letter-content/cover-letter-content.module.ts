import { Module } from "@nestjs/common";

import { EmbeddingModule } from "@/server/embedding/embedding.module";
import { LLMModule } from "@/server/llm/llm.module";
import { TranscriptionModule } from "@/server/transcription/transcription.module";

import { CoverLetterContentController } from "./cover-letter-content.controller";
import { CoverLetterContentService } from "./cover-letter-content.service";

@Module({
  imports: [EmbeddingModule, LLMModule],
  controllers: [CoverLetterContentController],
  providers: [CoverLetterContentService],
  exports: [CoverLetterContentService],
})
export class CoverLetterContentModule {}
