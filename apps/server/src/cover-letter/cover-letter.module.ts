import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { LLMModule } from "../llm/llm.module";
import { PrinterModule } from "../printer/printer.module";
import { CoverLetterController } from "./cover-letter.controller";
import { CoverLetterService } from "./cover-letter.service";

@Module({
  imports: [DatabaseModule, LLMModule, PrinterModule],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
  exports: [CoverLetterService],
})
export class CoverLetterModule {}

