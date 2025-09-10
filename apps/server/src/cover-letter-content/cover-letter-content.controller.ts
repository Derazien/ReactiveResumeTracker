import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateCoverLetterContentDto, UpdateCoverLetterContentDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { CoverLetterContentService } from "./cover-letter-content.service";

@ApiTags("Cover Letter Content")
@Controller("cover-letter-content")
@UseGuards(TwoFactorGuard)
export class CoverLetterContentController {
  constructor(private readonly coverLetterContentService: CoverLetterContentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new cover letter content entry" })
  async create(@User("id") userId: string, @Body() createDto: CreateCoverLetterContentDto) {
    return this.coverLetterContentService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all cover letter content for the user" })
  async findAll(@User("id") userId: string) {
    return this.coverLetterContentService.findAllByUser(userId);
  }

  @Get("search")
  @ApiOperation({ summary: "Search for similar stories" })
  async searchSimilar(
    @User("id") userId: string,
    @Query("q") query: string,
    @Query("limit") limit?: string,
  ) {
    const limitNumber = limit ? Number.parseInt(limit, 10) : 10;
    return this.coverLetterContentService.findSimilarStories(query, userId, limitNumber);
  }

  @Get("by-content/:contentId")
  @ApiOperation({ summary: "Get cover letter content by content ID" })
  async findByContentId(@User("id") userId: string, @Param("contentId") contentId: string) {
    return this.coverLetterContentService.findByContentId(contentId, userId);
  }

  @Get("by-type/:contentType")
  @ApiOperation({ summary: "Get cover letter content by type" })
  async findByType(@User("id") userId: string, @Param("contentType") contentType: string) {
    return this.coverLetterContentService.findByType(contentType as any, userId);
  }

  @Get("select-for-job")
  @ApiOperation({ summary: "Select best stories for a job application" })
  async selectForJob(
    @User("id") userId: string,
    @Query("description") jobDescription: string,
    @Query("maxStories") maxStories?: string,
  ) {
    const maxStoriesNumber = maxStories ? Number.parseInt(maxStories, 10) : 3;
    return this.coverLetterContentService.selectBestStoriesForJob(
      jobDescription,
      userId,
      maxStoriesNumber,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get cover letter content by ID" })
  async findOne(@User("id") userId: string, @Param("id") id: string) {
    return this.coverLetterContentService.findOne(id, userId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update cover letter content" })
  async update(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() updateDto: UpdateCoverLetterContentDto,
  ) {
    return this.coverLetterContentService.update(id, userId, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete cover letter content" })
  async delete(@User("id") userId: string, @Param("id") id: string) {
    return this.coverLetterContentService.delete(id, userId);
  }

  @Post("extract-from-interview")
  @ApiOperation({ summary: "Extract stories from interview responses" })
  async extractFromInterview(
    @User("id") userId: string,
    @Body()
    body: {
      responses: Array<{ question: string; answer: string }>;
    },
  ) {
    return this.coverLetterContentService.extractStoriesFromInterview(
      body.responses,
      userId,
    );
  }
}
