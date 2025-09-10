import { Module } from "@nestjs/common";

import { EmbeddingModule } from "@/server/embedding/embedding.module";

import { VoiceController } from "./voice.controller";
import { VoiceService } from "./voice.service";

@Module({
  imports: [EmbeddingModule],
  controllers: [VoiceController],
  providers: [VoiceService],
  exports: [VoiceService],
})
export class VoiceModule {}
