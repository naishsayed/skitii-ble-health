import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.34:3000',
      'https://skitii-ble-health.vercel.app',
    ],
  });

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();