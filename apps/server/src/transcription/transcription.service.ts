import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Config } from "@/server/config/schema";

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(private readonly configService: ConfigService<Config>) {}

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  async transcribeWithWhisper(audioBuffer: Buffer, filename: string): Promise<{
    success: boolean;
    transcription?: string;
    error?: string;
  }> {
    try {
      const openaiApiKey = this.configService.get("OPENAI_API_KEY");
      
      if (!openaiApiKey) {
        this.logger.warn("OpenAI API key not configured");
        return {
          success: false,
          error: "OpenAI API key not configured"
        };
      }

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Create blob from buffer
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/wav' });
      formData.append('file', audioBlob, filename);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Can be made configurable
      formData.append('response_format', 'json');

      this.logger.debug("Sending audio to OpenAI Whisper API");

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Whisper API error: ${response.status} - ${errorText}`);
        return {
          success: false,
          error: `Whisper API error: ${response.status}`
        };
      }

      const result = await response.json();
      
      this.logger.debug(`Transcription successful: ${result.text?.slice(0, 100)}...`);

      return {
        success: true,
        transcription: result.text
      };

    } catch (error) {
      this.logger.error("Error transcribing audio with Whisper:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown transcription error"
      };
    }
  }

  /**
   * Validate audio file format and size
   */
  validateAudioFile(buffer: Buffer, mimetype: string): {
    valid: boolean;
    error?: string;
  } {
    // Check file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (buffer.length > maxSize) {
      return {
        valid: false,
        error: "Audio file too large (max 25MB)"
      };
    }

    // Check supported formats
    const supportedTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/m4a',
      'audio/ogg',
      'audio/webm',
      'audio/flac'
    ];

    if (!supportedTypes.includes(mimetype)) {
      return {
        valid: false,
        error: `Unsupported audio format: ${mimetype}`
      };
    }

    return { valid: true };
  }
}