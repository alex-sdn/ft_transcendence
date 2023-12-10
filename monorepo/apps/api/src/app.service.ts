import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService implements OnModuleInit {
	constructor(private prisma: PrismaService) {}

	onModuleInit() {
		this.createRobotUser();
	}

	// Create Robot

	// + check if already exist before
	async createRobotUser() {
		try {
			await this.prisma.user.create({
				data: {
					login42: 'R',
					nickname: 'robot',
					// custom avatar ?
				}
			});
		} catch (error) {
			console.log('Failed to create Robot user');
		}
	}
}