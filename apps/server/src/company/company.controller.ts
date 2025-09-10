import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateCompanyDto, UpdateCompanyDto } from "@reactive-resume/dto";

import { TwoFactorGuard } from "@/server/auth/guards/two-factor.guard";
import { User } from "@/server/user/decorators/user.decorator";

import { CompanyService } from "./company.service";

@ApiTags("Company")
@Controller("company")
@UseGuards(TwoFactorGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: "Create a new company" })
  async create(@User("id") userId: string, @Body() createDto: CreateCompanyDto) {
    return this.companyService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all companies" })
  async findAll() {
    return this.companyService.findAll();
  }

  @Get("search")
  @ApiOperation({ summary: "Search companies by name" })
  async searchByName(@Query("name") name: string) {
    return this.companyService.findByName(name);
  }

  @Get("industry/:industry")
  @ApiOperation({ summary: "Get companies by industry" })
  async findByIndustry(@Param("industry") industry: string) {
    return this.companyService.findByIndustry(industry);
  }

  @Get("analyze")
  @ApiOperation({ summary: "Analyze company from URL" })
  async analyzeFromUrl(@Query("url") url: string) {
    return this.companyService.analyzeFromUrl(url);
  }

  @Post("extract-from-job")
  @ApiOperation({ summary: "Extract company info from job posting" })
  async extractFromJobPosting(@Body() body: { jobDescription: string; companyName: string }) {
    return this.companyService.extractFromJobPosting(body.jobDescription, body.companyName);
  }

  @Post(":id/research")
  @ApiOperation({ summary: "Perform enhanced research on company" })
  async researchCompany(
    @Param("id") id: string,
    @Body() body: { strategy?: "basic" | "comprehensive" | "deep" }
  ) {
    return this.companyService.researchCompany(id, body.strategy || "comprehensive");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get company by ID" })
  async findOne(@Param("id") id: string) {
    return this.companyService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update company" })
  async update(@Param("id") id: string, @Body() updateDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete company" })
  async delete(@Param("id") id: string) {
    return this.companyService.delete(id);
  }
}
