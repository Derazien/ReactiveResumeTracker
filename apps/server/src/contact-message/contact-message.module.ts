import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { ContactMessageController } from "./contact-message.controller";
import { ContactMessageService } from "./contact-message.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
  exports: [ContactMessageService],
})
export class ContactMessageModule {}
