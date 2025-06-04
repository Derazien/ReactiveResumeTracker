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
import { User as UserEntity } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateResumeDto,
  importResumeSchema,
  ResumeDto,
  UpdateResumeDto,
} from "@reactive-resume/dto";
import { resumeDataSchema } from "@reactive-resume/schema";
import { ErrorMessage } from "@reactive-resume/utils";
import { zodToJsonSchema } from "zod-to-json-schema";

import { User } from "@/server/user/decorators/user.decorator";

import { OptionalGuard } from "../auth/guards/optional.guard";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { Resume } from "./decorators/resume.decorator";
import { ResumeGuard } from "./guards/resume.guard";
import { ResumeService } from "./resume.service";

// TODO: Temporary mock user ID for testing - replace with actual auth when ready
const MOCK_USER_ID = "mock-user-123";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get("schema")
  getSchema() {
    return zodToJsonSchema(resumeDataSchema);
  }

  @Post()
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  async create(@Body() createResumeDto: CreateResumeDto) {
    try {
      return await this.resumeService.create(MOCK_USER_ID, createResumeDto);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post("import")
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  async import(@Body() importResumeDto: unknown) {
    try {
      const result = importResumeSchema.parse(importResumeDto);
      return await this.resumeService.import(MOCK_USER_ID, result);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.ResumeSlugAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get()
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  findAll() {
    return this.resumeService.findAll(MOCK_USER_ID);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  findOne(@Resume() resume: ResumeDto) {
    return resume;
  }

  @Get(":id/statistics")
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  findOneStatistics(@Param("id") id: string) {
    return this.resumeService.findOneStatistics(id);
  }

  @Get("/public/:username/:slug")
  @UseGuards(OptionalGuard)
  findOneByUsernameSlug(
    @Param("username") username: string,
    @Param("slug") slug: string,
    @User("id") userId: string,
  ) {
    return this.resumeService.findOneByUsernameSlug(username, slug, userId);
  }

  @Patch(":id")
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  update(
    @Param("id") id: string,
    @Body() updateResumeDto: UpdateResumeDto,
  ) {
    return this.resumeService.update(MOCK_USER_ID, id, updateResumeDto);
  }

  @Patch(":id/lock")
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  lock(@Param("id") id: string, @Body("set") set = true) {
    return this.resumeService.lock(MOCK_USER_ID, id, set);
  }

  @Delete(":id")
  // TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
  // @UseGuards(TwoFactorGuard)
  remove(@Param("id") id: string) {
    return this.resumeService.remove(MOCK_USER_ID, id);
  }

  @Get("/print/:id")
  @UseGuards(OptionalGuard, ResumeGuard)
  async printResume(@User("id") userId: string | undefined, @Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printResume(resume, userId);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get("/print/:id/preview")
  @UseGuards(TwoFactorGuard, ResumeGuard)
  async printPreview(@Resume() resume: ResumeDto) {
    try {
      const url = await this.resumeService.printPreview(resume);

      return { url };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
