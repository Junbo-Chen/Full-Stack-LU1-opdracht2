import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema({ collection: 'avansOpdracht', timestamps: true })
export class Module {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  shortdescription?: string;

  @Prop()
  description?: string;

  @Prop()
  content?: string;

  @Prop({ required: true })
  studycredit: number;

  @Prop({ required: true })
  location: string;

  @Prop()
  contact_id?: number;

  @Prop({ required: true })
  level: string;

  @Prop()
  learningoutcomes?: string;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);