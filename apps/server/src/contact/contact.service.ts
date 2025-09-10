import { Injectable } from "@nestjs/common";
import { CreateContactDto, UpdateContactDto } from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createContactDto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        ...createContactDto,
        userId,
      },
      include: {
        company: true,
        jobApplication: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.contact.findMany({
      where: { userId },
      include: {
        company: true,
        jobApplication: true,
        messages: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.contact.findFirst({
      where: { id, userId },
      include: {
        company: true,
        jobApplication: true,
        messages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findByCompany(userId: string, companyId: string) {
    return this.prisma.contact.findMany({
      where: { userId, companyId },
      include: {
        company: true,
        jobApplication: true,
        messages: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByJobApplication(userId: string, jobApplicationId: string) {
    return this.prisma.contact.findMany({
      where: { userId, jobApplicationId },
      include: {
        company: true,
        jobApplication: true,
        messages: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(userId: string, id: string, updateContactDto: UpdateContactDto) {
    return this.prisma.contact.update({
      where: { id, userId },
      data: updateContactDto,
      include: {
        company: true,
        jobApplication: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.contact.delete({
      where: { id, userId },
    });
  }
}
