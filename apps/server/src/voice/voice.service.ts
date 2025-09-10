import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "nestjs-prisma";

import { EmbeddingService } from "@/server/embedding/embedding.service";

export type TranscriptionResult = {
  text: string;
  duration?: number;
  language?: string;
};

export type StoryBlockData = {
  text: string;
  tags: string[];
  skillTheme: string;
  tone?: string;
};

export type AnswerSnippetData = {
  text: string;
  questionTag: string;
  tags: string[];
  skillTheme: string;
  tone?: string;
};

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly openaiApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {
    this.openaiApiKey = this.configService.get<string>("OPENAI_API_KEY") || "";

    if (!this.openaiApiKey) {
      this.logger.warn("No OpenAI API key found. Voice transcription will be disabled.");
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeAudio(audioBuffer: Buffer, filename: string): Promise<TranscriptionResult> {
    if (!this.openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      this.logger.debug(`Transcribing audio file: ${filename}`);

      // Use native FormData (Web API) instead of form-data library
      const formData = new FormData();
      // Convert Buffer to ArrayBuffer to ensure type compatibility
      const arrayBuffer = audioBuffer.buffer.slice(
        audioBuffer.byteOffset,
        audioBuffer.byteOffset + audioBuffer.byteLength,
      );
      // Ensure we have a proper ArrayBuffer (not SharedArrayBuffer)
      const safeArrayBuffer =
        arrayBuffer instanceof SharedArrayBuffer
          ? new Uint8Array(arrayBuffer).slice().buffer
          : arrayBuffer;
      formData.append(
        "file",
        new Blob([safeArrayBuffer], { type: this.getAudioMimeType(filename) }),
        filename,
      );
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Whisper API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();

      if (!data.text) {
        throw new Error("No transcription text in Whisper API response");
      }

      this.logger.debug(`Transcription completed: ${data.text.slice(0, 100)}...`);

      return {
        text: data.text.trim(),
        duration: data.duration,
        language: data.language,
      };
    } catch (error) {
      this.logger.error(
        `Failed to transcribe audio: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Save story block with embedding
   */
  async saveStoryBlock(userId: string, storyData: StoryBlockData) {
    try {
      this.logger.debug(`Saving story block for user ${userId}`);

      // Generate embedding for the story text
      const embeddingResult = await this.embeddingService.generateEmbedding(storyData.text);

      const storyBlock = await this.prisma.storyBlock.create({
        data: {
          text: storyData.text,
          tags: JSON.stringify(storyData.tags || []),
          skillTheme: storyData.skillTheme,
          tone: storyData.tone || "neutral",
          embedding: this.embeddingService.serializeEmbedding(embeddingResult.embedding),
          embeddingHash: embeddingResult.hash,
          userId,
        },
      });

      this.logger.debug(`Story block saved with ID: ${storyBlock.id}`);
      return storyBlock;
    } catch (error) {
      this.logger.error(
        `Failed to save story block: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Save answer snippet with embedding
   */
  async saveAnswerSnippet(userId: string, answerData: AnswerSnippetData) {
    try {
      this.logger.debug(`Saving answer snippet for user ${userId}`);

      // Generate embedding for the answer text
      const embeddingResult = await this.embeddingService.generateEmbedding(answerData.text);

      const answerSnippet = await this.prisma.answerSnippet.create({
        data: {
          text: answerData.text,
          questionTag: answerData.questionTag,
          tags: JSON.stringify(answerData.tags || []),
          skillTheme: answerData.skillTheme,
          tone: answerData.tone || "neutral",
          embedding: this.embeddingService.serializeEmbedding(embeddingResult.embedding),
          embeddingHash: embeddingResult.hash,
          userId,
        },
      });

      this.logger.debug(`Answer snippet saved with ID: ${answerSnippet.id}`);
      return answerSnippet;
    } catch (error) {
      this.logger.error(
        `Failed to save answer snippet: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Get user's story blocks
   */
  async getUserStoryBlocks(userId: string) {
    return this.prisma.storyBlock.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get user's answer snippets
   */
  async getUserAnswerSnippets(userId: string) {
    return this.prisma.answerSnippet.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Search story blocks by similarity
   */
  async searchStoryBlocks(userId: string, queryText: string, limit = 10) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(queryText);

      // Get all user's story blocks with embeddings
      const storyBlocks = await this.prisma.storyBlock.findMany({
        where: {
          userId,
          embedding: { not: null },
        },
      });

      // Calculate similarities
      const candidateEmbeddings = storyBlocks.map((block: any) => ({
        id: block.id,
        embedding: this.embeddingService.parseEmbedding(block.embedding),
        metadata: block,
      }));

      const similarities = this.embeddingService.findMostSimilar(
        queryEmbedding.embedding,
        candidateEmbeddings,
        limit,
        0.3, // Minimum similarity threshold
      );

      return similarities.map((result) => ({
        ...result.metadata,
        similarity: result.similarity,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to search story blocks: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Search answer snippets by similarity
   */
  async searchAnswerSnippets(userId: string, queryText: string, questionTag?: string, limit = 10) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.embeddingService.generateEmbedding(queryText);

      // Get answer snippets with optional filtering by question tag
      const whereClause: any = {
        userId,
        embedding: { not: null },
      };

      if (questionTag) {
        whereClause.questionTag = questionTag;
      }

      const answerSnippets = await this.prisma.answerSnippet.findMany({
        where: whereClause,
      });

      // Calculate similarities
      const candidateEmbeddings = answerSnippets.map((snippet: any) => ({
        id: snippet.id,
        embedding: this.embeddingService.parseEmbedding(snippet.embedding),
        metadata: snippet,
      }));

      const similarities = this.embeddingService.findMostSimilar(
        queryEmbedding.embedding,
        candidateEmbeddings,
        limit,
        0.3, // Minimum similarity threshold
      );

      return similarities.map((result) => ({
        ...result.metadata,
        similarity: result.similarity,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to search answer snippets: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      throw error;
    }
  }

  /**
   * Get supported audio MIME type based on file extension
   */
  private getAudioMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();

    switch (ext) {
      case "mp3": {
        return "audio/mpeg";
      }
      case "wav": {
        return "audio/wav";
      }
      case "m4a": {
        return "audio/mp4";
      }
      case "ogg": {
        return "audio/ogg";
      }
      case "webm": {
        return "audio/webm";
      }
      default: {
        return "audio/mpeg";
      } // Default fallback
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      whisperAvailable: !!this.openaiApiKey,
      embeddingAvailable: this.embeddingService.getStatus().available,
    };
  }
}
