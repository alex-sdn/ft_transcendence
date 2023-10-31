import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
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
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);
	}

	@SubscribeMessage('privmsg')  // ==dm
	async handlePrivMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		// console.log("[msg] ", this.idToUser.get(client.id).nickname + ":", message);

		// Get target user
		const target = await this.prisma.user.findUnique({
			where: { nickname: message.target }
		});
		if (!target) {
			console.log('target not found');
			return;//target not found
		}

		// Get target socket
		const targetSocket = this.userToSocket.get(target.id);
		if (!targetSocket) {
			console.log('target not connected to ws');
			return;//target not connected
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
			// + include banned and verify
		});

		if (!channel) {
			console.log('channel does not exist, connection failed'); return;
		}

		if (channel.access === 'private') {
			// check if invited here!!!!
			// Send fail message ?
			console.log('channel private, (not invited)'); return;
		}
		else if (channel.access === 'protected' && message.password !== channel.password) {
			// Send fail message ?
			console.log('channel protected, incorrect password'); return;
		}

		// add User to channel users[]
		await this.prisma.channel.update({
			where: {id: channel.id},
			data: {
				members: {
					connect: {id: user.id}}
			}
		});

		// send message to client if successful
		client.emit('join', {
			sender: user.nickname,
			message: 'has joined the channel'
		});
		// send message to all users ?
		for (var i in channel.members) {
			const socket = this.userToSocket.get(channel.members[i].id);
			// if channel member is connected -> send JOIN message
			if (socket) {
				socket.emit('join', {
					sender: user.nickname,
					message: 'has joined the channel'
				});
			}
		}
	}

}
