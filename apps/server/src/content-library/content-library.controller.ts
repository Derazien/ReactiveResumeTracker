import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import { ContentType } from "@prisma/client";
import {
  CreateContentLibraryDto,
  UpdateContentLibraryDto,
} from "@reactive-resume/dto";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { User } from "../user/decorators/user.decorator";
import { LLMService } from "../llm/llm.service";

import { ContentLibraryService } from "./content-library.service";

@ApiTags("Content Library")
@Controller("content-library")
@UseGuards(TwoFactorGuard)
export class ContentLibraryController {
  constructor(
    private readonly contentLibraryService: ContentLibraryService,
    private readonly llmService: LLMService,
  ) {}

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

  @Get(":id")
  findOne(@Param("id") id: string, @User("id") userId: string) {
    return this.contentLibraryService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @User("id") userId: string,
    @Body() updateContentLibraryDto: UpdateContentLibraryDto,
  ) {
    return this.contentLibraryService.update(id, userId, updateContentLibraryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.contentLibraryService.remove(id, userId);
  }

  @Get("tags/:tags")
  findByTags(@Param("tags") tags: string, @User("id") userId: string) {
    const tagArray = tags.split(",");
    return this.contentLibraryService.findByTags(userId, tagArray);
  }

  @Get("type/:type")
  getContentByType(@Param("type") type: ContentType, @User("id") userId: string) {
    return this.contentLibraryService.getContentByType(userId, type);
  }

  /**
   * Parse different file types and extract text content
   */
  private async parseFileContent(filePath: string, originalName: string): Promise<string> {
    const fileExtension = path.extname(originalName).toLowerCase();
    
    try {
      switch (fileExtension) {
        case ".txt": {
          return fs.readFileSync(filePath, "utf8");
        }
        
        case ".pdf": {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          return pdfData.text;
        }
        
        case ".docx": {
          const dataBuffer = fs.readFileSync(filePath);
          const result = await mammoth.extractRawText({ buffer: dataBuffer });
          if (result.messages.length > 0) {
            console.warn("DOCX parsing warnings:", result.messages);
          }
          return result.value;
        }
        
        case ".doc": {
          // For .doc files, we'll try mammoth as well (it has limited support for .doc)
          try {
            const dataBuffer = fs.readFileSync(filePath);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            return result.value;
          } catch {
            throw new Error(
              "Unable to parse .doc file. Please convert to .docx or save as .txt for better compatibility."
            );
          }
        }
        
        default: {
          throw new TypeError(`Unsupported file type: ${fileExtension}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse ${fileExtension} file: ${error.message}`);
      }
      throw new Error(`Failed to parse ${fileExtension} file: Unknown error`);
    }
  }

  @Post("extract-cv")
  @UseInterceptors(
    FileInterceptor("cv", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `cv-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [".pdf", ".docx", ".doc", ".txt"];
        const fileExt = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExt)) {
          cb(null, true);
        } else {
          cb(new Error("Only PDF, DOCX, DOC, and TXT files are allowed"), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  async extractCV(@UploadedFile() file: Express.Multer.File, @User("id") userId: string) {
    if (!file) {
      throw new Error("No file uploaded");
    }

    try {
      console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
      
      // Parse the file content based on its type
      const cvText = await this.parseFileContent(file.path, file.originalname);
      
      if (!cvText || cvText.trim().length === 0) {
        throw new TypeError("No text content could be extracted from the file. Please ensure the file contains readable text.");
      }

      console.log(`Extracted ${cvText.length} characters from ${file.originalname}`);
      console.log(`First 200 characters: ${cvText.substring(0, 200)}...`);

      // Get existing content to check for duplicates
      const existingContent = await this.contentLibraryService.findAll(userId);

      // Extract content using LLM
      const extractionResult = await this.llmService.extractCVContentForUser(userId, cvText);

      if (!extractionResult.success) {
        throw new Error(extractionResult.error ?? "Content extraction failed");
      }

      // Detect similar content
      const similarityResult = await this.llmService.detectSimilarContent(
        userId,
        extractionResult.data ?? [],
        existingContent,
      );

      if (!similarityResult.success) {
        // If similarity detection fails, still return extracted content but without similarity info
        return {
          success: true,
          data: (extractionResult.data ?? []).map((item: any) => ({
            ...item,
            isDuplicate: false,
            similarity: 0,
            similarTo: null,
            reason: "Similarity analysis not available",
          })),
          extractedText: cvText.substring(0, 500) + (cvText.length > 500 ? "..." : ""), // Preview of extracted text
        };
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        data: similarityResult.data ?? [],
        extractedText: cvText.substring(0, 500) + (cvText.length > 500 ? "..." : ""), // Preview of extracted text
      };
    } catch (error) {
      // Clean up uploaded file in case of error
      try {
        fs.unlinkSync(file.path);
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = error instanceof Error ? error.message : "CV extraction failed";
      console.error("CV extraction error:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  @Post("save-extracted")
  @UseGuards(TwoFactorGuard)
  async saveExtractedContent(
    @User("id") userId: string,
    @Body() body: { content: any[] },
  ) {
    try {
      const savedContent = [];
      
      for (const item of body.content) {
        if (!item.isDuplicate) {
          // Convert date strings to ISO datetime format if they exist
          const convertDateToISO = (dateStr: string | null | undefined): string | undefined => {
            if (!dateStr) return undefined;
            
            try {
              // If it's already a full datetime, use it as-is
              if (dateStr.includes('T') || dateStr.includes('Z')) {
                return new Date(dateStr).toISOString();
              }
              
              // If it's just a date (YYYY-MM-DD), add time as start of day
              const date = new Date(dateStr + 'T00:00:00.000Z');
              return date.toISOString();
            } catch (error) {
              console.warn(`Failed to convert date "${dateStr}" to ISO format:`, error);
              return undefined;
            }
          };

          const createDto: CreateContentLibraryDto = {
            title: item.title,
            description: item.description,
            content: item.content,
            type: item.type as ContentType,
            company: item.company,
            position: item.position,
            startDate: convertDateToISO(item.startDate),
            endDate: convertDateToISO(item.endDate),
            location: item.location,
            skills: item.skills || [],
            achievements: item.achievements || [],
            courses: item.courses || [],
            keywords: item.keywords || [],
            tagIds: [],
          };

          const saved = await this.contentLibraryService.create(userId, createDto);
          savedContent.push(saved);
        }
      }

      return {
        success: true,
        saved: savedContent.length,
        skipped: body.content.length - savedContent.length,
        data: savedContent,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to save extracted content",
      );
    }
  }
}
