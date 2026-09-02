import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime: Date;

  @Prop()
  duration: number;

  @Prop()
  deviceId: string;

  @Prop({
    default: 'completed',
    enum: ['active', 'paused', 'completed', 'error'],
  })
  status: string;

  @Prop({ type: [Number], default: [] })
  heartRateReadings: number[];

  @Prop({ type: [Number], default: [] })
  rrIntervals: number[];

  @Prop()
  averageHeartRate: number;

  @Prop()
  minHeartRate: number;

  @Prop()
  maxHeartRate: number;

  @Prop()
  rmssd: number;
}

export const SessionSchema =
  SchemaFactory.createForClass(Session);