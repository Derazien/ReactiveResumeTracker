import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateTagDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { TagService } from "./tag.service";

@ApiTags("Tags")
@Controller("tags")
@UseGuards(TwoFactorGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@User("id") userId: string, @Body() createTagDto: CreateTagDto) {
    return this.tagService.create(userId, createTagDto);
  }

  @Get()
  findAll(@User("id") userId: string) {
    return this.tagService.findAll(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @User("id") userId: string) {
    return this.tagService.findOne(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @User("id") userId: string,
    @Body() updateTagDto: Partial<CreateTagDto>,
  ) {
    return this.tagService.update(id, userId, updateTagDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @User("id") userId: string) {
    return this.tagService.remove(id, userId);
  }
}
