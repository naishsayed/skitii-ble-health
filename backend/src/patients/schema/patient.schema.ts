import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PatientDocument = HydratedDocument<Patient>;

@Schema({
  timestamps: true,
})
export class Patient {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    min: 1,
    max: 120,
  })
  age: number;

  @Prop({
    required: true,
    trim: true,
  })
  gender: string;

  @Prop({
    required: true,
    trim: true,
  })
  phone: string;

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);