import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import {
  CreateJobApplicationQuestionDto,
  UpdateJobApplicationQuestionDto,
} from "@reactive-resume/dto";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { JobApplicationQuestionService } from "./job-application-question.service";

@Controller("job-application-questions")
@UseGuards(JwtGuard)
export class JobApplicationQuestionController {
  constructor(private readonly questionService: JobApplicationQuestionService) {}

  @Post()
  create(@Body() createQuestionDto: CreateJobApplicationQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Get()
  findAll() {
    return this.questionService.findAll();
  }

  @Get("job-application/:jobApplicationId")
  findByJobApplication(@Param("jobApplicationId") jobApplicationId: string) {
    return this.questionService.findByJobApplication(jobApplicationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.questionService.findOne(id);
  }

  @Post(":id/generate-answer")
  generateAnswer(@Param("id") id: string, @Body() body: { content: string }) {
    return this.questionService.generateAnswer(id, body.content);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateQuestionDto: UpdateJobApplicationQuestionDto) {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.questionService.remove(id);
  }
}
