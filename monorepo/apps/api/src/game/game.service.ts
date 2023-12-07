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

	/**  ACHIEVEMENTS  **/
	async updateAchievements(userId: number) {
		const maxScore = 7;  // if changed

		const user = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {achievements: true}
		});
		if (!user)   //impossible?
			return;
	
		// Play first game
		if (user.achievements.playOne === false) {
			const check = await this.prisma.match.findMany({
				where: {user1Id: user.id}
			});
			if (check.length > 0) {
				await this.prisma.achievements.update({
					where: {userId: user.id},
					data: {playOne: true}
				});
			}
		}
	
		// Win MaxScore-0
		if (user.achievements.win3to0 === false) {
			const check = await this.prisma.match.findMany({
				where: {
					user1Id: user.id,
					p1score: maxScore,
					p2score: 0
				},
			});
			if (check.length > 0) {
				await this.prisma.achievements.update({
					where: {userId: user.id},
					data: {win3to0: true}
				});
			}
		}
	
		// Win 3 games in a row
		if (user.achievements.win3inRow === false) {
			const matches = await this.prisma.match.findMany({
				where: {user1Id: user.id}
			});
			// iterate through matches
			for (var i = 0; i < matches.length - 2; i++) {
				if (i <= matches.length - 3) {
					if (matches[i].p1score === maxScore
						&& matches[i + 1].p1score === maxScore
						&& matches[i + 2].p1score === maxScore) {
							// add achievement
							await this.prisma.achievements.update({
								where: {userId: user.id},
								data: {win3inRow: true}
							});
							break;
					}
				}
			}
		}
	
		// Reach 500LP
		if (user.achievements.reach500LP === false) {
			if (user.LP >= 500) {
				await this.prisma.achievements.update({
					where: {userId: user.id},
					data: {reach500LP: true}
				});
			}
		}
	
		// Win 5 matches
		if (user.achievements.win5 === false) {
			// 
		}
	
		// Win 10 matches
		if (user.achievements.win5 === false) {
			// 
		}
	
		// Win 20 matches
		if (user.achievements.win5 === false) {
			// 
		}
	
		// Win 50 matches
		if (user.achievements.win5 === false) {
			// 
		}
	}
}