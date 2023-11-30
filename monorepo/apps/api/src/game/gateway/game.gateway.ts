import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "../game.service";
import { instrument } from "@socket.io/admin-ui";
import { width, height, Puck, Paddle, leftscore, rightscore } from '../game.math';
import { Room } from '../game.room';

let isPlaying: boolean = false;

export enum OPTION {
    Robot,
    Default,
    Upgraded,
}

export enum ROLE {
    Left,
    Right,
    Undefined,
}

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
	}

    /******************************************************************************
    *                         CONNECTION & DISCONNECTION                          *
    ******************************************************************************/

	// < user.id, Socket >
	private userToSocket = new Map<number, Socket>();

	// < client.id, User >  (replace user with userId for updates?)
	private idToUser = new Map<string, User>();

    private roomsList = new Map<string, Room>();

    private defaultWaitingList = new Map<string, User>();

    private upgradedWaitingList = new Map<string, User>();

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

	@SubscribeMessage('default')
    async onDefault(@ConnectedSocket() client: Socket) {
        
        const user = this.idToUser.get(client.id);
        this.defaultWaitingList.set(client.id, user);

        // this.defaultWaitingList.forEach((user, key) => {
        //     console.log(`Key: ${key}, User:`, user);
        // });

        await this.matchmaking(OPTION.Default);

    }

	@SubscribeMessage('upgraded')
    async onUpgraded(@ConnectedSocket() client: Socket) {                
        
        const user = this.idToUser.get(client.id);
        this.upgradedWaitingList.set(client.id, user);

        await this.matchmaking(OPTION.Upgraded);

    }

    @SubscribeMessage('robot')
    async onRobot(@ConnectedSocket() client: Socket) {
        //launch game against robot
    }

	@SubscribeMessage('keys') //change for socket room
    async onKeys(@ConnectedSocket() client: Socket, @MessageBody('action') action: string,
    @MessageBody('roomName') roomName: string, @MessageBody('role') role: ROLE) {

        console.log("----ROOM NAME----");
        console.log(roomName);

        const room = await this.roomsList.get(roomName);      

        //if role == ROLE.Left

        if (action === 'upPressed') {
            //console.log('up pressed');
            await room.getLeftPaddle().move(-10);
        } else if (action === 'downPressed') {
            //console.log('down pressed');
            await room.getLeftPaddle().move(10);;
        } else if (action === 'released') {
            //console.log('released');
            await room.getLeftPaddle().move(-10);
        }
        await room.getLeftPaddle().update();
        //console.log(this.left.getY());  
    }

    /******************************************************************************
    *                                   MATCHMAKING                               *
    ******************************************************************************/

    async matchmaking(option:OPTION) // add upgraded option
    {
        if (option == OPTION.Default)
        {
            if (this.defaultWaitingList.size >= 2)
            {
                const iteratorId = this.defaultWaitingList.keys();
                const iteratorPlayer = this.defaultWaitingList.values();

                const firstId = iteratorId.next();
                const firstPlayer = iteratorPlayer.next();

                const secondId = iteratorId.next();
                const secondPlayer = iteratorPlayer.next();

                // console.log("****FIRST PLAYER****");                
                // console.log(firstId);

                // console.log("****SECOND PLAYER****");                
                // console.log(secondId);

                const roomName = `default-${firstId.value}-${secondId.value}`;

                // console.log("****ROOM NAME****");
                // console.log(roomName);

                // console.log("DEBUG");
                // console.log(firstPlayer.value.id);

                const firstClient = await this.userToSocket.get(firstPlayer.value.id);
                const secondClient = await this.userToSocket.get(secondPlayer.value.id);

                await firstClient.join(roomName);
                await secondClient.join(roomName);

                await firstClient.emit('Room', { name: roomName, role: ROLE.Left });
                await secondClient.emit('Room', { name: roomName, role: ROLE.Right });

                const room = await new Room(roomName, firstPlayer.value, secondPlayer.value);

                this.roomsList.set(roomName, room);

                await this.server.to(roomName).emit('AreYouReady');

                this.defaultWaitingList.delete(firstId.value);
                this.defaultWaitingList.delete(secondId.value);

                // console.log("****EMPTY WAITING LIST****");
                // this.defaultWaitingList.forEach((user, key) => {
                //     console.log(`Key: ${key}, User:`, user);
                // });
            }
        }
    }

    /******************************************************************************
    *                                  GAME LOOP                                  *
    ******************************************************************************/

	async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }	

    @SubscribeMessage('ready')
    async onReady(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {

        const room = await this.roomsList.get(roomName);
        
        room.isReady();

        //both players are ready --> start game loop
        if (room.getReady() >= 2)
        {
            isPlaying = true;

            const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
            const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
            await this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
    
            while (isPlaying === true) {
                //const updatePuckInterval = setInterval(() => {
                    room.getPuck().update();
                    //if (this.puck.checkPaddleRight(this.right) || this.puck.checkPaddleLeft(this.left) || this.puck.checkEdges()) {
                        room.getPuck().checkPaddleRight(room.getRightPaddle());
                        room.getPuck().checkPaddleLeft(room.getLeftPaddle()); 
                        if (room.getPuck().checkEdges())
                            this.server.to(roomName).emit('Score', { left: 1, right: 0 });
                        const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
                        const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
                        await this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
                        //console.log("PUCK COORDINATES");
                        //console.log(this.puck.getX());
                        //console.log(this.puck.getY());
                    //}
                //}, 1000 / 60);
                //const newPos = { leftPos: this.left.getY(), rightPos: this.right.getY() };
                await this.server.to(roomName).emit('Paddle', { leftPos: room.getLeftPaddle().getY(), rightPos: room.getRightPaddle().getY() });
                //console.log(newPos.leftPos);
                await this.sleep(20);
            }
        }
    }
}  
