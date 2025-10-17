import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from '../infrastructure/database/avansopdracht.schema';
import { CreateModuleDto, UpdateModuleDto } from '../presentation/dto/module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  // Get all modules
  async findAll(): Promise<Module[]> {
    return this.moduleModel.find().exec();
  }

  // Find module by id
  async findOneById(id: number | string): Promise<Module | null> {
    const module = await this.moduleModel.findOne({ id }).exec();
    if (!module) {
      throw new NotFoundException(`Module with id ${id} not found`);
    }
    return module;
  }

  // Filter modules
  async findByFilters(filters: {
    studycredit?: number;
    level?: string;
    location?: string;
  }): Promise<Module[]> {
    const query: any = {};

    if (filters.studycredit) query.studycredit = filters.studycredit;
    if (filters.level) query.level = filters.level;
    if (filters.location) query.location = filters.location;

    return this.moduleModel.find(query).exec();
  }

  // Search modules
  async search(searchTerm: string): Promise<Module[]> {
    const regex = { $regex: searchTerm, $options: 'i' };
    return this.moduleModel
      .find({
        $or: [
          { name: regex },
          { shortdescription: regex },
          { description: regex },
        ],
      })
      .exec();
  }

  // Create new module
  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    // Check if module with same id already exists
    const existingModule = await this.moduleModel.findOne({ id: createModuleDto.id });
    if (existingModule) {
      throw new ConflictException(`Module with id ${createModuleDto.id} already exists`);
    }

    const newModule = new this.moduleModel(createModuleDto);
    return newModule.save();
  }

  // Update module
  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.moduleModel.findOneAndUpdate(
      { id },
      { $set: updateModuleDto },
      { new: true }
    ).exec();

    if (!module) {
      throw new NotFoundException(`Module with id ${id} not found`);
    }

    return module;
  }

  // Delete module
  async delete(id: string): Promise<void> {
    const result = await this.moduleModel.deleteOne({ id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Module with id ${id} not found`);
    }
  }
}