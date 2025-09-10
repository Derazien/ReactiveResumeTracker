import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from "@nestjs/swagger";

import { TranscriptionService } from "./transcription.service";

@ApiTags("Transcription")
@Controller("transcription")
export class TranscriptionController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post("whisper")
  @ApiOperation({ summary: "Transcribe audio using OpenAI Whisper API" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({ 
    status: 200, 
    description: "Audio transcribed successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        transcription: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid audio file" })
  @ApiResponse({ status: 500, description: "Transcription failed" })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          "audio/wav",
          "audio/mpeg",
          "audio/mp3",
          "audio/mp4",
          "audio/m4a",
          "audio/ogg",
          "audio/webm",
          "audio/flac",
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    }),
  )
  async transcribeWithWhisper(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No audio file provided");
    }

    // Validate the audio file
    const validation = this.transcriptionService.validateAudioFile(file.buffer, file.mimetype);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Transcribe the audio
    const result = await this.transcriptionService.transcribeWithWhisper(
      file.buffer,
      file.originalname || "audio.wav"
    );

    if (!result.success) {
      throw new InternalServerErrorException(result.error || "Transcription failed");
    }

    return {
      success: true,
      transcription: result.transcription,
    };
  }
}