import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { UserWithSecrets } from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import { Request } from "express";

import { ResumeService } from "../resume.service";

@Injectable()
export class ResumeGuard implements CanActivate {
  constructor(private readonly resumeService: ResumeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserWithSecrets | false;

    try {
      const resume = await this.resumeService.findOne(
        request.params.id,
        user ? user.id : undefined,
      );

      // First check if the resume is public, if yes, attach the resume to the request payload.
      if (resume.visibility === "public") {
        // Transform the resume data to proper DTO format
        const resumeDto = await this.resumeService.findOneAsDto(
          request.params.id,
          user ? user.id : undefined,
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any).payload = { resume: resumeDto };
      }

      // If the resume is private and the user is authenticated and is the owner of the resume, attach the resume to the request payload.
      // Else, if either the user is not authenticated or is not the owner of the resume, throw a 404 error.
      if (resume.visibility === "private") {
        if (user && user.id === resume.userId) {
          // Transform the resume data to proper DTO format
          const resumeDto = await this.resumeService.findOneAsDto(
            request.params.id,
            user.id,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (request as any).payload = { resume: resumeDto };
        } else {
          throw new NotFoundException(ErrorMessage.ResumeNotFound);
        }
      }

      return true;
    } catch {
      throw new NotFoundException(ErrorMessage.ResumeNotFound);
    }
  }
}
