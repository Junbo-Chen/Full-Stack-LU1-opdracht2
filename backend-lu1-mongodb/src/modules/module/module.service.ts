import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from './schemas/module.schema';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  // Haal alle modules op
  async findAll(): Promise<Module[]> {
    return this.moduleModel.find().exec();
  }

  // Haal één module op via ID
  async findById(id: number): Promise<Module | null> {
    return this.moduleModel.findOne({ id }).exec();
  }

  // Filter modules
  async findByFilters(filters: {
    studycredit?: number;
    level?: string;
    location?: string;
  }): Promise<Module[]> {
    const query: any = {};

    if (filters.studycredit) {
      query.studycredit = filters.studycredit;
    }
    if (filters.level) {
      query.level = filters.level;
    }
    if (filters.location) {
      query.location = filters.location;
    }

    return this.moduleModel.find(query).exec();
  }

  // Zoek modules op naam of beschrijving
  async search(searchTerm: string): Promise<Module[]> {
    return this.moduleModel
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { shortdescription: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      })
      .exec();
  }
}