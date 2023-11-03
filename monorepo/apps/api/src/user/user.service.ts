import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { Response } from "express";
import * as path from "path";


@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private authService: AuthService) {}

	async getMe(user) {
		const fullUser = await this.prisma.user.findUnique({
			where: {id: user.id},
			include: {
				friends1: true,
				matchesP1: true}
		});

		delete user.secret2fa;
		return fullUser;
	}

	async getUser(nickname: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				nickname
			},
			include: {
				matchesP1 : true,
			}
		});
		if (!user)
			throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

		delete user.has2fa;
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

	/**  AVATAR  **/
	async getAvatar(filename: string, res: Response) {
		var filePath;
		if (filename === 'default-avatar')
			filePath = path.join(__dirname, '../../uploads/', filename);
		else
			filePath = path.join(__dirname, '../../uploads/custom/', filename);

		res.download(filePath, filename, (err) => {
			if (err) { res.status(500).send('Error downloading file') };
		});
	}

	async editAvatar(user, filename: string) {
		try {
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					avatar: filename,
				}
			});
			// return value ?
			return 'success';
		} catch(error) {
			throw new Error('Failed to change avatar');
		}		
	}

	/**  2FA  **/
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

	/**  FRIEND  **/
	async addFriend(nickname: string, user) {
		const target = await this.prisma.user.findUnique({
			where: {nickname: nickname},
			include: {
				friends1: true,
				blocked: true,
				blockedBy: true}
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if already friends
		if (target.friends1.some(friendship => friendship.user2Id === user.id)) {
			throw new HttpException('YOU ARE ALREADY FRIENDS', HttpStatus.BAD_REQUEST);
		}
		// Check if blocked by you
		if (target.blockedBy.some(blocked => blocked.blockerId === user.id)) {
			throw new HttpException('YOU BLOCKED THIS USER', HttpStatus.BAD_REQUEST);
		}
		// // Check if blocked by them
		if (target.blocked.some(blocked => blocked.blockedId === user.id)) {
			throw new HttpException('THIS USER BLOCKED YOU', HttpStatus.BAD_REQUEST);
		}

		// OK, add friend
		await this.prisma.friendship.create({
			data: {
				user1Id: user.id,
				user2Id: target.id
			}
		})
		await this.prisma.friendship.create({
			data: {
				user1Id: target.id,
				user2Id: user.id
			}
		})
	}

	async deleteFriend(nickname: string, user) {
		const target = await this.prisma.user.findUnique({
			where: {nickname: nickname},
			include: {
				friends1: true }
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if not friends
		if (!target.friends1.some(friendship => friendship.user2Id === user.id)) {
			throw new HttpException('YOU ARE NOT FRIENDS WITH THIS USER', HttpStatus.BAD_REQUEST);
		}

		// OK, delete friend
		await this.prisma.friendship.deleteMany({
			where: {
				user1Id: user.id,
				user2Id: target.id
			}
		});
		await this.prisma.friendship.deleteMany({
			where: {
				user1Id: target.id,
				user2Id: user.id
			}
		});
	}

	/**  BLOCK  **/
	async addBlock(nickname: string, user) {
		const target = await this.prisma.user.findUnique({
			where: {nickname: nickname},
			include: {
				friends1: true,
				blockedBy: true}
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if blocked by you
		if (target.blockedBy.some(blocked => blocked.blockerId === user.id)) {
			throw new HttpException('ALREADY BLOCKED', HttpStatus.BAD_REQUEST);
		}

		// Check if already friends
		if (target.friends1.some(friendship => friendship.user2Id === user.id)) {
			// delete friend before blocking
			await this.prisma.friendship.deleteMany({
				where: {
					user1Id: user.id,
					user2Id: target.id
				}
			});
			await this.prisma.friendship.deleteMany({
				where: {
					user1Id: target.id,
					user2Id: user.id
				}
			});
		}

		// OK, add block
		await this.prisma.blocked.create({
			data: {
				blockerId: user.id,
				blockedId: target.id
			}
		});
	}

	async deleteBlock(nickname: string, user) {
		const target = await this.prisma.user.findUnique({
			where: {nickname: nickname},
			include: {
				blockedBy: true }
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if not blocked by you
		if (!target.blockedBy.some(blocked => blocked.blockerId === user.id)) {
			throw new HttpException('USER IS NOT BLOCKED BY YOU', HttpStatus.BAD_REQUEST);
		}

		// OK, delete block
		await this.prisma.blocked.deleteMany({
			where: {
				blockerId: user.id,
				blockedId: target.id
			}
		});
	}
}
