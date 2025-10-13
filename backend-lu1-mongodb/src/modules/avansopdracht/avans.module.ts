import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleController } from './avans.controller';
import { ModuleService } from './avans.service';
import { Module as AvansModuleEntity, ModuleSchema } from './schemas/avansopdracht.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvansModuleEntity.name, schema: ModuleSchema },
    ]),
  ],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService], // <-- handig als je het later elders wilt gebruiken
})
export class AvansModule {}
