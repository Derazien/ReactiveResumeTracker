import { Injectable } from "@nestjs/common";
import {
  CreateJobApplicationQuestionDto,
  UpdateJobApplicationQuestionDto,
} from "@reactive-resume/dto";
import { PrismaService } from "nestjs-prisma";

@Injectable()
export class JobApplicationQuestionService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateJobApplicationQuestionDto) {
    return this.prisma.jobApplicationQuestion.create({
      data: createQuestionDto,
      include: {
        jobApplication: true,
      },
    });
  }

  async findAll() {
    return this.prisma.jobApplicationQuestion.findMany({
      include: {
        jobApplication: true,
      },
      orderBy: { priority: "asc" },
    });
  }

  async findByJobApplication(jobApplicationId: string) {
    return this.prisma.jobApplicationQuestion.findMany({
      where: { jobApplicationId },
      include: {
        jobApplication: true,
      },
      orderBy: { priority: "asc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.jobApplicationQuestion.findUnique({
      where: { id },
      include: {
        jobApplication: true,
      },
    });
  }

  async update(id: string, updateQuestionDto: UpdateJobApplicationQuestionDto) {
    return this.prisma.jobApplicationQuestion.update({
      where: { id },
      data: updateQuestionDto,
      include: {
        jobApplication: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.jobApplicationQuestion.delete({
      where: { id },
    });
  }

  async generateAnswer(id: string, content: string) {
    // This will be enhanced with LLM integration later
    const question = await this.findOne(id);
    if (!question) {
      throw new Error("Question not found");
    }

    // For now, return a placeholder answer
    // TODO: Integrate with LLM service for answer generation
    return {
      ...question,
      answer: `Generated answer for: ${question.question}`,
    };
  }
}
