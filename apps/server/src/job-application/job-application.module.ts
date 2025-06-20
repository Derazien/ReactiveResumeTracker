import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { ContentLibraryModule } from "@/server/content-library/content-library.module";
import { LLMModule } from "@/server/llm/llm.module";

import { JobApplicationController } from "./job-application.controller";
import { JobApplicationService } from "./job-application.service";

@Module({
  imports: [AuthModule, ContentLibraryModule, LLMModule],
  controllers: [JobApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
