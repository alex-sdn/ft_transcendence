import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

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
}