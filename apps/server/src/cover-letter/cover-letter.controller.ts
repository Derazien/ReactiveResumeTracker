import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";
import { CoverLetterService } from "./cover-letter.service";

@ApiTags("Cover Letters")
@Controller("cover-letters")
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Get()
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Get all cover letters for the user" })
  async findAll(@User("id") userId: string) {
    return this.coverLetterService.findMany(userId);
  }

  @Get(":id")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Get cover letter by ID" })
  async findOne(
    @User("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.coverLetterService.findOne(id, userId);
  }

  @Post()
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Create a new cover letter" })
  async create(
    @User("id") userId: string,
    @Body() body: {
      content: string;
      templateName?: string;
      tone?: string;
      jobApplicationId: string;
      generatedFrom?: string;
    },
  ) {
    return this.coverLetterService.create(userId, body);
  }

  @Post("empty")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Create an empty cover letter for manual editing" })
  async createEmpty(
    @User("id") userId: string,
    @Body() body: { jobApplicationId: string },
  ) {
    return this.coverLetterService.createEmpty(userId, body.jobApplicationId);
  }

  @Post("generate")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Generate tailored cover letter" })
  async generateTailored(
    @User("id") userId: string,
    @Body() body: {
      jobApplicationId: string;
      templateName?: string;
      tone?: string;
      maxParagraphs?: number;
      selectedStoryIds?: string[];
      recipientName?: string; // Optional contact name
    },
  ) {
    return this.coverLetterService.generateTailoredCoverLetter(
      body.jobApplicationId,
      userId,
      {
        templateName: body.templateName,
        tone: body.tone,
        maxParagraphs: body.maxParagraphs,
        selectedStoryIds: body.selectedStoryIds,
        recipientName: body.recipientName,
      },
    );
  }

  @Put(":id")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Update cover letter" })
  async update(
    @User("id") userId: string,
    @Param("id") id: string,
    @Body() body: {
      content?: string;
      templateName?: string;
      tone?: string;
    },
  ) {
    return this.coverLetterService.update(id, userId, body);
  }

  @Delete(":id")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Delete cover letter" })
  async delete(
    @User("id") userId: string,
    @Param("id") id: string,
  ) {
    await this.coverLetterService.delete(id, userId);
    return { message: "Cover letter deleted successfully" };
  }

  @Get("print/:id")
  @UseGuards(TwoFactorGuard)
  @ApiOperation({ summary: "Print cover letter as PDF" })
  async print(
    @User("id") userId: string,
    @Param("id") id: string,
  ) {
    const url = await this.coverLetterService.printCoverLetter(id, userId);
    return { url };
  }
}
