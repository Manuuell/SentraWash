import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './core/config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const appConfig = config.get<AppConfig>('app')!;

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(appConfig.apiPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(appConfig.port);
  // eslint-disable-next-line no-console
  console.log(`SentraWash API escuchando en http://localhost:${appConfig.port}/${appConfig.apiPrefix}`);
}

void bootstrap();
