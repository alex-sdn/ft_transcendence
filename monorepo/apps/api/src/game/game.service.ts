import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Member, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	/******************************************************************************
	*                              UPDATE PROFILES                                *
	******************************************************************************/

	async	createMatch(user1Id: number, user2Id: number, user1score: number, user2score: number, gameType) {
		try {
			const user1 = await this.prisma.user.findUnique({
				where: {id: user1Id}
			});
			const user2 = await this.prisma.user.findUnique({
				where: {id: user2Id}
			});

			// create match tables
			await this.prisma.match.create({
				data: {
					user1Id: user1Id,
					user2Id: user2Id,
					user1nick: 'enleve',
					user2nick: 'enleve',
					p1score: user1score,
					p2score: user2score,
					p1LP: user1.LP,
					p2LP: user2.LP,
					type: gameType
				}
			});
			await this.prisma.match.create({
				data: {
					user1Id: user2Id,
					user2Id: user1Id,
					user1nick: 'enleve',
					user2nick: 'enleve',
					p1score: user2score,
					p2score: user1score,
					p1LP: user2.LP,
					p2LP: user1.LP,
					type: gameType
				}
			});
	
			// if user1 won
			if (user1score > user2score) {
				await this.prisma.user.update({
					where: {id: user1Id},
					data: {win: user1.win + 1}
				});
				await this.prisma.user.update({
					where: {id: user2Id},
					data: {loss: user2.loss + 1}
				});
			}
			// if user2 won
			if (user2score > user1score) {
				await this.prisma.user.update({
					where: {id: user2Id},
					data: {win: user2.win + 1}
				});
				await this.prisma.user.update({
					where: {id: user1Id},
					data: {loss: user1.loss + 1}
				});
			}
			// if ranked -> update LP
			if (gameType === 'ranked') {
				if (user1score > user2score) {
					await this.prisma.user.update({
						where: {id: user1Id},
						data: {LP: user1.LP + 30}
					});
					await this.prisma.user.update({
						where: {id: user2Id},
						data: {LP: user2.LP - 30}
					});
				}
				else if (user2score > user1score) {
					await this.prisma.user.update({
						where: {id: user2Id},
						data: {LP: user2.LP + 30}
					});
					await this.prisma.user.update({
						where: {id: user1Id},
						data: {LP: user1.LP - 30}
					});
				}
			}
		} catch(error) {
			console.log('error creating match')
		}
	}

	async	statusIngame(userId: number) {
		try {
			await this.prisma.user.update({
				where: {id: userId},
				data: {status: 'ingame'}
			});
		} catch(error) {
			console.log('ingame status error');
		}
	}

	async	statusOnline(userId: number) {
		try {
			const user = await this.prisma.user.findUnique({
				where: {id: userId},
			});
			if (user.status === 'ingame') {
				await this.prisma.user.update({
					where: {id: user.id},
					data: {status: 'online'}
				});
			}
		} catch(error) {
			console.log('ingame status error');
		}
	}
}