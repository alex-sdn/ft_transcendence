import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as http from 'http';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  //SWAGGER
  const config = new DocumentBuilder()
    .setTitle('ft_transcendence')
    .setDescription('pong game')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'api')
    .addTag('pong')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
