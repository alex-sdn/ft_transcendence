import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as http from 'http';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

//   const server = http.createServer(app.getHttpServer());
//   const ioAdapter = new IoAdapter(server);

//   app.useWebSocketAdapter(ioAdapter);

  await app.listen(3000);
}
bootstrap();
