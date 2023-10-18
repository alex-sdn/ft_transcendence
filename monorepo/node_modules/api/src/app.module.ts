import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '../..', 'front', 'dist'),
	}),
	ConfigModule.forRoot({isGlobal: true}),
	AuthModule,
	PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
