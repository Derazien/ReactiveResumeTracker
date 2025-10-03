import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SkyvernClient } from './skyvern.client';

/**
 * Skyvern Integration Module
 * 
 * Provides centralized access to Skyvern automation service.
 * Import this module to use the SkyvernClient in your controllers/services.
 * 
 * Configuration via environment variables:
 * - SKYVERN_ENABLED: Enable/disable Skyvern globally
 * - SKYVERN_BASE_URL: Base URL of Skyvern instance
 * - SKYVERN_TIMEOUT_MS: HTTP request timeout
 * 
 * @see https://docs.skyvern.com/introduction
 */
@Module({
  imports: [ConfigModule],
  providers: [SkyvernClient],
  exports: [SkyvernClient],
})
export class SkyvernModule {}








