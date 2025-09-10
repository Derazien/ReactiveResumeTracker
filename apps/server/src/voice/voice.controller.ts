import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { AnswerSnippetData, StoryBlockData, VoiceService } from "./voice.service";

@ApiTags("Voice")
@Controller("voice")
@UseGuards(TwoFactorGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get("status")
  @ApiOperation({ summary: "Get voice service status" })
  getStatus() {
    return this.voiceService.getStatus();
  }

  @Post("transcribe")
  @ApiOperation({ summary: "Transcribe audio file to text" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("audio"))
  async transcribeAudio(
    @User("id") userId: string,
    @UploadedFile() audioFile: Express.Multer.File,
  ) {
    if (!audioFile) {
      throw new Error("No audio file provided");
    }

    // Validate file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      throw new Error("Audio file too large. Maximum size is 25MB.");
    }

    // Validate file type (following existing storage pattern)
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/webm"];
    if (!allowedTypes.some((type) => audioFile.mimetype.startsWith(type.split("/")[0]))) {
      throw new Error("Unsupported audio format. Supported formats: MP3, WAV, M4A, OGG, WebM");
    }

    return this.voiceService.transcribeAudio(audioFile.buffer, audioFile.originalname);
  }

  @Post("story-block")
  @ApiOperation({ summary: "Save transcribed text as story block" })
  async saveStoryBlock(@User("id") userId: string, @Body() storyData: StoryBlockData) {
    return this.voiceService.saveStoryBlock(userId, storyData);
  }

  @Post("answer-snippet")
  @ApiOperation({ summary: "Save transcribed text as answer snippet" })
  async saveAnswerSnippet(@User("id") userId: string, @Body() answerData: AnswerSnippetData) {
    return this.voiceService.saveAnswerSnippet(userId, answerData);
  }

  @Get("story-blocks")
  @ApiOperation({ summary: "Get user's story blocks" })
  async getStoryBlocks(@User("id") userId: string) {
    return this.voiceService.getUserStoryBlocks(userId);
  }

  @Get("answer-snippets")
  @ApiOperation({ summary: "Get user's answer snippets" })
  async getAnswerSnippets(@User("id") userId: string) {
    return this.voiceService.getUserAnswerSnippets(userId);
  }

  @Get("search/story-blocks")
  @ApiOperation({ summary: "Search story blocks by similarity" })
  @ApiQuery({ name: "q", description: "Search query text" })
  @ApiQuery({ name: "limit", description: "Maximum number of results", required: false })
  async searchStoryBlocks(
    @User("id") userId: string,
    @Query("q") queryText: string,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!queryText) {
      throw new Error("Query text is required");
    }
    return this.voiceService.searchStoryBlocks(userId, queryText, limit);
  }

  @Get("search/answer-snippets")
  @ApiOperation({ summary: "Search answer snippets by similarity" })
  @ApiQuery({ name: "q", description: "Search query text" })
  @ApiQuery({ name: "questionTag", description: "Filter by question tag", required: false })
  @ApiQuery({ name: "limit", description: "Maximum number of results", required: false })
  async searchAnswerSnippets(
    @User("id") userId: string,
    @Query("q") queryText: string,
    @Query("questionTag") questionTag?: string,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    if (!queryText) {
      throw new Error("Query text is required");
    }
    return this.voiceService.searchAnswerSnippets(userId, queryText, questionTag, limit);
  }
}
