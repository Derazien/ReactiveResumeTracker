import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { LLMModule } from "@/server/llm/llm.module";
import { ContactMessageController } from "./contact-message.controller";
import { ContactMessageService } from "./contact-message.service";

@Module({
  imports: [DatabaseModule, LLMModule],
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
  exports: [ContactMessageService],
})
export class ContactMessageModule {}
