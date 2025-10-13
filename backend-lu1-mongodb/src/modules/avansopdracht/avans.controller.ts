import { Controller, Get, Param, Query } from '@nestjs/common';
import { ModuleService } from './avans.service';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

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

  @Get('search')
  async searchModules(@Query('q') q: string) {
    return this.moduleService.search(q);
  }

  @Get(':id')
  async getModuleById(@Param('id') id: string) {
    return this.moduleService.findOneById(id);
  }
}
