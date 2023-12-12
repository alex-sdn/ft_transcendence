import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Channel, ChatAccess, Member, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2';
import { MinLength } from "class-validator";

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

	async getAvailableChannels(user) {
		var channels = await this.prisma.channel.findMany({
			include: { members: true }
		})

		for (var i = 0; i < channels.length; i++) {
			if (channels[i].members.find(member => {return member.userId === user.id})) {
				channels.splice(i, 1);
				i--;
			}
			else {
				delete channels[i].members;
				delete channels[i].password;
			}
		}
		return channels;
	}

	async getMembers(channel: string, user) {
		const chan = await this.prisma.channel.findUnique({
			where: { name: channel },
			include: { members: true }
		});
		// check if channel exists
		if (!chan)
			throw new HttpException('CHANNEL_DOES_NOT_EXIST', HttpStatus.NOT_FOUND);

		const checkMember = await this.prisma.member.findUnique({
			where: {
				chanId_userId: {
					chanId: chan.id,
					userId: user.id
				}
			}
		});
		// check if calling user in channel
		if (!checkMember) {
			throw new HttpException('NOT_IN_CHANNEL', HttpStatus.FORBIDDEN);
		}

		const members = await this.prisma.member.findMany({
			where: { chanId: chan.id },
			include: { user: true }
		});
		// delete secrets
		for (var i in members) {
			delete members[i].user.has2fa;
			delete members[i].user.secret2fa;
			delete members[i].user.status;
		}
		return members;
	}

	async getMessages(channel: string, user) {
		const chan = await this.prisma.channel.findUnique({
			where: { name: channel },
			include: { members: true }
		});
		// check if channel exists
		if (!chan)
			throw new HttpException('CHANNEL_DOES_NOT_EXIST', HttpStatus.NOT_FOUND);

		const checkMember = await this.prisma.member.findUnique({
			where: {
				chanId_userId: {
					chanId: chan.id,
					userId: user.id
				}
			}
		});
		// check if calling user in channel
		if (!checkMember) {
			throw new HttpException('NOT_IN_CHANNEL', HttpStatus.FORBIDDEN);
		}

		const messages = await this.prisma.chanmsg.findMany({
			where: { chanId: chan.id },
			include: { sender: true }
		});
		// remove messages from blocked users
		const filteredMessages = await this.filterBlockedMessages(user, messages);
		// delete info
		for (var i in filteredMessages) {
			delete filteredMessages[i].sender.has2fa;
			delete filteredMessages[i].sender.secret2fa;
			delete filteredMessages[i].sender.status;
		}

		return filteredMessages;
	}

	async getPrivmessages(nickname: string, user) {
		const target = await this.prisma.user.findUnique({
			where: { nickname: nickname }
		});
		if (!target) {
			throw new HttpException('USER DOES NOT EXIST', HttpStatus.NOT_FOUND);
		}

		// Check if friends
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
		if (!friendship1) {
			throw new HttpException('NOT FRIENDS WITH USER', HttpStatus.FORBIDDEN);
		}
		// aaaaaaaaaaaaaaaaaa
		var id1: number;
		var id2: number;
		if (friendship1.id < friendship2.id) {
			id1 = friendship1.id;
			id2 = friendship2.id;
		} else {
			id1 = friendship2.id;
			id2 = friendship1.id;
		}
		const messages = await this.prisma.privmsg.findMany({
			where: {
				friend1Id: id1,
				friend2Id: id2
			},
			include: { sender: true }
		})
		// delete info
		for (var i in messages) {
			delete messages[i].sender.has2fa;
			delete messages[i].sender.secret2fa;
			delete messages[i].sender.status;
		}

		return messages;
	}


	/*             *\
	**   GATEWAY   **
	\*             */
	async messageChannel(channel, user: User, message: string) {
		if (!channel) {
			throw new Error('target channel does not exist');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF MUTED IN CHANNEL
		if (await this.isMuted(channel.id, user.id)) {
			throw new Error('you are muted in this channel');
		}

		// OK, add to history
		await this.saveChanmsg(channel.id, user.id, message, false);
	}

	async privMessage(sender: User, target: User, message: string) {
		if (!target) {
			throw new Error('target not found');
		}

		// CHECK IF FRIENDS
		const friendship1 = await this.prisma.friendship.findUnique({
			where: {
				user1Id_user2Id: {
					user1Id: sender.id,
					user2Id: target.id
				}
			}
		});
		const friendship2 = await this.prisma.friendship.findUnique({
			where: {
				user1Id_user2Id: {
					user1Id: target.id,
					user2Id: sender.id
				}
			}
		});
		if (!friendship1) {
			throw new Error('you are not friends with this user');
		}

		// IF SENDER BLOCKED TARGET
		if (await this.isBlocked(sender.id, target.id)) {
			throw new Error('you blocked this user');
		}
		// IF TARGET BLOCKED SENDER
		if (await this.isBlocked(target.id, sender.id)) {
			throw new Error('you are blocked by this user');
		}
		
		// OK, add history
		var id1: number;
		var id2: number;
		if (friendship1.id < friendship2.id) {
			id1 = friendship1.id;
			id2 = friendship2.id;
		} else {
			id1 = friendship2.id;
			id2 = friendship1.id;
		}
		await this.prisma.privmsg.create({
			data: {
				friend1Id: id1,
				friend2Id: id2,
				userId: sender.id,
				message: message,
				isCommand: false
			}
		});
	}

	async createChannel(user: User, message) {
		if (!message.target)
			throw new Error('no channel name specified');
		// IF BAD NAME FORMAT
		this.validateName(message.target);

		const checkTaken = await this.prisma.channel.findUnique({
			where: {name: message.target}
		});
		// IF NAME IS TAKEN
		if (checkTaken) {
			throw new Error('channel name already taken');
		}
		// IF MISSING PASSWORD OR WRONG FORMAT
		if (message.access === 'protected') {
			if (!message.password)
				throw new Error('missing password for protected access');
			this.validatePassword(message.password);
		}
		// IF WRONG ACCESS TYPE
		if (!['public', 'private', 'protected'].includes(message.access)) {
			throw new Error('access type not recognized');
		}

		try {
			// Hash password
			let pwHash;
			if (message.access === 'protected')
				pwHash = await argon.hash(message.password);
			else
				pwHash = null;
			// Create channel
			const channel = await this.prisma.channel.create({
				data: {
					name: message.target,
					access: message.access,
					password: pwHash
				}
			});
			// Add user  (+set as owner +admin)
			await this.prisma.member.create({
				data: {
					chanId: channel.id,
					userId: user.id,
					owner: true,
					admin: true
				}
			})
			await this.saveChanmsg(channel.id, user.id, 'has created the channel', true);
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
		if (await this.isBanned(channel.id, user.id)) {
			throw new Error('you are banned from this channel');
		}
		// IF CHANNEL PROTECTED AND WRONG PASSWORD
		if (channel.access === 'protected') {
			const pwMatches = await argon.verify(channel.password, password);
			if (!pwMatches)
				throw new Error('channel protected, incorrect password');
		}

		// OK, Create new member
		await this.prisma.member.create({
			data: {
				chanId: channel.id,
				userId: user.id,
			}
		})
		await this.saveChanmsg(channel.id, user.id, 'has joined the channel', true);
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
		// Delete channel if no members left
		if (channel.members.length === 1) {
			await this.deleteChannel(channel.id);
		} else {
			await this.saveChanmsg(channel.id, user.id, 'has left the channel', true);
		}
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
			if (!password)
				throw new Error('Missing password for protected access');
			// Check password format
			this.validatePassword(password);
			// Hash and update channel
			const pwHash = await argon.hash(password);
			await this.prisma.channel.update({
				where: { id: channel.id },
				data: {
					access: 'protected',
					password: pwHash
				}
			});
		}
		else
			throw new Error('access type not recognized');
	}

	async kickUser(user: User, target: User, channel) {
		// IF TARGET USER DOESN'T EXIST
		if (!target) {
			throw new Error('target user not found');
		}
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('target channel not found');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF USER NOT ADMIN
		if (!(await this.isAdmin(channel.id, user.id))) {
			throw new Error('you are not admin');
		}
		// IF TARGET NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === target.id;})) {
			throw new Error('target is not in this channel');
		}
		// IF TARGET IS OWNER
		if (await this.isOwner(channel.id, target.id)) {
			throw new Error('target user is channel owner!');
		}

		// OK, kick user
		await this.prisma.member.delete({
			where: {
				chanId_userId: {
					chanId: channel.id,
					userId: target.id
				}
			}
		});
		await this.saveChanmsg(channel.id, user.id, 'kicked '+target.nickname+' from the channel', true);
	}

	async banUser(user: User, target: User, channel) {
		// IF TARGET USER DOESN'T EXIST
		if (!target) {
			throw new Error('target user not found');
		}
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('target channel not found');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF USER NOT ADMIN
		if (!(await this.isAdmin(channel.id, user.id))) {
			throw new Error('you are not admin');
		}
		// IF TARGET NOT IN CHANNEL  // Shouldn't have to verify if target already banned
		if (!channel.members.find(member => {return member.userId === target.id;})) {
			throw new Error('target is not in this channel');
		}
		// IF TARGET IS OWNER
		if (await this.isOwner(channel.id, target.id)) {
			throw new Error('target user is channel owner!');
		}

		// OK, ban user
		await this.prisma.member.delete({
			where: {
				chanId_userId: {
					chanId: channel.id,
					userId: target.id
				}
			}
		});
		await this.prisma.banned.create({
			data: {
				chanId: channel.id,
				userId: target.id
			}
		});
		await this.saveChanmsg(channel.id, user.id, 'banned '+target.nickname+' from the channel', true);
	}

	async muteUser(user: User, target: User, channel, time) {
		// IF TARGET USER DOESN'T EXIST
		if (!target) {
			throw new Error('target user not found');
		}
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('target channel not found');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF USER NOT ADMIN
		if (!(await this.isAdmin(channel.id, user.id))) {
			throw new Error('you are not admin');
		}
		// IF TARGET NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === target.id;})) {
			throw new Error('target is not in this channel');
		}
		// IF TARGET IS OWNER
		if (await this.isOwner(channel.id, target.id)) {
			throw new Error('target user is channel owner!');
		}
		// IF TARGET ALREADY MUTED
		if (await this.isMuted(channel.id, target.id)) {
			throw new Error('target is already muted');
		}
		// IF NO TIME SPECIFIED
		if (!time) {
			throw new Error('Missing mute time');
		}
		// IF WRONG TIME FORMAT
		const timeNum = parseInt(time);
		if (Number.isNaN(timeNum) || timeNum <= 0) {
			throw new Error('Incorrect time format');
		}

		// OK, mute user
		const currTime = new Date();
		const endTime = new Date(currTime.getTime() + timeNum * 60000);
		
		await this.prisma.member.update({
			where: {
				chanId_userId: {
					chanId: channel.id,
					userId: target.id
				}
			},
			data: {
				muted: true,
				muteEnd: endTime
			}
		});
		await this.saveChanmsg(channel.id, user.id, 'muted '+target.nickname, true);
	}

	async inviteUser(user: User, target: User, channel) {
		// IF TARGET USER DOESN'T EXIST
		if (!target) {
			throw new Error('target user not found');
		}
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('target channel not found');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF CHANNEL NOT PRIVATE
		if (channel.access !== 'private') {
			throw new Error('this channel is not private');
		}
		// IF USER NOT ADMIN
		if (!(await this.isAdmin(channel.id, user.id))) {
			throw new Error('you are not admin');
		}
		// IF NOT FRIENDS WITH TARGET
		if (!(await this.isFriend(user.id, target.id))) {
			throw new Error('you are not friends with this user');
		}
		// IF TARGET ALREADY IN CHANNEL
		if (channel.members.find(member => {return member.userId === target.id;})) {
			throw new Error('target is already in this channel');
		}
		// IF TARGET IS BANNED
		if (await this.isBanned(channel.id, target.id)) {
			throw new Error('target is banned from this channel');
		}
		// IF ALREADY INVITED
		if (await this.isInvited(channel.id, target.id)) {
			throw new Error('target already invited');
		}

		// OK, add invite
		await this.prisma.invited.create({
			data: {
				chanId: channel.id,
				userId: target.id
			}
		});

		// + Add to privmsg history
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
		var id1: number;
		var id2: number;
		if (friendship1.id < friendship2.id) {
			id1 = friendship1.id;
			id2 = friendship2.id;
		} else {
			id1 = friendship2.id;
			id2 = friendship1.id;
		}
		await this.prisma.privmsg.create({
			data: {
				friend1Id: id1,
				friend2Id: id2,
				userId: user.id,
				message: `invited ${target.nickname} to ${channel.name}`,
				isCommand: true
			}
		});
	}

	async addAdmin(user: User, target: User, channel) {
		// IF TARGET USER DOESN'T EXIST
		if (!target) {
			throw new Error('target user not found');
		}
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('target channel not found');
		}
		// IF NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === user.id;})) {
			throw new Error('you are not in this channel');
		}
		// IF TARGET NOT IN CHANNEL
		if (!channel.members.find(member => {return member.userId === target.id;})) {
			throw new Error('target is not in this channel');
		}
		// IF NOT OWNER
		if (!(await this.isOwner(channel.id, user.id))) {
			throw new Error('you are not the channel owner');
		}
		// IF TARGET ALREADY ADMIN
		if (await this.isAdmin(channel.id, target.id)) {
			throw new Error('target is already an admin');
		}

		// OK, add admin
		await this.prisma.member.update({
			where: {
				chanId_userId: {
					chanId: channel.id,
					userId: target.id
				}
			},
			data: {
				admin: true
			}
		});
		await this.saveChanmsg(channel.id, user.id, 'made '+target.nickname+' an admin', true);
	}

	async statusOnline(userId: number) {
		try {
			await this.prisma.user.update({
				where: {id: userId},
				data: {status: 'online'}
			});
		} catch(error) {
			console.log('Failed to update user status');
		}
	}

	async statusOffline(userId: number) {
		try {
			await this.prisma.user.update({
				where: {id: userId},
				data: {status: 'offline'}
			});
		} catch(error) {
			console.log('Failed to update user status');
		}
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

	async isMuted(chanId: number, userId: number): Promise<boolean> {
		// get member
		const member = await this.prisma.member.findUnique({
			where: {
				chanId_userId: {
					chanId: chanId,
					userId: userId
				}
			}
		});
		if (!member)
			console.log('PAS MEMBER??');
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

	async isOwner(chanId: number, userId: number): Promise<boolean> {
		const member = await this.prisma.member.findUnique({
			where: {
				chanId_userId: {
					chanId: chanId,
					userId: userId
				}
			}
		});
		return member.owner;
	}

	async isFriend(userId: number, targetId: number): Promise<boolean> {
		const friendship = await this.prisma.friendship.findUnique({
			where: {
				user1Id_user2Id: {
					user1Id: userId,
					user2Id: targetId
				}
			}
		});
		if (friendship)
			return true;
		return false;
	}

	async isIngame(userId: number): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: {id: userId}
		});

		if (user.status === 'ingame')
			return true;
		return false;
	}

	validateName(name: string) {
		if (name.length < 4 || name.length > 20)
			throw new Error('Channel name must be 4-20 characters');
		
		const pattern =  /^[a-zA-Z0-9_-]*$/;
		if (!pattern.test(name))
			throw new Error('Forbidden characters in channel name');
	}

	validatePassword(pw: string) {
		if (pw.length < 8 || pw.length > 20)
			throw new Error('Password must be 8-20 characters');
		
		const pattern =  /^[a-zA-Z0-9_-]*$/;
		if (!pattern.test(pw))
			throw new Error('Forbidden characters in password');
	}

	async deleteChannel(chanId: number) {
		// delete invited
		await this.prisma.invited.deleteMany({
			where: {chanId: chanId}
		});
		// delete banned
		await this.prisma.banned.deleteMany({
			where: {chanId: chanId}
		});
		// delete messages
		await this.prisma.chanmsg.deleteMany({
			where: {chanId: chanId}
		})
		// delete members
		await this.prisma.member.deleteMany({
			where: {chanId: chanId}
		});
		// delete channel
		await this.prisma.channel.delete({
			where: {id: chanId}
		});
	}

	async saveChanmsg(chanId: number, senderId: number, message: string, isCmd: boolean) {
		await this.prisma.chanmsg.create({
			data: {
				chanId: chanId,
				userId: senderId,
				message: message,
				isCommand: isCmd
			}
		});
	}

	async filterBlockedMessages(user: User, messages) {
		const filteredMessages = await Promise.all(
			messages.map(async (message) => {
				if (!(await this.isBlocked(user.id, message.userId))) {
					return message;
				}
			})
		);
		return filteredMessages.filter((message) => message !== undefined);
	}
}