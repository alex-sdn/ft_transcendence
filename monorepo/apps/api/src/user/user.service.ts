import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";


@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private authService: AuthService) {}

	async getUser(nickname: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				nickname
			}
		});
		if (!user)
			throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

		delete user.secret2fa;
		return user;
	}

	async editNickname(user, nickname: string) {
		// check if nickname empty or invalid chars etc
		if (!nickname)
			throw new HttpException('MISSING_CREDENTIALS', HttpStatus.BAD_REQUEST);
		try {
			// update user
			const updatedUser = await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					nickname
				}
			});
			// returns new JWT (necessaire?)
			return this.authService.signToken(updatedUser.id, updatedUser.nickname, false);
		} catch(error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credentials taken');
				}
			}
			throw error;
		};
	}

	async editAvatar(user, avatar) {
		try {
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					avatar: avatar,
				}
			});
			// return value ?
			return 'success';
		} catch(error) {
			throw new Error('Failed to change avatar');
		}		
	}


	async generate2fa(user) {
		if (user.has2fa === true)
			throw new HttpException('2FA_ALREADY_ACTIVATED', HttpStatus.CONFLICT);
		// generate 2fa secret
		const secret = speakeasy.generateSecret({
			name: "transcendence"
		});

		try {
			// generate QR code
			const qrCode = await qrcode.toDataURL(secret.otpauth_url);
			// add secret to user db
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					secret2fa: secret.base32,
				}
			});
			return qrCode;
		} catch(error) {
			throw new Error('Failed to generate QRcode');
		}
	}

	async activate2fa(user, code) {
		if (user.has2fa === true || !user.secret2fa || !code)
			throw new HttpException('BAD REQUEST', HttpStatus.BAD_REQUEST);

		const secret = user.secret2fa;
		const isValid = speakeasy.totp.verify({
			secret,
			encoding: 'base32',
			token: code,
		});

		if (isValid) {
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					has2fa: true,
				}
			});
			// change return values
			return 'success';
		}
		return 'wrong';
	}

	async delete2fa(user) {
		if (user.has2fa === false)
			throw new HttpException('2FA_NOT_ACTIVATED', HttpStatus.CONFLICT);
		
		await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				has2fa: false,
				secret2fa: null
			}
		});
		// return value ?
		return 'success';
	}
}
