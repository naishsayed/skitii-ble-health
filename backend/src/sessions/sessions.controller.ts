import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { SessionsService } from './sessions.service';
import { Session } from './schema/session.schema';

@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Post()
  create(@Body() data: Partial<Session>) {
    return this.sessionsService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }
}