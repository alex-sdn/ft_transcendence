import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, TwoFactorStrategy } from './strategy';

@Module({
	imports: [HttpModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, TwoFactorStrategy],
	exports: [AuthService, JwtStrategy]
})
export class AuthModule {}
