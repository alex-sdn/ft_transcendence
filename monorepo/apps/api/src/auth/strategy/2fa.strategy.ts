import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
	constructor(config: ConfigService, private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_2FA_SECRET'),
		});
	}

	async validate(payload: {userId: number, nickname: string, need2fa: boolean}) {

		const user = await this.prisma.user.findUnique({
			where: { id: payload.userId }
		});

		return user;
	}
}