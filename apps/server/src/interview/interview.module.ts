import { Module, forwardRef } from "@nestjs/common";

import { DatabaseModule } from "@/server/database/database.module";
import { ContentLibraryModule } from "@/server/content-library/content-library.module";
import { LLMModule } from "@/server/llm/llm.module";

import { InterviewService } from "./interview.service";

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => ContentLibraryModule),
    forwardRef(() => LLMModule),
  ],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}


