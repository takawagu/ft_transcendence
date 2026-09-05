// ホストで直接 `npm run start:dev` したときに backend/.env を読み込む。
// docker compose 実行時は compose 側が環境変数を渡しており、dotenv は
// 既存の process.env を上書きしないため、コンテナの設定には影響しない。
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(json({ limit: '3mb' }));
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Backend listening on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
