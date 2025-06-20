import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ContentType } from "@prisma/client";
import { CreateContentLibraryDto, UpdateContentLibraryDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { ContentLibraryService } from "./content-library.service";

@ApiTags("Content Library")
@Controller("content-library")
@UseGuards(TwoFactorGuard)
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Post()
  create(@User("id") userId: string, @Body() createContentLibraryDto: CreateContentLibraryDto) {
    return this.contentLibraryService.create(userId, createContentLibraryDto);
  }

  @Get()
  findAll(
    @User("id") userId: string,
    @Query("type") type?: ContentType,
    @Query("search") search?: string,
    @Query("tags") tags?: string,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    const options = {
      type,
      search,
      tags: tags ? tags.split(",") : undefined,
      skip: skip ? Number.parseInt(skip, 10) : undefined,
      take: take ? Number.parseInt(take, 10) : undefined,
    };

    return this.contentLibraryService.findAll(userId, options);
  }

  @Get("by-type/:type")
  getByType(@User("id") userId: string, @Param("type") type: ContentType) {
    return this.contentLibraryService.getContentByType(userId, type);
  }

  @Get("by-tags")
  findByTags(@User("id") userId: string, @Query("tags") tags: string) {
    const tagArray = tags ? tags.split(",") : [];
    return this.contentLibraryService.findByTags(userId, tagArray);
  }

  @Get(":id")
  findOne(@User("id") userId: string, @Param("id") id: string) {
    return this.contentLibraryService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() updateContentLibraryDto: UpdateContentLibraryDto,
  ) {
    return this.contentLibraryService.update(id, userId, updateContentLibraryDto);
  }

  @Delete(":id")
  remove(@User("id") userId: string, @Param("id") id: string) {
    return this.contentLibraryService.remove(id, userId);
  }
}
