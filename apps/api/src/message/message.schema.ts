import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ _id: false })
export class Sender {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true, enum: ['agent', 'visitor', 'system'] })
  role: string;

  @Prop({ type: String })
  nickname: string;
}
export const SenderSchema = SchemaFactory.createForClass(Sender);

@Schema({ _id: false })
export class Content {
  @Prop({ type: String, enum: ['text', 'image', 'file', 'audio'], default: 'text' })
  type: string;

  @Prop({ type: String, required: true })
  data: string;

  @Prop({ type: Object, required: false })
  meta?: Record<string, any>;
}
export const ContentSchema = SchemaFactory.createForClass(Content);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  @Prop({ type: Number, required: true, index: true })
  conversationId: number;

  @Prop({ type: SenderSchema, required: true })
  sender: Sender;

  @Prop({ type: ContentSchema, required: true })
  content: Content;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
