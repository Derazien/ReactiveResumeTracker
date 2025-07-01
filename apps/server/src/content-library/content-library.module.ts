import { forwardRef, Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";
import { LLMModule } from "@/server/llm/llm.module";

import { ContentLibraryController } from "./content-library.controller";
import { ContentLibraryService } from "./content-library.service";

@Module({
  imports: [AuthModule, forwardRef(() => LLMModule)],
  controllers: [ContentLibraryController],
  providers: [ContentLibraryService],
  exports: [ContentLibraryService],
})
export class ContentLibraryModule {}
