import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  sharedWith: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  backgroundColor: string;

  @Prop({ default: false })
  canvasWidth: number;

  @Prop({ default: false })
  canvasHeight: number;

  @Prop({ default: false })
  showGrid: boolean;
  
  @Prop({ default: false })
  gridSize: number;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
