import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './avans.controller';
import { ModuleService } from '../../service/avans.service';
import { Module as AvansModuleEntity, ModuleSchema } from '../../schema/avansopdracht.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvansModuleEntity.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService], 
})
export class AvansModule {}
