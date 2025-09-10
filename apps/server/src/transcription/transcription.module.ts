import { Module } from "@nestjs/common";

import { TranscriptionController } from "./transcription.controller";
import { TranscriptionService } from "./transcription.service";

@Module({
  controllers: [TranscriptionController],
  providers: [TranscriptionService],
  exports: [TranscriptionService], // Export for use in other modules if needed
})
export class TranscriptionModule {}