import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CreateResumeDto, ImportResumeDto, ResumeDto, UpdateResumeDto } from "@reactive-resume/dto";
import { defaultResumeData, ResumeData } from "@reactive-resume/schema";
import type { DeepPartial } from "@reactive-resume/utils";
import { ErrorMessage, generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import deepmerge from "deepmerge";
import { PrismaService } from "nestjs-prisma";

import { PrinterService } from "@/server/printer/printer.service";

import { StorageService } from "../storage/storage.service";

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
  ) {}

  // Helper method to transform raw database resume to ResumeDto
  private transformToResumeDto(resume: any): ResumeDto {
    return {
      ...resume,
      data: typeof resume.data === "string" ? JSON.parse(resume.data) : resume.data,
    };
  }

  async create(userId: string, createResumeDto: CreateResumeDto) {
    const { name, email, picture } = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true, picture: true },
    });

    const data = deepmerge(defaultResumeData, {
      basics: { name, email, picture: { url: picture ?? "" } },
    } satisfies DeepPartial<ResumeData>);

    return this.prisma.resume.create({
      data: {
        data: JSON.stringify(data),
        userId,
        title: createResumeDto.title,
        visibility: createResumeDto.visibility,
        slug: createResumeDto.slug ?? slugify(createResumeDto.title),
      },
    });
  }

  import(userId: string, importResumeDto: ImportResumeDto) {
    const randomTitle = generateRandomName();

    return this.prisma.resume.create({
      data: {
        userId,
        visibility: "private",
        data: JSON.stringify(importResumeDto.data),
        title: importResumeDto.title ?? randomTitle,
        slug: importResumeDto.slug ?? slugify(randomTitle),
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } });
  }

  // New method that returns properly transformed ResumeDto array
  async findAllAsDto(userId: string): Promise<ResumeDto[]> {
    const resumes = await this.findAll(userId);
    return resumes.map((resume) => this.transformToResumeDto(resume));
  }

  findOne(id: string, userId?: string) {
    if (userId) {
      return this.prisma.resume.findUniqueOrThrow({ where: { userId_id: { userId, id } } });
    }

    return this.prisma.resume.findUniqueOrThrow({ where: { id } });
  }

  // New method that returns properly transformed ResumeDto
  async findOneAsDto(id: string, userId?: string): Promise<ResumeDto> {
    const resume = await this.findOne(id, userId);
    return this.transformToResumeDto(resume);
  }

  async findOneStatistics(id: string) {
    const result = await this.prisma.statistics.findFirst({
      select: { views: true, downloads: true },
      where: { resumeId: id },
    });

    return {
      views: result?.views ?? 0,
      downloads: result?.downloads ?? 0,
    };
  }

  async findOneByUsernameSlug(username: string, slug: string, userId?: string) {
    const resume = await this.prisma.resume.findFirstOrThrow({
      where: { user: { username }, slug, visibility: "public" },
    });

    // Update statistics: increment the number of views by 1
    if (!userId) {
      await this.prisma.statistics.upsert({
        where: { resumeId: resume.id },
        create: { views: 1, downloads: 0, resumeId: resume.id },
        update: { views: { increment: 1 } },
      });
    }

    return resume;
  }

  // New method that returns properly transformed ResumeDto
  async findOneByUsernameSlugAsDto(
    username: string,
    slug: string,
    userId?: string,
  ): Promise<ResumeDto> {
    const resume = await this.findOneByUsernameSlug(username, slug, userId);
    return this.transformToResumeDto(resume);
  }

  async update(userId: string, id: string, updateResumeDto: UpdateResumeDto) {
    try {
      const { locked } = await this.prisma.resume.findUniqueOrThrow({
        where: { id },
        select: { locked: true },
      });

      if (locked) throw new BadRequestException(ErrorMessage.ResumeLocked);

      return await this.prisma.resume.update({
        data: {
          title: updateResumeDto.title,
          slug: updateResumeDto.slug,
          visibility: updateResumeDto.visibility,
          data: updateResumeDto.data ? JSON.stringify(updateResumeDto.data) : undefined,
        },
        where: { userId_id: { userId, id } },
      });
    } catch (error) {
      if (error.code === "P2025") {
        Logger.error(error);
        throw new InternalServerErrorException(error);
      }
    }
  }

  lock(userId: string, id: string, set: boolean) {
    return this.prisma.resume.update({
      data: { locked: set },
      where: { userId_id: { userId, id } },
    });
  }

  async remove(userId: string, id: string) {
    const logger = new Logger(ResumeService.name);

    try {
      // First, verify the resume exists and belongs to the user
      const resume = await this.prisma.resume.findFirst({
        where: {
          id,
          userId,
        },
        select: {
          id: true,
          title: true,
          locked: true,
          jobApplicationId: true,
        },
      });

      if (!resume) {
        throw new BadRequestException(
          "Resume not found or you do not have permission to delete it",
        );
      }

      if (resume.locked) {
        throw new BadRequestException(ErrorMessage.ResumeLocked);
      }

      logger.log(`Deleting resume: ${resume.title} (${resume.id}) for user ${userId}`);

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Delete storage files in parallel (these don't need to be in transaction)
        const storagePromises = [
          this.storageService.deleteObject(userId, "resumes", id).catch((error) => {
            logger.warn(`Failed to delete resume file for ${id}: ${error.message}`);
          }),
          this.storageService.deleteObject(userId, "previews", id).catch((error) => {
            logger.warn(`Failed to delete preview file for ${id}: ${error.message}`);
          }),
        ];

        // Delete the resume from database (this will cascade delete statistics)
        const deletedResume = await tx.resume.delete({
          where: { userId_id: { userId, id } },
          include: {
            statistics: true,
          },
        });

        // Wait for storage cleanup to complete
        await Promise.allSettled(storagePromises);

        return deletedResume;
      });

      logger.log(`Successfully deleted resume: ${resume.title} (${resume.id})`);

      // Log if this was linked to a job application
      if (resume.jobApplicationId) {
        logger.log(`Deleted resume was linked to job application: ${resume.jobApplicationId}`);
      }

      return result;
    } catch (error) {
      logger.error(
        `Failed to delete resume ${id} for user ${userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to delete resume");
    }
  }

  /**
   * Delete multiple resumes for a user
   */
  async removeBulk(userId: string, resumeIds: string[]) {
    const logger = new Logger(ResumeService.name);

    if (resumeIds.length === 0) {
      throw new BadRequestException("No resume IDs provided");
    }

    if (resumeIds.length > 50) {
      throw new BadRequestException("Cannot delete more than 50 resumes at once");
    }

    try {
      // First, verify all resumes exist and belong to the user
      const resumes = await this.prisma.resume.findMany({
        where: {
          id: { in: resumeIds },
          userId,
        },
        select: {
          id: true,
          title: true,
          locked: true,
          jobApplicationId: true,
        },
      });

      if (resumes.length !== resumeIds.length) {
        const foundIds = new Set(resumes.map((r) => r.id));
        const missingIds = resumeIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `Some resumes not found or you do not have permission: ${missingIds.join(", ")}`,
        );
      }

      const lockedResumes = resumes.filter((r) => r.locked);
      if (lockedResumes.length > 0) {
        throw new BadRequestException(
          `Cannot delete locked resumes: ${lockedResumes.map((r) => r.title).join(", ")}`,
        );
      }

      logger.log(`Bulk deleting ${resumes.length} resumes for user ${userId}`);

      // Use transaction for data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Delete storage files for all resumes in parallel
        const storagePromises = resumeIds.flatMap((id) => [
          this.storageService.deleteObject(userId, "resumes", id).catch((error) => {
            logger.warn(`Failed to delete resume file for ${id}: ${error.message}`);
          }),
          this.storageService.deleteObject(userId, "previews", id).catch((error) => {
            logger.warn(`Failed to delete preview file for ${id}: ${error.message}`);
          }),
        ]);

        // Delete all resumes from database
        const deletedResumes = await tx.resume.deleteMany({
          where: {
            id: { in: resumeIds },
            userId,
          },
        });

        // Wait for storage cleanup to complete
        await Promise.allSettled(storagePromises);

        return deletedResumes;
      });

      logger.log(`Successfully bulk deleted ${result.count} resumes for user ${userId}`);

      return {
        deletedCount: result.count,
        deletedResumes: resumes.map((r) => ({ id: r.id, title: r.title })),
      };
    } catch (error) {
      logger.error(
        `Failed to bulk delete resumes for user ${userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to delete resumes");
    }
  }

  /**
   * Delete all resumes for a user (use with caution)
   */
  async removeAllForUser(userId: string) {
    const logger = new Logger(ResumeService.name);

    try {
      // Get all resume IDs for the user
      const resumes = await this.prisma.resume.findMany({
        where: { userId },
        select: { id: true, title: true, locked: true },
      });

      if (resumes.length === 0) {
        logger.log(`No resumes found for user ${userId}`);
        return { deletedCount: 0, deletedResumes: [] };
      }

      // Check for locked resumes
      const lockedResumes = resumes.filter((r) => r.locked);
      if (lockedResumes.length > 0) {
        throw new BadRequestException(
          `Cannot delete locked resumes: ${lockedResumes.map((r) => r.title).join(", ")}`,
        );
      }

      logger.warn(`Deleting ALL ${resumes.length} resumes for user ${userId}`);

      const resumeIds = resumes.map((r) => r.id);
      return await this.removeBulk(userId, resumeIds);
    } catch (error) {
      logger.error(
        `Failed to delete all resumes for user ${userId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException("Failed to delete all resumes");
    }
  }

  async printResume(resume: ResumeDto, userId?: string) {
    const url = await this.printerService.printResume(resume);

    // Update statistics: increment the number of downloads by 1
    if (!userId) {
      await this.prisma.statistics.upsert({
        where: { resumeId: resume.id },
        create: { views: 0, downloads: 1, resumeId: resume.id },
        update: { downloads: { increment: 1 } },
      });
    }

    return url;
  }

  printPreview(resume: ResumeDto) {
    return this.printerService.printPreview(resume);
  }
}
