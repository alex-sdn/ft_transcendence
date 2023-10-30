import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";

@WebSocketGateway({namespace: 'chat'})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	// < client.id, User >  (replace user with userId for updates?)
	private clients = new Map<string, User>();

	// Add user to connected clients map if jwt OK
	async handleConnection(client: any, ...args: any[]) {
		console.log("New chat WS connection attempted ("+client.id+")");

		const user = await this.authService.validateToken(client.handshake.headers.authorization);
		if (!user) {
			console.log('Connection to chat WS refused');
			client.disconnect();
		}
		else {
			console.log('Connection accepted for', user.nickname);
			this.clients.set(client.id, user);
		}
	}

	handleDisconnect(client: any) {
		console.log(client.id, "disconnected");
		this.clients.delete(client.id);
	}

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		console.log("[msg] ", this.clients.get(client.id).nickname + ":", message);
	}

	@SubscribeMessage('join')
	handleJoin(@MessageBody() message: any) {
		console.log("join", message);
	}

}
