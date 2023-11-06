import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Channel, ChatAccess, Member, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	/*                *\
	**   CONTROLLER   **
	\*                */
	async getMyChannels(user) {
		const channels = await this.prisma.member.findMany({
			where: { userId: user.id },
			include: { channel: true }
		});

		for (var i in channels) {
			delete channels[i].channel.password;
		}
		return channels;
	}

	async getAllChannels() {
		const channels = await this.prisma.channel.findMany()
		
		// delete passwords
		for (var i in channels) {
			delete channels[i].password;
		}
		return channels;
	}

	async getMembers(channel: string, user) {
		const chan = await this.prisma.channel.findUnique({
			where: {name: channel},
			include: {members: true}
		});
		// check if channel exists
		if (!chan)
			throw new HttpException('CHANNEL_DOES_NOT_EXIST', HttpStatus.NOT_FOUND);

		const checkMember = await this.prisma.member.findMany({
			where: {
				chanId: chan.id,
				userId: user.id
			}
		});
		// check if calling user in channel
		if (checkMember.length === 0)
			throw new HttpException('NOT_IN_CHANNEL', HttpStatus.FORBIDDEN);

		const members = await this.prisma.member.findMany({
			where: { chanId: chan.id },
			include: { user: true }
		});
		// delete secrets
		for (var i in members) {
			delete members[i].user.has2fa;
			delete members[i].user.secret2fa;
		}
		return members;
	}


	/*             *\
	**   GATEWAY   **
	\*             */
	async messageChannel(channel, user: User) {
		if (!channel) {
			throw new Error('target channel does not exist');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF MUTED IN CHANNEL
		if (await this.isMuted(channel.members.find(member => {return member.userId === user.id;}))) {
			throw new Error('you are muted in this channel');
		}
	}

	async privMessage(sender: User, target: User) {
		if (!target) {
			throw new Error('target not found');
		}

		// CHECK IF FRIENDS FOR PRIV MESSAGES ??

		// IF SENDER BLOCKED TARGET
		if (await this.isBlocked(sender.id, target.id)) {
			throw new Error('you blocked this user');
		}
		// IF TARGET BLOCKED SENDER
		if (await this.isBlocked(target.id, sender.id)) {
			throw new Error('you are blocked by this user');
		}
	}

	async createChannel(user: User, message) {
		if (!message.target)
			throw new Error('no channel name specified');

		const checkTaken = await this.prisma.channel.findUnique({
			where: {name: message.target}
		});
		// IF NAME IS TAKEN
		if (checkTaken) {
			throw new Error('channel name already taken');
		}
		// IF MISSING PASSWORD
		if (message.access === 'protected' && !message.password)
			throw new Error('missing password for protected access');
		
		// Verify if access in accessEnum ?

		try {
			// Create channel
			const channel = await this.prisma.channel.create({
				data: {
					name: message.target,
					access: message.access,
					password: message.password
				}
			});
			// Add user  (+set as owner! +admin)
			await this.prisma.member.create({
				data: {
					chanId: channel.id,
					userId: user.id,
					owner: true,
					admin: true
				}
			})
		} catch(error) {
			throw new Error('Failed to create channel');
		}
	}

	async joinChannel(channel, user: User, password: string) {
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('channel does not exist, connection failed');
		}
		// IF USER IN CHANNEL
		if (channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are already in this channel');
		}
		// IF CHANNEL PRIVATE AND NOT INVITED
		if (channel.access === 'private') {
			// If invited -> delete invite
			if (await this.isInvited(channel.id, user.id)) {
				await this.prisma.invited.deleteMany({
					where: {
						chanId: channel.id,
						userId: user.id
					}
				});
			}
			else
				throw new Error('channel private, you are not invited');
		}
		// IF BANNED FROM CHANNEL
		else if (await this.isBanned(channel.id, user.id)) {
			throw new Error('you are banned from this channel');
		}
		// IF CHANNEL PROTECTED AND WRONG PASSWORD
		else if (channel.access === 'protected' && password !== channel.password) {
			throw new Error('channel protected, incorrect password');
		}

		// OK, Create new member
		await this.prisma.member.create({
			data: {
				chanId: channel.id,
				userId: user.id,
			}
		})
	}

	async leaveChannel(channel, user: User) {
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('channel does not exist');
		}
		// IF USER NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}

		// OK, delete member
		await this.prisma.member.deleteMany({
			where: {
				chanId: channel.id,
				userId: user.id
			}
		});

		// Delete channel if no members left ?

	}

	async changeAccess(channel, user: User, access: string, password: string) {
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('channel does not exist');
		}
		// IF USER NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF USER NOT ADMIN
		if (!(await this.isAdmin(channel.id, user.id))) {
			throw new Error('you are not admin');
		}

		// OK, update channel
		if (access === 'public') {
			await this.prisma.channel.update({
				where: { id: channel.id },
				data: { access: 'public' }
			});
		}
		else if (access === 'private') {
			await this.prisma.channel.update({
				where: { id: channel.id },
				data: { access: 'private' }
			});
		}
		else if (access === 'protected') {
			//check password format ?
			await this.prisma.channel.update({
				where: { id: channel.id },
				data: {
					access: 'protected',
					password: password
				}
			});
		}
		else
			throw new Error('access type not recognized');
	}


	/*           *\
	**   UTILS   **
	\*           */
	async isBanned(chanId: number, userId: number): Promise<boolean> {
		const check = await this.prisma.banned.findUnique({
			where: {
				chanId_userId: {
					chanId: chanId,
					userId: userId
				}
			}
		});
		if (check)
			return true;
		return false;
	}

	async isInvited(chanId: number, userId: number): Promise<boolean> {
		const check = await this.prisma.invited.findUnique({
			where: {
				chanId_userId: {
					chanId: chanId,
					userId: userId
				}
			}
		});
		if (check)
			return true;
		return false;
	}

	async isMuted(member: Member): Promise<boolean> {
		if (!member)
			console.log('PAS MEMBER?? IMPOSSIBLE');
		if (member.muted === true) {
			//check if still muted
			const currTime = new Date();
			const muteEnd = new Date(member.muteEnd);
			//if mute over
			if (currTime > muteEnd) {
				await this.prisma.member.updateMany({
					where: {
						chanId: member.chanId,
						userId: member.userId
					},
					data: {
						muted: false,
						muteEnd: null
					}
				});
				return false;
			}
			//else: still muted
			return true;
		}
		return false;
	}

	async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
		const check = await this.prisma.blocked.findUnique({
			where: {
				blockerId_blockedId: {
					blockerId: blockerId,
					blockedId: blockedId
				}
			}
		});
		if (check)
			return true;
		return false;
	}

	async isAdmin(chanId: number, userId: number): Promise<boolean> {
		const member = await this.prisma.member.findUnique({
			where: {
				chanId_userId: {
					chanId: chanId,
					userId: userId
				}
			}
		});
		return member.admin;
	}
}