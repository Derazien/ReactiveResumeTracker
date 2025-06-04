import { Injectable } from "@nestjs/common";
import { Tag } from "@prisma/client";
import { CreateTagDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto): Promise<Tag> {
    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        color: createTagDto.color,
        userId,
      },
    });
  }

  async findAll(userId: string): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  async findOne(id: string, userId: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: { id, userId },
    });
  }

  async update(id: string, userId: string, updateTagDto: Partial<CreateTagDto>): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id, userId },
      data: updateTagDto,
    });
  }

  async remove(id: string, userId: string): Promise<Tag> {
    return this.prisma.tag.delete({
      where: { id, userId },
    });
  }

  async findOrCreate(userId: string, name: string, color?: string): Promise<Tag> {
    const existingTag = await this.prisma.tag.findFirst({
      where: { userId, name },
    });

    if (existingTag) {
      return existingTag;
    }

    return this.prisma.tag.create({
      data: {
        name,
        color,
        userId,
      },
    });
  }
}
