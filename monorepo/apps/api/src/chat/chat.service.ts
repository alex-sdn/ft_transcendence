import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Channel, ChatAccess, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	/*                *\
	**   CONTROLLER   **
	\*                */
	async getMyChannels(user) {
		const fullUser = await this.prisma.user.findUnique({
			where: {id: user.id},
			include: {channels: true}
		});
		var channels = fullUser.channels;
		
		// delete passwords
		for (var i in channels) {
			delete channels[i].password;
		}
		return channels;
	}

	async getAllChannels() {
		const channels = await this.prisma.channel.findMany()
		
		// delete passwords
		for (var i in channels) {
			delete channels[i].password;
			delete channels[i].admins;
			delete channels[i].bans
			// + delete list of bans/admins/etc ?
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

		const members = chan.members;
		var updatedMembers = [];
		// filter returned data
		for (var i in members) {
			var updatedMember = {
				id: members[i].id,
				nickname: members[i].nickname,
				avatar: members[i].avatar,
				owner: false,
				admin: false
			};
			// set owner & admin
			if (chan.owner === members[i].id)
				updatedMember.owner = true;
			if (chan.admins.includes(members[i].id))
				updatedMember.admin = true;
			updatedMembers.push(updatedMember);
		}
		// check if user is in, don't send info otherwise
		for (var i in updatedMembers) {
			if (updatedMembers[i].id === user.id)
				return updatedMembers;
		}
		throw new HttpException('NOT_IN_CHANNEL', HttpStatus.FORBIDDEN);
	}


	/*             *\
	**   GATEWAY   **
	\*             */
	async joinChannel(channel, user: User, password: string) {
		// IF CHANNEL DOESN'T EXIST
		if (!channel) {
			throw new Error('channel does not exist, connection failed');
		}
		// IF USER IN CHANNEL
		if (channel.members.find(member => {return member.id === user.id;})) {
			throw new Error('you are already in this channel');
		}
		// IF CHANNEL PRIVATE AND NOT INVITED
		if (channel.access === 'private') {
			// check if invited here!!!!
			throw new Error('channel private, (not invited)');
		}
		// IF BANNED FROM CHANNEL
		else if (channel.bans.includes(user.id)) {
			throw new Error('you are banned from this channel');
		}
		// IF CHANNEL PROTECTED AND WRONG PASSWORD
		else if (channel.access === 'protected' && password !== channel.password) {
			throw new Error('channel protected, incorrect password');
		}

		// add User to channel users[]
		await this.prisma.channel.update({
			where: {id: channel.id},
			data: {
				members: {
					connect: {id: user.id}}
			}
		});
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
		
		try {
			// Create channel
			const channel = await this.prisma.channel.create({
				data: {
					name: message.target,
					owner: user.id,
					access: message.access,
					password: message.password,
				}
			});
			// Add user  (+set as owner! +admin)
			await this.prisma.channel.update({
				where: {id: channel.id},
				data: {
					members: {
						connect: {id: user.id}
					}
				}
			});
		} catch(error) {
			throw new Error('Failed to create channel');
		}
	}
}