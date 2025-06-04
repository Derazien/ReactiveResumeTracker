import { Module } from "@nestjs/common";

import { AuthModule } from "@/server/auth/auth.module";

import { ContentLibraryController } from "./content-library.controller";
import { ContentLibraryService } from "./content-library.service";

@Module({
  imports: [AuthModule],
  controllers: [ContentLibraryController],
  providers: [ContentLibraryService],
  exports: [ContentLibraryService],
})
export class ContentLibraryModule {}
