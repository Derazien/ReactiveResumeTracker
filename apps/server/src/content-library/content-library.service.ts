import { Injectable } from "@nestjs/common";
import { Content, Prisma } from "@prisma/client";
import { CreateContentLibraryDto, UpdateContentLibraryDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ContentLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createContentLibraryDto: CreateContentLibraryDto): Promise<Content> {
    const { tagIds, content, skills, achievements, courses, keywords, sectionId, ...contentData } =
      createContentLibraryDto;

    const contentItem = await this.prisma.content.create({
      data: {
        ...contentData,
        content: JSON.stringify(content),
        skills: JSON.stringify(skills),
        achievements: JSON.stringify(achievements),
        courses: JSON.stringify(courses || []),
        keywords: JSON.stringify(keywords || []),
        sectionId,
        userId,
        tags:
          tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
      } as Prisma.ContentUncheckedCreateInput,
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return contentItem;
  }

  async findAll(
    userId: string,
    options?: {
      sectionId?: string;
      search?: string;
      tags?: string[];
      skip?: number;
      take?: number;
    },
  ): Promise<Content[]> {
    const where: Prisma.ContentWhereInput = {
      userId,
      ...(options?.sectionId && { sectionId: options.sectionId }),
      ...(options?.search && {
        OR: [
          { title: { contains: options.search } },
          { description: { contains: options.search } },
          { company: { contains: options.search } },
          { position: { contains: options.search } },
        ],
      }),
      ...(options?.tags?.length && {
        tags: {
          some: {
            tag: {
              name: { in: options.tags },
            },
          },
        },
      }),
    };

    return await this.prisma.content.findMany({
      where,
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    });
  }

  async findOne(id: string, userId: string): Promise<Content | null> {
    return await this.prisma.content.findFirst({
      where: { id, userId },
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateContentLibraryDto: UpdateContentLibraryDto,
  ): Promise<Content> {
    const { tagIds, content, skills, achievements, courses, keywords, ...updateData } =
      updateContentLibraryDto;

    // Convert arrays and objects to JSON strings
    const processedUpdateData = {
      ...updateData,
      ...(content !== undefined && { content: JSON.stringify(content) }),
      ...(skills !== undefined && { skills: JSON.stringify(skills) }),
      ...(achievements !== undefined && { achievements: JSON.stringify(achievements) }),
      ...(courses !== undefined && { courses: JSON.stringify(courses) }),
      ...(keywords !== undefined && { keywords: JSON.stringify(keywords) }),
    };

    // If tagIds are provided, update the tag associations
    if (tagIds !== undefined) {
      // First, remove all existing tag associations
      await this.prisma.contentTag.deleteMany({
        where: { contentId: id },
      });

      // Then create new associations
      if (tagIds.length > 0) {
        await this.prisma.contentTag.createMany({
          data: tagIds.map((tagId) => ({
            contentId: id,
            tagId,
          })),
        });
      }
    }

    return await this.prisma.content.update({
      where: { id, userId },
      data: processedUpdateData,
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<Content> {
    return await this.prisma.content.delete({
      where: { id, userId },
    });
  }

  async findByTags(userId: string, tags: string[]): Promise<Content[]> {
    return await this.prisma.content.findMany({
      where: {
        userId,
        tags: {
          some: {
            tag: {
              name: { in: tags },
            },
          },
        },
      },
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getContentBySection(userId: string, sectionId: string): Promise<Content[]> {
    return await this.prisma.content.findMany({
      where: { userId, sectionId },
      include: {
        section: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // New method to get available sections
  async getAvailableSections() {
    return await this.prisma.section.findMany({
      orderBy: { order: "asc" },
    });
  }

  // New method to get sections by activity status
  async getSectionsByStatus(isActive?: boolean) {
    const where = isActive === undefined ? {} : { isActive };
    return await this.prisma.section.findMany({
      where,
      orderBy: { order: "asc" },
    });
  }
}
