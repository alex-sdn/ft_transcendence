import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "../game.service";
import { instrument } from "@socket.io/admin-ui";
import { width, height, Puck, Paddle } from '../game.math';

let intervalId;
let isPlaying: boolean = false;

export interface PuckPos {
    x: number;
    y: number;
}

export interface PuckDir {
    x: number;
    y: number;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	
	@WebSocketServer()
	server: Server;

	private puck: Puck;
    private left: Paddle;
    private right: Paddle;

	constructor(
		private gameService: GameService,
		private authService: AuthService,
		private prisma: PrismaService) {
		this.puck = new Puck();
        this.left = new Paddle(true);
        this.right = new Paddle(false);
	}

	// < user.id, Socket >
	private userToSocket = new Map<number, Socket>();
	// < client.id, User >  (replace user with userId for updates?)
	private idToUser = new Map<string, User>();

	//for socket.io admin UI
    afterInit() {
        instrument(this.server, {
            auth: false,
            mode: "development",
        });
    }

	// Add user to maps if jwt OK, disconnect if not
	async handleConnection(client: any, ...args: any[]) {
		console.log("New game WS connection attempted ("+client.id+")");

		const user = await this.authService.validateToken(client.handshake.headers.authorization);
		if (!user) {
			console.log('Connection to game WS refused');
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

	async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }	

	@SubscribeMessage('userAction')
    async onUserAction(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
        const { action } = body;
        if (action === 'upPressed') {
            console.log('up pressed');
            this.left.update(-10);
        } else if (action === 'downPressed') {
            console.log('down pressed');
            this.left.update(10);
        }
        //} else if (action === 'released') {
        //    console.log('released');
        //    this.left.move(0);
        //}
        //this.left.update();
        console.log(this.left.getY());  
    }

    @SubscribeMessage('gameStart')
    async onGameStart(@MessageBody() body: any) {
        console.log("PLAY");
        isPlaying = true;

        const newPuckPos = { x: this.puck.getX(), y: this.puck.getY() };
        const newPuckDir = { x: this.puck.getXSpeed(), y: this.puck.getYSpeed() };
        this.server.emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });

        while (isPlaying === true) {
            //const updatePuckInterval = setInterval(() => {
                this.puck.update();
                //if (this.puck.checkPaddleRight(this.right) || this.puck.checkPaddleLeft(this.left) || this.puck.checkEdges()) {
                    this.puck.checkPaddleRight(this.right);
                    this.puck.checkPaddleLeft(this.left); 
                    this.puck.checkEdges();
                    const newPuckPos = { x: this.puck.getX(), y: this.puck.getY() };
                    const newPuckDir = { x: this.puck.getXSpeed(), y: this.puck.getYSpeed() };
                    this.server.emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
                    //console.log("PUCK COORDINATES");
                    //console.log(this.puck.getX());
                    //console.log(this.puck.getY());
                //}
            //}, 1000 / 60);
            const newPos = { leftPos: this.left.getY(), rightPos: this.right.getY() };
            this.server.emit('Paddle', { paddle: newPos });
            await this.sleep(20);
        }
    }
}
