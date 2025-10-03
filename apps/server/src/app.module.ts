import path from "node:path";

import { Module } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
// import { RavenInterceptor, RavenModule } from "nest-raven"; // TODO: Replace with compatible Sentry integration
import { ZodValidationPipe } from "nestjs-zod";

import { AuthModule } from "./auth/auth.module";
import { AutomationIntegrationController } from "./automation-integration.controller";
import { CompanyModule } from "./company/company.module";
import { CompanyService } from "./company/company.service";
import { ConfigModule } from "./config/config.module";
import { ContactModule } from "./contact/contact.module";
import { ContactService } from "./contact/contact.service";
import { ContactMessageModule } from "./contact-message/contact-message.module";
import { ContentLibraryModule } from "./content-library/content-library.module";
import { ContributorsModule } from "./contributors/contributors.module";
import { CoverLetterModule } from "./cover-letter/cover-letter.module";
import { CoverLetterContentModule } from "./cover-letter-content/cover-letter-content.module";
import { DatabaseModule } from "./database/database.module";
import { EmbeddingModule } from "./embedding/embedding.module";
import { FeatureModule } from "./feature/feature.module";
import { HealthModule } from "./health/health.module";
import { SkyvernModule } from "./integrations/skyvern";
import { JobApplicationModule } from "./job-application/job-application.module";
import { JobApplicationService } from "./job-application/job-application.service";
import { JobApplicationQuestionModule } from "./job-application-question/job-application-question.module";
import { LLMModule } from "./llm/llm.module";
import { MailModule } from "./mail/mail.module";
import { PrinterModule } from "./printer/printer.module";
import { ResumeModule } from "./resume/resume.module";
import { StorageModule } from "./storage/storage.module";
import { TagModule } from "./tag/tag.module";
import { TranscriptionModule } from "./transcription/transcription.module";
import { TranslationModule } from "./translation/translation.module";
import { UserModule } from "./user/user.module";
@Module({
  imports: [
    // Core Modules
    ConfigModule,
    DatabaseModule,
    MailModule,
    // RavenModule, // TODO: Replace with compatible Sentry integration
    HealthModule,

    // Feature Modules
    AuthModule.register(),
    UserModule,
    ResumeModule,
    JobApplicationModule,
    ContentLibraryModule,
    CoverLetterModule,
    CoverLetterContentModule,
    CompanyModule,
    ContactModule,
    JobApplicationQuestionModule,
    ContactMessageModule,
    TagModule,
    TranscriptionModule,
    LLMModule,
    StorageModule,
    PrinterModule,
    FeatureModule,
    TranslationModule,
    ContributorsModule,
    EmbeddingModule,

    // External Integrations
    SkyvernModule,

    // Static Assets
    ServeStaticModule.forRoot({
      serveRoot: "/artboard",
      // eslint-disable-next-line unicorn/prefer-module
      rootPath: path.join(__dirname, "..", "artboard"),
    }),
    ServeStaticModule.forRoot({
      renderPath: "/*",
      // eslint-disable-next-line unicorn/prefer-module
      rootPath: path.join(__dirname, "..", "client"),
    }),
  ],
  controllers: [AutomationIntegrationController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    // TODO: Replace RavenInterceptor with compatible Sentry integration
    // {
    //   provide: APP_INTERCEPTOR,
    //   useValue: new RavenInterceptor({
    //     filters: [
    //       // Filter all HttpException with status code <= 500
    //       {
    //         type: HttpException,
    //         filter: (exception: HttpException) => exception.getStatus() < 500,
    //       },
    //     ],
    //   }),
    // },
  ],
})
export class AppModule {}
