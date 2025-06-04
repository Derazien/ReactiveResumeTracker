import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";

import { TagController } from "./tag.controller";
import { TagService } from "./tag.service";

@Module({
  imports: [AuthModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
