import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module";
import { JobApplicationQuestionController } from "./job-application-question.controller";
import { JobApplicationQuestionService } from "./job-application-question.service";

@Module({
  imports: [DatabaseModule],
  controllers: [JobApplicationQuestionController],
  providers: [JobApplicationQuestionService],
  exports: [JobApplicationQuestionService],
})
export class JobApplicationQuestionModule {}
