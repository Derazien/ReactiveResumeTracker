import { CanActivate, ExecutionContext, Injectable, NotImplementedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SkyvernClient } from '../skyvern.client';

/**
 * Skyvern Feature Guard
 * 
 * Prevents access to Skyvern-dependent endpoints when Skyvern is disabled.
 * Returns 501 Not Implemented when SKYVERN_ENABLED=false.
 * 
 * Usage:
 * ```ts
 * @UseGuards(SkyvernEnabledGuard)
 * @Post('execute-workflow')
 * async executeWorkflow() { ... }
 * ```
 * 
 * Or apply to entire controller:
 * ```ts
 * @Controller('automation')
 * @UseGuards(SkyvernEnabledGuard)
 * export class AutomationController { ... }
 * ```
 */
@Injectable()
export class SkyvernEnabledGuard implements CanActivate {
  constructor(
    private readonly skyvernClient: SkyvernClient,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if Skyvern is enabled globally
    if (!this.skyvernClient.isEnabled()) {
      throw new NotImplementedException(
        'Skyvern automation is not enabled on this server. ' +
        'Please contact your administrator to enable SKYVERN_ENABLED=true in server configuration.'
      );
    }

    return true;
  }
}








