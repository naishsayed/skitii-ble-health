import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

import {
  Session,
  SessionSchema,
} from './schema/session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Session.name,
        schema: SessionSchema,
      },
    ]),
  ],

  controllers: [SessionsController],

  providers: [SessionsService],
})
export class SessionsModule {}