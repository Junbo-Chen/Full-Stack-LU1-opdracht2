import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module, ModuleDocument } from './schemas/avansopdracht.schema';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  // Alle modules
  async findAll(): Promise<Module[]> {
    return this.moduleModel.find().exec();
  }

  // Module opzoeken via id
  async findOneById(id: number | string): Promise<Module | null> {
    return this.moduleModel.findOne({ id }).exec();
  }

  // Filteren op parameters
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

  // Zoeken op naam of beschrijving
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
}
