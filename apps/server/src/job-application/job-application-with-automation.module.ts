import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { AutomationClientModule } from "@/server/automation-client/automation-client.module";
import { CompanyModule } from "@/server/company/company.module";
import { ContentLibraryModule } from "@/server/content-library/content-library.module";
import { ContentMatchingModule } from "@/server/content-matching/content-matching.module";
import { CoverLetterContentModule } from "@/server/cover-letter-content/cover-letter-content.module";
import { CoverLetterModule } from "@/server/cover-letter/cover-letter.module";
import { DebugModule } from "@/server/debug/debug.module";
import { EmbeddingModule } from "@/server/embedding/embedding.module";
import { LLMModule } from "@/server/llm/llm.module";

import { JobAnalysisService } from "./job-analysis.service";
import { JobApplicationController } from "./job-application.controller";
import { JobApplicationService } from "./job-application.service";
import { ResumeGenerationService } from "./resume-generation.service";

/**
 * Extended JobApplicationModule with automation features
 * Use this module instead of JobApplicationModule when you want automation features enabled
 */
@Module({
  imports: [
    AuthModule,
    AutomationClientModule, // Automation features enabled
    CompanyModule,
    forwardRef(() => ContentLibraryModule),
    forwardRef(() => ContentMatchingModule),
    forwardRef(() => CoverLetterContentModule),
    forwardRef(() => CoverLetterModule),
    DebugModule,
    EmbeddingModule,
    forwardRef(() => LLMModule),
  ],
  controllers: [JobApplicationController],
  providers: [
    JobApplicationService,
    JobAnalysisService,
    ResumeGenerationService,
  ],
  exports: [
    JobApplicationService,
    JobAnalysisService,
    ResumeGenerationService,
  ],
})
export class JobApplicationWithAutomationModule {}
