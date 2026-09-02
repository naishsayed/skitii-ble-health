import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { PatientsService } from './patients.service';
import { Patient } from './schema/patient.schema';
@UseGuards(AuthGuard('jwt'))

@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
  ) {}

  @Get()
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  create(@Body() patientData: Partial<Patient>): Promise<Patient> {
    return this.patientsService.create(patientData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() patientData: Partial<Patient>,
  ): Promise<Patient> {
    return this.patientsService.update(id, patientData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.remove(id);
  }
}