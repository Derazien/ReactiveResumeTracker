import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ContentType } from "@prisma/client";
import { CreateContentLibraryDto, UpdateContentLibraryDto } from "@reactive-resume/dto";

// TEMPORARILY COMMENTED OUT FOR TESTING - REMOVE WHEN ADDING AUTH BACK
// import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
// import { User } from "@/server/user/decorators/user.decorator";

import { ContentLibraryService } from "./content-library.service";

// TODO: Temporary mock user ID for testing - replace with actual auth when ready
const MOCK_USER_ID = "mock-user-123";

@ApiTags("Content Library")
@Controller("content-library")
// TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
// @UseGuards(TwoFactorGuard)
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Post()
  create(@Body() createContentLibraryDto: CreateContentLibraryDto) {
    return this.contentLibraryService.create(MOCK_USER_ID, createContentLibraryDto);
  }

  @Get()
  findAll(
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

    return this.contentLibraryService.findAll(MOCK_USER_ID, options);
  }

  @Get("by-type/:type")
  getByType(@Param("type") type: ContentType) {
    return this.contentLibraryService.getContentByType(MOCK_USER_ID, type);
  }

  @Get("by-tags")
  findByTags(@Query("tags") tags: string) {
    const tagArray = tags ? tags.split(",") : [];
    return this.contentLibraryService.findByTags(MOCK_USER_ID, tagArray);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contentLibraryService.findOne(id, MOCK_USER_ID);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateContentLibraryDto: UpdateContentLibraryDto,
  ) {
    return this.contentLibraryService.update(id, MOCK_USER_ID, updateContentLibraryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.contentLibraryService.remove(id, MOCK_USER_ID);
  }
}
