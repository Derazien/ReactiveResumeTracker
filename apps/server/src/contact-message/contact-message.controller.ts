import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CreateContactMessageDto, UpdateContactMessageDto } from "@reactive-resume/dto";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { ContactMessageService } from "./contact-message.service";

@Controller("contact-messages")
@UseGuards(JwtGuard)
export class ContactMessageController {
  constructor(private readonly messageService: ContactMessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateContactMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get("contact/:contactId")
  findByContact(@Param("contactId") contactId: string) {
    return this.messageService.findByContact(contactId);
  }

  @Get("job-application/:jobApplicationId")
  findByJobApplication(@Param("jobApplicationId") jobApplicationId: string) {
    return this.messageService.findByJobApplication(jobApplicationId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.messageService.findOne(id);
  }

  @Post("contact/:contactId/generate")
  generateMessage(
    @Request() req: any,
    @Param("contactId") contactId: string,
    @Body() body: { type: "email" | "linkedin" | "general"; instructions?: string },
  ) {
    return this.messageService.generateMessage(req.user.id, contactId, body.type, body.instructions);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateMessageDto: UpdateContactMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.messageService.remove(id);
  }
}
