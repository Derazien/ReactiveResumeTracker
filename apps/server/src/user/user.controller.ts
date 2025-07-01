import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Patch,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  CreateUserLLMSettingsDto,
  UpdateUserDto,
  UpdateUserLLMSettingsDto,
  UserDto,
} from "@reactive-resume/dto";
import { ErrorMessage } from "@reactive-resume/utils";
import type { Response } from "express";

import { AuthService } from "../auth/auth.service";
import { TwoFactorGuard } from "../auth/guards/two-factor.guard";
import { User } from "./decorators/user.decorator";
import { UserService } from "./user.service";
import { UserLLMSettingsService } from "./user-llm-settings.service";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userLLMSettingsService: UserLLMSettingsService,
  ) {}

  @Get("me")
  @UseGuards(TwoFactorGuard)
  fetch(@User() user: UserDto) {
    return user;
  }

  @Patch("me")
  @UseGuards(TwoFactorGuard)
  async update(@User("email") email: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      // If user is updating their email, send a verification email
      if (updateUserDto.email && updateUserDto.email !== email) {
        await this.userService.updateByEmail(email, {
          emailVerified: false,
          email: updateUserDto.email,
        });

        await this.authService.sendVerificationEmail(updateUserDto.email);

        email = updateUserDto.email;
      }

      return await this.userService.updateByEmail(email, {
        name: updateUserDto.name,
        picture: updateUserDto.picture,
        username: updateUserDto.username,
        locale: updateUserDto.locale,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      Logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  @Delete("me")
  @UseGuards(TwoFactorGuard)
  async delete(@User("id") id: string, @Res({ passthrough: true }) response: Response) {
    await this.userService.deleteOneById(id);

    response.clearCookie("Authentication");
    response.clearCookie("Refresh");

    response.status(200).send({ message: "Sorry to see you go, goodbye!" });
  }

  @Get("llm-settings")
  @UseGuards(TwoFactorGuard)
  async getLLMSettings(@User("id") userId: string) {
    return await this.userLLMSettingsService.getEffectiveSettings(userId);
  }

  @Patch("llm-settings")
  @UseGuards(TwoFactorGuard)
  async updateLLMSettings(@User("id") userId: string, @Body() data: UpdateUserLLMSettingsDto) {
    return await this.userLLMSettingsService.upsert(userId, data as CreateUserLLMSettingsDto);
  }

  @Delete("llm-settings")
  @UseGuards(TwoFactorGuard)
  async deleteLLMSettings(@User("id") userId: string) {
    await this.userLLMSettingsService.delete(userId);
    return { message: "LLM settings deleted successfully" };
  }
}
