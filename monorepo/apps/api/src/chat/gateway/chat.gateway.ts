import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatService } from "../chat.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private prisma: PrismaService) { }

	@WebSocketServer()
	server: Server;

	// < user.id, Socket >
	private userToSocket = new Map<number, Socket>();
	// < client.id, User >
	private idToUser = new Map<string, User>();

	// Add user to maps if jwt OK, disconnect if not
	async handleConnection(client: any, ...args: any[]) {
		console.log("New chat WS connection attempted (" + client.id + ")");

		const user = await this.authService.validateToken(client.handshake.headers.authorization);
		if (!user) {
			console.log('Connection to chat WS refused');
			client.disconnect();
		}
		else {
			console.log('Connection accepted for', user.nickname);
			// status Online
			await this.chatService.statusOnline(user.id);
			// add to maps
			this.userToSocket.set(user.id, client);
			this.idToUser.set(client.id, user);
		}
	}

	async handleDisconnect(client: any) {
		console.log(client.id, "disconnected");

		if (this.idToUser.has(client.id)) {
			// status Offline
			await this.chatService.statusOffline(this.idToUser.get(client.id).id);
			// rm from maps
			this.userToSocket.delete(this.idToUser.get(client.id).id);
			this.idToUser.delete(client.id);
		}
	}


	/**  EVENTS  **/
	@SubscribeMessage('message')  // ==channel
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.target },
			include: { members: true }
		});

		try {
			await this.chatService.messageChannel(channel, user, message.message);
			//send to all connected members (including sender)
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected && not blocked -> emit message
				if (socket && !(await this.chatService.isBlocked(channel.members[i].userId, user.id))) {
					socket.emit('message', {
						sender: user.nickname,
						target: message.target,
						message: message.message
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('privmsg')  // ==dm
	async handlePrivMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const sender = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});
		// Get target user
		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		try {
			await this.chatService.privMessage(sender, target, message.message);

			// Get target socket
			const targetSocket = this.userToSocket.get(target.id);
			// Send to target AND sender
			if (targetSocket) {
				targetSocket.emit('privmsg', {
					sender: sender.nickname,
					message: message.message
				});
			}
			client.emit('privmsg', {
				sender: sender.nickname,
				message: message.message
			});
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('create')
	async handleCreate(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		try {
			await this.chatService.createChannel(user, message);

			client.emit('create', {
				sender: user.nickname,
				target: message.target,
				message: 'has created the channel'
			});
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('join')
	async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.target },
			include: { members: true }
		});

		try {
			await this.chatService.joinChannel(channel, user, message.password);
			// send message to client if successful
			client.emit('join', {
				sender: user.nickname,
				target: message.target,
				message: 'has joined the channel'
			});
			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> send JOIN message
				if (socket) {
					socket.emit('join', {
						sender: user.nickname,
						target: message.target,
						message: 'has joined the channel'
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('leave')
	async handleLeave(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.target },
			include: { members: true }
		});

		try {
			await this.chatService.leaveChannel(channel, user);
			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> send leave message
				if (socket) {
					socket.emit('leave', {
						sender: user.nickname,
						target: message.target,
						message: 'has left the channel'
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('access')
	async handleAccess(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.target },
			include: { members: true }
		});

		try {
			await this.chatService.changeAccess(channel, user, message.access, message.password);

			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> notify access change
				if (socket) {
					socket.emit('access', {
						sender: user.nickname,
						target: message.target,
						access: message.access
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('kick')
	async handleKick(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.channel },
			include: { members: true }
		});

		try {
			await this.chatService.kickUser(user, target, channel);

			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> send kick message
				if (socket) {
					socket.emit('kick', {
						sender: user.nickname,
						target: message.target,
						channel: channel.name
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('ban')
	async handleBan(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.channel },
			include: { members: true }
		});

		try {
			await this.chatService.banUser(user, target, channel);

			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> send ban message
				if (socket) {
					socket.emit('ban', {
						sender: user.nickname,
						target: message.target,
						channel: channel.name
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('mute')
	async handleMute(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.channel },
			include: { members: true }
		});

		try {
			await this.chatService.muteUser(user, target, channel, message.time);

			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected
				if (socket) {
					socket.emit('mute', {
						sender: user.nickname,
						target: message.target,
						channel: channel.name
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('invite')
	async handleInvite(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.channel },
			include: { members: true }
		});

		try {
			await this.chatService.inviteUser(user, target, channel);

			// Get target socket
			const targetSocket = this.userToSocket.get(target.id);
			// Notify target if connected AND sender
			if (targetSocket && !(await this.chatService.isIngame(target.id))) {
				targetSocket.emit('invite', {
					sender: user.nickname,
					target: target.nickname,
					channel: channel.name
				});
			}
			client.emit('invite', {
				sender: user.nickname,
				target: target.nickname,
				channel: channel.name
			});
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	@SubscribeMessage('admin')
	async handleAdmin(@ConnectedSocket() client: Socket, @MessageBody() message: any) {

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		const channel = await this.prisma.channel.findUnique({
			where: { name: message.channel },
			include: { members: true }
		});

		try {
			await this.chatService.addAdmin(user, target, channel);

			// send message to all users
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> notify new admin
				if (socket) {
					socket.emit('admin', {
						sender: user.nickname,
						target: message.target,
						channel: channel.name
					});
				}
			}
		} catch (error) {
			this.emitError(client, error.message);
		}
	}

	emitError(client: Socket, error: string) {
		client.emit('error', {
			message: error
		});
	}

	refreshNickname(userId: number) {
		const sockets = Array.from(this.userToSocket.values());
		// send to all sockets
		for (var i in sockets) {
			sockets[i].emit('refresh');
		}
	}

	blockEvent(blocker, blocked) {
		const blockedSocket = this.userToSocket.get(blocked.id);
		// if blocked user is online
		if (blockedSocket) {
			blockedSocket.emit('block', {
				sender: blocker.id,
				target: blocked.nickname
			});
		}
	}

}
