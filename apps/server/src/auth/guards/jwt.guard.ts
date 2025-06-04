import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isDevelopment = this.configService.get("NODE_ENV") === "development";
    
    if (isDevelopment) {
      // In development mode, bypass auth and create/use a default user
      const request = context.switchToHttp().getRequest();
      
      try {
        // Try to find or create a default user
        let defaultUser = await this.prisma.user.findFirst({
          include: { secrets: true },
        });

        if (!defaultUser) {
          // Create a default user for development
          defaultUser = await this.prisma.user.create({
            data: {
              name: "Dev User",
              email: "dev@localhost",
              username: "devuser",
              provider: "email",
              emailVerified: true,
              secrets: {
                create: {
                  password: null, // No password needed for dev mode
                },
              },
            },
            include: { secrets: true },
          });
          this.logger.log("Created default user for development mode");
        }

        request.user = defaultUser;
        return true;
      } catch (error) {
        this.logger.error("Failed to create/find default user:", error);
        // Fall back to normal auth
      }
    }

    // Normal JWT authentication for production
    return super.canActivate(context) as Promise<boolean>;
  }
}
