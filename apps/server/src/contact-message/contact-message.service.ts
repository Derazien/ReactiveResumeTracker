import { Injectable } from "@nestjs/common";
import { CreateContactMessageDto, UpdateContactMessageDto } from "@reactive-resume/dto";
import { LLMService } from "@/server/llm/llm.service";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class ContactMessageService {
  constructor(
    private prisma: PrismaService,
    private readonly llmService: LLMService,
  ) {}

  async create(createMessageDto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: createMessageDto,
      include: {
        contact: true,
        jobApplication: true,
      },
    });
  }

  async findAll() {
    return this.prisma.contactMessage.findMany({
      include: {
        contact: true,
        jobApplication: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByContact(contactId: string) {
    return this.prisma.contactMessage.findMany({
      where: { contactId },
      include: {
        contact: true,
        jobApplication: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByJobApplication(jobApplicationId: string) {
    return this.prisma.contactMessage.findMany({
      where: { jobApplicationId },
      include: {
        contact: true,
        jobApplication: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.contactMessage.findUnique({
      where: { id },
      include: {
        contact: true,
        jobApplication: true,
      },
    });
  }

  async update(id: string, updateMessageDto: UpdateContactMessageDto) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: updateMessageDto,
      include: {
        contact: true,
        jobApplication: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.contactMessage.delete({
      where: { id },
    });
  }

  async generateMessage(
    userId: string,
    contactId: string,
    type: "email" | "linkedin" | "general",
    instructions?: string,
  ) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        company: true,
        jobApplication: true,
      },
    });

    if (!contact) {
      throw new Error("Contact not found");
    }

    const result = await this.llmService.generateContactMessage(
      userId,
      contact,
      type,
      contact.jobApplicationId
        ? await this.prisma.jobApplication.findUnique({ where: { id: contact.jobApplicationId } })
        : null,
      instructions,
    );

    const content =
      result?.success && result.data
        ? result.data.message
        : `Generated ${type} message for ${contact.name}`;

    return this.create({
      type,
      content,
      instructions: instructions ?? "",
      status: "DRAFT",
      contactId,
      jobApplicationId: contact.jobApplicationId ?? undefined,
    });
  }
}
