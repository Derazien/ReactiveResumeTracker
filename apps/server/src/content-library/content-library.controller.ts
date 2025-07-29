import * as fs from "node:fs";
import { extname } from "node:path";
import * as path from "node:path";

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
import { CreateContentLibraryDto, UpdateContentLibraryDto } from "@reactive-resume/dto";
import * as mammoth from "mammoth";
import { diskStorage } from "multer";
import pdfParse from "pdf-parse";

import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { LLMService } from "../llm/llm.service";
import { User } from "../user/decorators/user.decorator";
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
    @Query("sectionId") sectionId?: string,
    @Query("search") search?: string,
    @Query("tags") tags?: string,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    const options = {
      sectionId,
      search,
      tags: tags ? tags.split(",") : undefined,
      skip: skip ? Number.parseInt(skip, 10) : undefined,
      take: take ? Number.parseInt(take, 10) : undefined,
    };

    return this.contentLibraryService.findAll(userId, options);
  }

  @Get("sections")
  getAvailableSections() {
    return this.contentLibraryService.getAvailableSections();
  }

  @Get("sections/active")
  getActiveSections() {
    return this.contentLibraryService.getSectionsByStatus(true);
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

  @Get("section/:sectionId")
  getContentBySection(@Param("sectionId") sectionId: string, @User("id") userId: string) {
    return this.contentLibraryService.getContentBySection(userId, sectionId);
  }

  @Get("section-key/:sectionKey")
  getContentBySectionKey(@Param("sectionKey") sectionKey: string, @User("id") userId: string) {
    return this.contentLibraryService.getContentBySectionKey(userId, sectionKey);
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
          // Ignore parsing warnings for now
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
              "Unable to parse .doc file. Please convert to .docx or save as .txt for better compatibility.",
            );
          }
        }

        default: {
          throw new TypeError(`Unsupported file type: ${fileExtension}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(`Failed to parse ${fileExtension} file: ${error.message}`);
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
    try {
      // Processing file

      // Parse the file content based on its type
      const cvText = await this.parseFileContent(file.path, file.originalname);

      if (!cvText || cvText.trim().length === 0) {
        throw new TypeError(
          "No text content could be extracted from the file. Please ensure the file contains readable text.",
        );
      }

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
          data: (extractionResult.data ?? []).map((item: Record<string, unknown>) => ({
            ...item,
            isDuplicate: false,
            similarity: 0,
            similarTo: null,
            reason: "Similarity analysis not available",
          })),
          extractedText: cvText.slice(0, 500) + (cvText.length > 500 ? "..." : ""), // Preview of extracted text
        };
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        success: true,
        data: similarityResult.data ?? [],
        extractedText: cvText.slice(0, 500) + (cvText.length > 500 ? "..." : ""), // Preview of extracted text
      };
    } catch (error) {
      // Clean up uploaded file in case of error
      try {
        fs.unlinkSync(file.path);
      } catch {
        // Ignore cleanup errors
      }

      const errorMessage = error instanceof Error ? error.message : "CV extraction failed";
      throw new TypeError(errorMessage);
    }
  }

  @Post("save-extracted")
  @UseGuards(TwoFactorGuard)
  async saveExtractedContent(@User("id") userId: string, @Body() body: { content: any[] }) {
    try {
      const savedContent = [];

      for (const item of body.content) {
        if (!item.isDuplicate) {
          // Convert date strings to ISO datetime format if they exist
          const convertDateToISO = (dateStr: string | null | undefined): string | undefined => {
            if (!dateStr) return undefined;

            try {
              // If it's already a full datetime, use it as-is
              if (dateStr.includes("T") || dateStr.includes("Z")) {
                return new Date(dateStr).toISOString();
              }

              // If it's just a date (YYYY-MM-DD), add time as start of day
              const date = new Date(dateStr + "T00:00:00.000Z");
              return date.toISOString();
            } catch {
              // Log warning but continue
              return undefined;
            }
          };

          // Prepare section-specific data based on the content type
          let sectionData: any = {};
          
          // Map old fields to new data structure based on section type
          if (item.sectionId) {
            // For experience items
            if (item.company || item.position) {
              sectionData = {
                company: item.company || "",
                position: item.position || "",
                date: (item.startDate && item.endDate 
                  ? `${convertDateToISO(item.startDate)} - ${convertDateToISO(item.endDate)}`
                  : (item.startDate 
                    ? convertDateToISO(item.startDate)
                    : "")),
                location: item.location || "",
                summary: item.description || "",
                url: item.url || "",
                contacts: []
              };
            }
            // For education items
            else if (item.institution || item.studyType) {
              sectionData = {
                institution: item.institution || "",
                studyType: item.studyType || "",
                area: item.area || "",
                score: item.score || "",
                date: (item.startDate && item.endDate 
                  ? `${convertDateToISO(item.startDate)} - ${convertDateToISO(item.endDate)}`
                  : (item.startDate 
                    ? convertDateToISO(item.startDate)
                    : "")),
                summary: item.description || "",
                url: item.url || ""
              };
            }
            // For skills items
            else if (item.skills && item.skills.length > 0) {
              sectionData = {
                name: item.title || "",
                description: item.description || "",
                level: item.proficiencyLevel || 50,
                keywords: item.skills || [],
                showDescription: true,
                showKeywords: true
              };
            }
            // For other items, use the content field as fallback
            else {
              sectionData = item.content || {};
            }
          }

          const createDto: CreateContentLibraryDto = {
            title: item.title,
            description: item.description,
            data: JSON.stringify(sectionData),
            sectionId: item.sectionId,
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
      throw new TypeError(
        error instanceof Error ? error.message : "Failed to save extracted content",
      );
    }
  }
}
