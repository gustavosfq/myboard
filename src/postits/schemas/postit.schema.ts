import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostitDocument = Postit & Document;

@Schema({ timestamps: true })
export class Postit {
  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: false })
  text: string;

  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true, default: 200 })
  width: number;

  @Prop({ required: true, default: 200 })
  height: number;

  @Prop({ default: '#FFE66D' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ default: 0 })
  zIndex: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const PostitSchema = SchemaFactory.createForClass(Postit);
