import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ModuleService } from '../../service/avans.service';
import { CreateModuleDto, UpdateModuleDto } from '../../presentation/dto/module.dto';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  // Get all modules with optional filters
  @Get()
  async getAllModules(
    @Query('studycredit') studycredit?: number,
    @Query('level') level?: string,
    @Query('location') location?: string,
  ) {
    if (studycredit || level || location) {
      return this.moduleService.findByFilters({ studycredit, level, location });
    }
    return this.moduleService.findAll();
  }

  // Search modules
  @Get('search')
  async searchModules(@Query('q') q: string) {
    return this.moduleService.search(q);
  }

  // Get single module by ID
  @Get(':id')
  async getModuleById(@Param('id') id: string) {
    return this.moduleService.findOneById(id);
  }

  // Create new module (protected route)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  // Update module (protected route)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateModule(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto
  ) {
    return this.moduleService.update(id, updateModuleDto);
  }

  // Delete module (protected route)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteModule(@Param('id') id: string) {
    await this.moduleService.delete(id);
    return { message: 'Module successfully deleted' };
  }
}