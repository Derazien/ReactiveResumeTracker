import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  BulkDeleteResumeDto,
  CreateResumeDto,
  DeleteAllResumesDto,
  ImportResumeDto,
  importResumeSchema,
  ResumeDto,
  UpdateResumeDto,
} from "@reactive-resume/dto";
import { resumeDataSchema } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
import { zodToJsonSchema } from "zod-to-json-schema";

import { OptionalGuard } from "@/server/auth/guards/optional.guard";
import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { Resume } from "./decorators/resume.decorator";
import { ResumeGuard } from "./guards/resume.guard";
import { ResumeService } from "./resume.service";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  findAll(@User("id") userId: string) {
    return this.resumeService.findAllAsDto(userId);
  }

  @Get("schema")
  getSchema() {
    return zodToJsonSchema(resumeDataSchema);
  }

  @Get("import/schema")
  getImportSchema() {
    return zodToJsonSchema(importResumeSchema);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  findOne(@Resume() resume: ResumeDto) {
    return resume;
  }

  @Get("/public/:username/:slug")
  @UseGuards(OptionalGuard)
  findOneByUsernameSlug(
    @Param("username") username: string,
    @Param("slug") slug: string,
    @User("id") userId?: string,
  ) {
    return this.resumeService.findOneByUsernameSlugAsDto(username, slug, userId);
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  create(@User("id") userId: string, @Body() createResumeDto: CreateResumeDto) {
    return this.resumeService.create(userId, createResumeDto);
  }

  @Post("import")
  @UseGuards(TwoFactorGuard)
  import(@User("id") userId: string, @Body() data: ImportResumeDto) {
    return this.resumeService.import(userId, data);
  }

  @Patch(":id")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  update(
    @Resume("id") id: string,
    @User("id") userId: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(userId, id, updateResumeDto);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  async remove(@Resume("id") id: string, @User("id") userId: string) {
    return this.resumeService.remove(userId, id);
  }

  @Delete()
  @UseGuards(TwoFactorGuard)
  async removeBulk(@User("id") userId: string, @Body() bulkDeleteDto: BulkDeleteResumeDto) {
    return this.resumeService.removeBulk(userId, bulkDeleteDto.ids);
  }

  @Delete("all/confirm")
  @UseGuards(TwoFactorGuard)
  async removeAll(@User("id") userId: string, @Body() deleteAllDto: DeleteAllResumesDto) {
    return this.resumeService.removeAllForUser(userId);
  }

  @Get("/print/:id")
  @UseGuards(OptionalGuard, ResumeGuard)
  async printResume(@Resume() resume: ResumeDto, @User("id") userId?: string) {
    try {
      const url = await this.resumeService.printResume(resume, userId);
      return { url };
    } catch (error) {
      Logger.error(error);

      if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
        throw new BadRequestException(ErrorMessage.ResumeNotFound);
      }

      throw new InternalServerErrorException(error);
    }
  }
}
