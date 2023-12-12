import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService implements OnModuleInit {
	constructor(private prisma: PrismaService) {}

	onModuleInit() {
		this.createRobotUser();
	}

	// Create Robot
	async createRobotUser() {
		try {
			const robot = await this.prisma.user.create({
				data: {
					login42: 'R',
					nickname: 'robot',
					// custom avatar ?
				}
			});
			await this.prisma.achievements.create({
				data: {userId: robot.id}
			});
		} catch (error) {
			// console.log('Failed to create Robot user');
		}
	}
}