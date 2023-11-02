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
		// rm from maps
		this.userToSocket.delete(this.idToUser.get(client.id).id);
		this.idToUser.delete(client.id);
	}

	@SubscribeMessage('message')  // ==channel
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);
	
		const user = this.idToUser.get(client.id);

		const channel = await this.prisma.channel.findUnique({
			where: {name: message.target},
			include: {members: true}
		});

		if (!channel) {
			//emit fail msg?
			console.log('target channel does not exist'); return;
		}

		if (!channel.members.find(member => {return member.id === user.id;})) {
			//emit fail msg?
			console.log('you are not in this channel'); return;
		}

		// VERIFY IF NOT MUTED IN CHANNEL

		//send to all connected members (including sender)
		for (var i in channel.members) {
			const socket = this.userToSocket.get(channel.members[i].id);
			// if channel member is connected -> emit message
			// VERIFY IF SENDER NOT MUTED BY MEMBER
			if (socket) {
				socket.emit('message', {
					sender: user.nickname,
					target: message.target,
					message: message.message
				});
			}
			console.log('looped');
		}
	}

	@SubscribeMessage('privmsg')  // ==dm
	async handlePrivMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		// console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);

		// Get target user
		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});
		if (!target) {
			//emit fail msg?
			console.log('target not found'); return;
		}

		// Get target socket
		const targetSocket = this.userToSocket.get(target.id);
		if (!targetSocket) {  //target not connected
			//emit fail msg?
			console.log('target not connected to ws'); return;
		}
		
		const sender = this.idToUser.get(client.id).nickname;
		// Send to target AND sender (?)
		targetSocket.emit('privmsg', {
			sender: sender,
			message: message.message
		});
		client.emit('privmsg', {
			sender: sender,
			message: message.message
		});
	}

	@SubscribeMessage('join')
	async handleJoin(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("join", message);

		const user = this.idToUser.get(client.id);

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
				const socket = this.userToSocket.get(channel.members[i].id);
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

	@SubscribeMessage('create')
	async handleCreate(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("create", message);

		const user = this.idToUser.get(client.id);
	
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

}
