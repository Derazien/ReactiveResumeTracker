import { Module } from "@nestjs/common";

import { EmbeddingModule } from "@/server/embedding/embedding.module";
import { InterviewModule } from "@/server/interview/interview.module";
import { LLMModule } from "@/server/llm/llm.module";

import { CoverLetterContentController } from "./cover-letter-content.controller";
import { CoverLetterContentService } from "./cover-letter-content.service";

@Module({
  imports: [EmbeddingModule, InterviewModule, LLMModule],
  controllers: [CoverLetterContentController],
  providers: [CoverLetterContentService],
  exports: [CoverLetterContentService],
})
export class CoverLetterContentModule {}
