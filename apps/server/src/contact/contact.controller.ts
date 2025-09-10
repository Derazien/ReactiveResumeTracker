import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CreateContactDto, UpdateContactDto } from "@reactive-resume/dto";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { ContactService } from "./contact.service";

@Controller("contacts")
@UseGuards(JwtGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  create(@Request() req: any, @Body() createContactDto: CreateContactDto) {
    return this.contactService.create(req.user.id, createContactDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.contactService.findAll(req.user.id);
  }

  @Get(":id")
  findOne(@Request() req: any, @Param("id") id: string) {
    return this.contactService.findOne(req.user.id, id);
  }

  @Get("company/:companyId")
  findByCompany(@Request() req: any, @Param("companyId") companyId: string) {
    return this.contactService.findByCompany(req.user.id, companyId);
  }

  @Get("job-application/:jobApplicationId")
  findByJobApplication(@Request() req: any, @Param("jobApplicationId") jobApplicationId: string) {
    return this.contactService.findByJobApplication(req.user.id, jobApplicationId);
  }

  @Patch(":id")
  update(@Request() req: any, @Param("id") id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(req.user.id, id, updateContactDto);
  }

  @Delete(":id")
  remove(@Request() req: any, @Param("id") id: string) {
    return this.contactService.remove(req.user.id, id);
  }
}
