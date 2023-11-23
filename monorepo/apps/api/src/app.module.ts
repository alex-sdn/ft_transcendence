import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../..', 'front', 'dist'),
		}),
		ConfigModule.forRoot({isGlobal: true}),
		AuthModule,
		PrismaModule,
		UserModule,
		ChatModule,
  	],
})
export class AppModule {}
