import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DebugLoggerService } from "./debug-logger.service";

@Module({
  imports: [ConfigModule],
  providers: [DebugLoggerService],
  exports: [DebugLoggerService],
})
export class DebugModule {}

