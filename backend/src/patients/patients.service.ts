import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Patient, PatientDocument } from './schema/patient.schema';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private readonly patientModel: Model<PatientDocument>,
  ) {}

  // Get all patients
  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().sort({ createdAt: -1 }).exec();
  }

  // Get one patient
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientModel.findById(id).exec();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  // Create patient
  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = new this.patientModel(patientData);

    return patient.save();
  }

  // Update patient
  async update(
    id: string,
    patientData: Partial<Patient>,
  ): Promise<Patient> {
    const patient = await this.patientModel
      .findByIdAndUpdate(
        id,
        patientData,
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  // Deactivate patient
  async remove(id: string): Promise<Patient> {
    const patient = await this.patientModel
      .findByIdAndUpdate(
        id,
        { isActive: false },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }
}