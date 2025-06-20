import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateTagDto } from "@reactive-resume/dto";

// TEMPORARILY COMMENTED OUT FOR TESTING - REMOVE WHEN ADDING AUTH BACK
// import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
// import { User } from "@/server/user/decorators/user.decorator";

import { TagService } from "./tag.service";

// TODO: Temporary mock user ID for testing - replace with actual auth when ready
const MOCK_USER_ID = "mock-user-123";

@ApiTags("Tags")
@Controller("tags")
// TEMPORARILY COMMENTED OUT FOR TESTING - UNCOMMENT WHEN ADDING AUTH BACK
// @UseGuards(TwoFactorGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(MOCK_USER_ID, createTagDto);
  }

  @Get()
  findAll() {
    return this.tagService.findAll(MOCK_USER_ID);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tagService.findOne(id, MOCK_USER_ID);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTagDto: Partial<CreateTagDto>,
  ) {
    return this.tagService.update(id, MOCK_USER_ID, updateTagDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tagService.remove(id, MOCK_USER_ID);
  }
}
