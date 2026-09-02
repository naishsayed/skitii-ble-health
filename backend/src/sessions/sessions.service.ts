import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Session,
  SessionDocument,
} from './schema/session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async create(data: Partial<Session>) {
    return new this.sessionModel(data).save();
  }

  async findAll() {
    return this.sessionModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const session = await this.sessionModel
      .findById(id)
      .exec();

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }
}