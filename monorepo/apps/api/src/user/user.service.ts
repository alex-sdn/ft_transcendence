import { ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { Response } from "express";
import * as path from "path";
import { ChatGateway } from "src/chat/gateway/chat.gateway";


@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private authService: AuthService,
		private chatGateway: ChatGateway) {}

	async getMe(user) {
		const fullUser = await this.prisma.user.findUnique({
			where: {id: user.id},
			include: {
				friends1: true,   //remove includes here?
				matchesP1: true
			}
		});

		delete fullUser.secret2fa;
		return fullUser;
	}

	async getUser(nickname: string) {
		const user = await this.prisma.user.findUnique({
			where: {nickname},
			include: {matchesP1 : true,}
		});
		if (!user)
			throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

		delete user.has2fa;
		delete user.secret2fa;
		return user;
	}

	async getUserById(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {id: userId}
		});
		if (!user)
			throw new HttpException('USER_NOT_FOUND', HttpStatus.NOT_FOUND);

		delete user.has2fa;
		delete user.secret2fa;
		return user;
	}

	async getAllUsers() {
		var users = await this.prisma.user.findMany();

		for (var i in users) {
			delete users[i].createdAt;
			delete users[i].has2fa;
			delete users[i].secret2fa;
			delete users[i].LP;
			delete users[i].win;
			delete users[i].loss;
		}
		return users;
	}

	async editNickname(user, nickname: string) {
		if (!nickname)
			throw new HttpException('MISSING_CREDENTIALS', HttpStatus.BAD_REQUEST);
		try {
			// update user
			const updatedUser = await this.prisma.user.update({
				where: {id: user.id},
				data: {nickname}
			});
			// emit refresh event
			this.chatGateway.refreshNickname(user.id);
			// returns new JWT (necessaire?)
			return this.authService.signToken(updatedUser.id, updatedUser.nickname);
		} catch(error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credentials taken');
				}
			}
			throw new HttpException('FAILED TO EDIT NICKNAME', HttpStatus.INTERNAL_SERVER_ERROR);
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
				where: {id: user.id},
				data: {avatar: filename}
			});
			return;
		} catch(error) {
			// do something with error ?
			throw new HttpException('FAILED TO CHANGE AVATAR', HttpStatus.INTERNAL_SERVER_ERROR);
		}		
	}

	/**  2FA  **/
	async generate2fa(user) {
		if (user.has2fa === true)
			throw new HttpException('2FA ALREADY ACTIVATED', HttpStatus.CONFLICT);
		// generate 2fa secret
		const secret = speakeasy.generateSecret({
			name: "transcendence"
		});

		try {
			// generate QR code
			const qrCode = await qrcode.toDataURL(secret.otpauth_url);
			// add secret to user db
			await this.prisma.user.update({
				where: {id: user.id},
				data: {secret2fa: secret.base32}
			});
			return qrCode;
		} catch(error) {
			throw new HttpException('FAILED TO GENERATE QR CODE', HttpStatus.INTERNAL_SERVER_ERROR);
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
				where: {id: user.id},
				data: {has2fa: true}
			});
		} else {
			throw new HttpException('WRONG 2FA CODE', HttpStatus.UNAUTHORIZED);
		}
	}

	async delete2fa(user) {
		if (user.has2fa === false)
			throw new HttpException('2FA NOT ACTIVATED', HttpStatus.CONFLICT);
		
		await this.prisma.user.update({
			where: {id: user.id},
			data: {
				has2fa: false,
				secret2fa: null
			}
		});
		return;
	}

	/**  FRIEND  **/
	async myFriends(user) {
		const friends = await this.prisma.friendship.findMany({
			where: {user1Id: user.id},
			include: {user2: true}
		});

		for (var i in friends) {
			delete friends[i].user2.has2fa;
			delete friends[i].user2.secret2fa;
		}

		return friends;
	}

	async checkFriend(userId: number, user): Promise<boolean> {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {friends1: true}
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if friends
		if (target.friends1.some(friendship => friendship.user2Id === user.id)) {
			return true;
		}
		return false;
	}

	async myFriendRequests(user) {
		var requested = await this.prisma.friendRequest.findMany({
			where: {requestedId: user.id},
			include: {requester: true}
		});

		for (var i in requested) {
			delete requested[i].requester.has2fa;
			delete requested[i].requester.secret2fa;
		}
		return requested;
	}

	async addFriend(userId: number, user) {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {
				friends1: true,
				requested: true,
				requester: true,
				blocked: true,
				blockedBy: true
			}
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
		// Check if blocked by them
		if (target.blocked.some(blocked => blocked.blockedId === user.id)) {
			throw new HttpException('THIS USER BLOCKED YOU', HttpStatus.BAD_REQUEST);
		}
		// Check if already requesting
		if (target.requested.some(requester => requester.requesterId === user.id)) {
			throw new HttpException('ALREADY SENT FRIEND REQUEST', HttpStatus.BAD_REQUEST);
		}

		// If requested, add friend
		if (target.requester.some(requested => requested.requestedId === user.id)) {
			// OK, add friend
			await this.prisma.friendship.create({
				data: {
					user1Id: user.id,
					user2Id: target.id
				}
			});
			await this.prisma.friendship.create({
				data: {
					user1Id: target.id,
					user2Id: user.id
				}
			});
			// + Delete request
			await this.prisma.friendRequest.delete({
				where: {
					requesterId_requestedId: {
						requestedId: user.id,
						requesterId: target.id
					}
				}
			});
		}
		// Else create request
		else {
			await this.prisma.friendRequest.create({
				data: {
					requesterId: user.id,
					requestedId: target.id
				}
			});
		}
	}

	async deleteFriend(userId: number, user) {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {
				friends1: true,
				requester: true
			}
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// If friends
		if (target.friends1.some(friendship => friendship.user2Id === user.id)) {
			// OK, delete friend
			const friendship1 = await this.prisma.friendship.findUnique({
				where: {
					user1Id_user2Id: {
						user1Id: user.id,
						user2Id: target.id
					}
				}
			});
			const friendship2 = await this.prisma.friendship.findUnique({
				where: {
					user1Id_user2Id: {
						user1Id: target.id,
						user2Id: user.id
					}
				}
			});
			// delete messages first
			await this.prisma.privmsg.deleteMany({
				where: { friend1Id: friendship1.id }
			});
			await this.prisma.privmsg.deleteMany({
				where: { friend1Id: friendship2.id }
			})
			// delete friendships
			await this.prisma.friendship.delete({
				where: { id: friendship1.id }
			});
			await this.prisma.friendship.delete({
				where: { id: friendship2.id }
			});
		
		}
		// If pending request
		else if (target.requester.some(requested => requested.requestedId === user.id)) {
			// delete request
			await this.prisma.friendRequest.delete({
				where: {
					requesterId_requestedId: {
						requestedId: user.id,
						requesterId: userId
					}
				}
			});
		}
		else {
			throw new HttpException('YOU ARE NOT FRIENDS WITH THIS USER', HttpStatus.BAD_REQUEST);
		}
	}

	/**  BLOCK  **/
	async checkBlock(userId: number, user): Promise<boolean> {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {blockedBy: true}
		});

		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		// Check if blocked by you
		if (target.blockedBy.some(blocked => blocked.blockerId === user.id)) {
			return true;
		}
		return false;
	}

	async addBlock(userId: number, user) {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {
				friends1: true,
				blockedBy: true,
				requested: true,
				requester: true
			}
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
			this.deleteFriend(target.id, user);
		}
		// Check if pending friend requests
		if (target.requested.some(requester => requester.requesterId === user.id)) {
			await this.prisma.friendRequest.delete({
				where: {
					requesterId_requestedId: {
						requesterId: user.id,
						requestedId: target.id
					}
				}
			});
		}
		if (target.requester.some(requested => requested.requestedId === user.id)) {
			await this.prisma.friendRequest.delete({
				where: {
					requesterId_requestedId: {
						requesterId: target.id,
						requestedId: user.id
					}
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

	async deleteBlock(userId: number, user) {
		const target = await this.prisma.user.findUnique({
			where: {id: userId},
			include: {blockedBy: true}
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

	/**  MATCHES  **/  //keep here?
	async myMatches(user) {
		const matches = await this.prisma.match.findMany({
			where: { user1Id: user.id },
			include: {
				user1: true,  // necessaire ?
				user2: true
			}
		});

		for (var i in matches) {
			delete matches[i].user1.has2fa;
			delete matches[i].user1.secret2fa;
			delete matches[i].user2.has2fa;
			delete matches[i].user2.secret2fa;
		};

		return matches;
	}

	async getMatches(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {id: userId}
		});
		if (!user) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.BAD_REQUEST);
		}

		return (await this.myMatches(user));
	}
}
