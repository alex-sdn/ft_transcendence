import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "../game.service";
import { instrument } from "@socket.io/admin-ui";
import { width, height, Puck, Paddle, POINT } from '../game.math';
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

	// < client.id, User >
	private idToUser = new Map<string, User>();

    // <roomName, Room>
    private roomsList = new Map<string, Room>();

    // <client.id, Room>
    private roomsParticipants = new Map<string, Room>();

    // <client.id, User>
    private defaultWaitingList = new Map<string, User>();

    // <client.id, User>
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

		}
	}

	handleDisconnect(client: any) {
		console.log(client.id, "disconnected");

        //check if client was in a room if so send Game.End
        if (this.roomsParticipants.has(client.id))
        {
            console.log("****HAS****");
            this.roomsParticipants.get(client.id).setGameEnd();
        }
        //check if client was in a waiting room if so remove from it

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
        await this.matchmaking(OPTION.Robot);
    }

	@SubscribeMessage('keys')
    async onKeys(@ConnectedSocket() client: Socket, @MessageBody('action') action: string,
    @MessageBody('roomName') roomName: string, @MessageBody('role') role: ROLE) {

        const room = this.roomsList.get(roomName);      

        if (role == ROLE.Left)
        {
            if (action === 'upPressed') {
                room.getLeftPaddle().move(-10);
            } else if (action === 'downPressed') {
                room.getLeftPaddle().move(10);;
            } else if (action === 'released') {
                room.getLeftPaddle().move(-10);
            }
            room.getLeftPaddle().update();
        }
        if (role == ROLE.Right)
        {
            if (action === 'upPressed') {
                room.getRightPaddle().move(-10);
            } else if (action === 'downPressed') {
                room.getRightPaddle().move(10);;
            } else if (action === 'released') {
                room.getRightPaddle().move(-10);
            }
            room.getRightPaddle().update();
        }
    }

    /******************************************************************************
    *                                   MATCHMAKING                               *
    ******************************************************************************/

    async matchmaking(option:OPTION) // add upgraded features
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

                const roomName = `default-${firstId.value}-${secondId.value}`;

                const firstClient = this.userToSocket.get(firstPlayer.value.id);
                const secondClient = this.userToSocket.get(secondPlayer.value.id);

                const room = new Room(roomName, firstPlayer.value, secondPlayer.value);

                await firstClient.join(roomName);
                await secondClient.join(roomName);

                firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
                secondClient.emit('Room', { name: roomName, role: ROLE.Right, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });

                this.roomsList.set(roomName, room);

                console.log("PARTICIPANTS");
                console.log(firstId.value);
                console.log(secondId.value);
                
                this.roomsParticipants.set(firstId.value, room);
                this.roomsParticipants.set(secondId.value, room);

                this.server.to(roomName).emit('AreYouReady');

                this.defaultWaitingList.delete(firstId.value);
                this.defaultWaitingList.delete(secondId.value);

           }
        }

        // //ROBOT ROOM CREATION
        // else if (option == OPTION.Robot)
        // {
        //     const roomName = `default-${client.id}-robot`;

        //     const room = new Room(roomName, firstPlayer.value, robot);

        //     await client.join(roomName);

        //     firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: "robot" });

        //     this.roomsList.set(roomName, room);

        //     this.server.to(roomName).emit('AreYouReady');

        //     this.defaultWaitingList.delete(firstId.value);
        // }
    }

    /******************************************************************************
    *                                  GAME LOOP                                  *
    ******************************************************************************/

	async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }	

    @SubscribeMessage('ready')
    async onReady(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {

        const room = this.roomsList.get(roomName);
        
        room.isReady();

        //both players are ready --> start game loop
        if (room.getReady() >= 2)
        {
            this.gameService.statusIngame(room.getLeftUser().id);
            this.gameService.statusIngame(room.getRightUser().id);
            //set count down
            isPlaying = true;

            const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
            const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
            this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
    
            while (isPlaying === true && !room.getGameEnd()) {
                //const updatePuckInterval = setInterval(() => {
                    room.getPuck().update();
                    //if (this.puck.checkPaddleRight(this.right) || this.puck.checkPaddleLeft(this.left) || this.puck.checkEdges()) {
                        room.getPuck().checkPaddleRight(room.getRightPaddle());
                        room.getPuck().checkPaddleLeft(room.getLeftPaddle());
                        const point = room.getPuck().checkEdges();
                        if (point == POINT.Left)
                        {
                            room.leftPoint();
                            this.server.to(roomName).emit('Score', { left: room.getLeftScore(), right: room.getRightScore() });
                        }
                        if (point == POINT.Right)
                        {
                            room.rightPoint();
                            this.server.to(roomName).emit('Score', { left: room.getLeftScore(), right: room.getRightScore() });
                        }
                        const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
                        const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
                        this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
                    //}
                //}, 1000 / 60);
                this.server.to(roomName).emit('Paddle', { leftPos: room.getLeftPaddle().getY(), rightPos: room.getRightPaddle().getY() });
                await this.sleep(10);
            }

            //if end of game due to deconnection --> set the one who deconnected as loser



            this.gameService.createMatch(room.getLeftUser().id, room.getRightUser().id, room.getLeftScore(), room.getRightScore(), "ranked");
            this.gameService.statusOnline(room.getLeftUser().id);
            this.gameService.statusOnline(room.getRightUser().id);
        }
    }

    // clean leave
    @SubscribeMessage('leave')
    async onLeave(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {
        client.leave(roomName);
        //delete room from map
        // socket.emit (init all)
    }

}  
