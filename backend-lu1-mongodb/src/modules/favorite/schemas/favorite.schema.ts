import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ required: true })
  studentId: string; // Later kun je dit koppelen aan echte gebruikers

  @Prop({ required: true })
  moduleId: number; // ID van de module (moet matchen met module.id)

  @Prop({ required: true })
  moduleName: string;

  @Prop()
  moduleLevel?: string;

  @Prop()
  moduleCredits?: number;

  @Prop()
  notes?: string; // Optionele notities van student
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);