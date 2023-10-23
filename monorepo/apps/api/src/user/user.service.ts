import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

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
}