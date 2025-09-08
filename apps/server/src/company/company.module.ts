import { Module } from "@nestjs/common";

import { LLMModule } from "../llm/llm.module";
import { CompanyController } from "./company.controller";
import { CompanyResearchService } from "./company-research.service";
import { CompanyService } from "./company.service";

@Module({
  imports: [LLMModule],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyResearchService],
  exports: [CompanyService, CompanyResearchService],
})
export class CompanyModule {}
