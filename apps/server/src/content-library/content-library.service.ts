import { Injectable } from "@nestjs/common";
import { ContentLibrary, ContentType, Prisma } from "@prisma/client";
import { CreateContentLibraryDto, UpdateContentLibraryDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ContentLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createContentLibraryDto: CreateContentLibraryDto,
  ): Promise<ContentLibrary> {
    const { tagIds, content, skills, achievements, courses, keywords, ...contentData } = createContentLibraryDto;

    const contentLibrary = await this.prisma.contentLibrary.create({
      data: {
        ...contentData,
        content: JSON.stringify(content),
        skills: JSON.stringify(skills),
        achievements: JSON.stringify(achievements),
        courses: JSON.stringify(courses ?? []),
        keywords: JSON.stringify(keywords ?? []),
        userId,
        tags:
          tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              }
            : undefined,
      } as Prisma.ContentLibraryUncheckedCreateInput,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return contentLibrary;
  }

  async findAll(
    userId: string,
    options?: {
      type?: ContentType;
      search?: string;
      tags?: string[];
      skip?: number;
      take?: number;
    },
  ): Promise<ContentLibrary[]> {
    const where: Prisma.ContentLibraryWhereInput = {
      userId,
      ...(options?.type && { type: options.type }),
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

    return this.prisma.contentLibrary.findMany({
      where,
      include: {
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

  async findOne(id: string, userId: string): Promise<ContentLibrary | null> {
    return this.prisma.contentLibrary.findFirst({
      where: { id, userId },
      include: {
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
  ): Promise<ContentLibrary> {
    const { tagIds, content, skills, achievements, courses, keywords, ...updateData } = updateContentLibraryDto;

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

    return this.prisma.contentLibrary.update({
      where: { id, userId },
      data: processedUpdateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<ContentLibrary> {
    return this.prisma.contentLibrary.delete({
      where: { id, userId },
    });
  }

  async findByTags(userId: string, tags: string[]): Promise<ContentLibrary[]> {
    return this.prisma.contentLibrary.findMany({
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
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getContentByType(userId: string, type: ContentType): Promise<ContentLibrary[]> {
    return this.prisma.contentLibrary.findMany({
      where: { userId, type },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
