import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ChatService } from "../chat.service";

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private prisma: PrismaService) {}

	@WebSocketServer()
	server: Server;

	// < user.id, Socket >
	private userToSocket = new Map<number, Socket>();
	// < client.id, User >  (replace user with userId for updates?)
	private idToUser = new Map<string, User>();

	// Add user to maps if jwt OK, disconnect if not
	async handleConnection(client: any, ...args: any[]) {
		console.log("New chat WS connection attempted ("+client.id+")");

		const user = await this.authService.validateToken(client.handshake.headers.authorization);
		if (!user) {
			console.log('Connection to chat WS refused');
			client.disconnect();
		}
		else {
			console.log('Connection accepted for', user.nickname);
			// add to maps
			this.userToSocket.set(user.id, client);
			this.idToUser.set(client.id, user);
		}
	}

	handleDisconnect(client: any) {
		console.log(client.id, "disconnected");
		// rm from maps (if in)
		if (this.idToUser.has(client.id)) {
			this.userToSocket.delete(this.idToUser.get(client.id).id);
			this.idToUser.delete(client.id);
		}
	}


	/**  EVENTS  **/
	@SubscribeMessage('message')  // ==channel
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		// console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);
	
		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: {name: message.target},
			include: {members: true}
		});

		try {
			await this.chatService.messageChannel(channel, user);
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
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}

	@SubscribeMessage('privmsg')  // ==dm
	async handlePrivMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		// console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);

		const sender = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});
		// Get target user
		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});

		try {
			await this.chatService.privMessage(sender, target);
			
			// Get target socket
			const targetSocket = this.userToSocket.get(target.id);
			if (!targetSocket) {
				throw new Error('target not connected to ws');
			}
			// Send to target AND sender (?)
			targetSocket.emit('privmsg', {
				sender: sender.nickname,
				message: message.message
			});
			client.emit('privmsg', {
				sender: sender.nickname,
				message: message.message
			});
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}
	
	@SubscribeMessage('create')
	async handleCreate(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("create", message);

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
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}

	@SubscribeMessage('join')
	async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("join", message);

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: {name: message.target},
			include: {members: true}
		});

		try {
			await this.chatService.joinChannel(channel, user, message.password);
			// send message to client if successful
			client.emit('join', {
				sender: user.nickname,
				target: message.target,
				message: 'has joined the channel'
			});
			// send message to all users ?
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
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}

	@SubscribeMessage('leave')
	async handleLeave(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("leave", message);

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: {name: message.target},
			include: {members: true}
		});

		try {
			await this.chatService.leaveChannel(channel, user);
			// send message to client if successful  //dont need bc old member list here (verify)
			// client.emit('leave', {
			// 	sender: user.nickname,
			// 	target: message.target,
			// 	message: 'has left the channel'
			// });
			// send message to all users ?
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
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}

	@SubscribeMessage('access')
	async handleAccess(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("access", message);

		const user = await this.prisma.user.findUnique({
			where: { id: this.idToUser.get(client.id).id }
		});

		const channel = await this.prisma.channel.findUnique({
			where: {name: message.target},
			include: {members: true}
		});

		try {
			await this.chatService.changeAccess(channel, user, message.access, message.password);

			// send message to all users ?
			for (var i in channel.members) {
				const socket = this.userToSocket.get(channel.members[i].userId);
				// if channel member is connected -> send leave message
				if (socket) {
					socket.emit('access', {
						sender: user.nickname,
						target: message.target,
						access: message.access
					});
				}
			}
		} catch(error) {  // maybe verify error type
			//send error message to socket?
			console.log(error.message);
		}
	}

}
