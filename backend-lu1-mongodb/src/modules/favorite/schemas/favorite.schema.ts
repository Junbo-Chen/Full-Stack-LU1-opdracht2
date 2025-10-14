import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Favorite extends Document {
  @Prop({ required: true })
  userId: string; // String omdat we het van frontend krijgen als string

  @Prop({ required: true })
  courseId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Index voor snellere queries
FavoriteSchema.index({ userId: 1, courseId: 1 }, { unique: true });