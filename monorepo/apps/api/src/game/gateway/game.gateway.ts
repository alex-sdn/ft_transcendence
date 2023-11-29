import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "../game.service";
import { instrument } from "@socket.io/admin-ui";
import { width, height, Puck, Paddle, leftscore, rightscore } from '../game.math';

//let intervalId;

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

    /******************************************************************************
    *                         CONNECTION & DISCONNECTION                          *
    ******************************************************************************/

	// < user.id, Socket >
	private userToSocket = new Map<number, Socket>();

	// < client.id, User >  (replace user with userId for updates?)
	private idToUser = new Map<string, User>();

    private roomsList = new Map<number, string>();

    private DefaultWaitingList = new Map<number, string>();

    private UpgradedWaitingList = new Map<number, string>();

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
            
            console.log("USER ID : "+user.id+" ");
            console.log("CLIENT ID : "+client.id+" ");

            //console.log("****USER TO SOCKET****");
            //this.userToSocket.forEach((socket, userId) => {
            //    console.log(`User ID: ${userId}, Socket:`, socket);
            //});
            //console.log("****ID TO USER****");
            //this.idToUser.forEach((user, userId) => {
            //    console.log(`User ID: ${userId}, User:`, user);
            //})
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

	//for socket.io admin UI
    afterInit() {
        instrument(this.server, {
            auth: false,
            mode: "development",
        });
    }

    /******************************************************************************
    *                                   EVENTS                                    *
    ******************************************************************************/

	@SubscribeMessage('keys')
    async onKeys(@ConnectedSocket() client: Socket, @MessageBody() body: any) {
        const { action } = body;
        if (action === 'upPressed') {
            //console.log('up pressed');
            this.left.move(-10);
        } else if (action === 'downPressed') {
            //console.log('down pressed');
            this.left.move(10);
        } else if (action === 'released') {
            //console.log('released');
            this.left.move(0);
        }
        this.left.update();
        //console.log(this.left.getY());  
    }

	@SubscribeMessage('robot')
    async onRobot(@ConnectedSocket() client: Socket) {
        
    }

	@SubscribeMessage('default')
    async onDefault(@ConnectedSocket() client: Socket) {
        
    }

	@SubscribeMessage('upgraded')
    async onUpgraded(@ConnectedSocket() client: Socket) {
        
    }

    @SubscribeMessage('ready')
    async onReady(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {
        
    }


    /******************************************************************************
    *                                   MATCHMAKING                               *
    ******************************************************************************/


    /******************************************************************************
    *                                  GAME LOOP                                  *
    ******************************************************************************/

	async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }	

    @SubscribeMessage('gameStart')
    async onGameStart(@MessageBody() body: any) {
        //console.log("PLAY");
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
                    if (this.puck.checkEdges())
                        this.server.emit('Score', { left: leftscore, right: rightscore });
                    const newPuckPos = { x: this.puck.getX(), y: this.puck.getY() };
                    const newPuckDir = { x: this.puck.getXSpeed(), y: this.puck.getYSpeed() };
                    this.server.emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
                    //console.log("PUCK COORDINATES");
                    //console.log(this.puck.getX());
                    //console.log(this.puck.getY());
                //}
            //}, 1000 / 60);
            //const newPos = { leftPos: this.left.getY(), rightPos: this.right.getY() };
            this.server.emit('Paddle', { leftPos: this.left.getY(), rightPos: this.right.getY() });
            //console.log(newPos.leftPos);
            await this.sleep(20);
        }
    }
}
