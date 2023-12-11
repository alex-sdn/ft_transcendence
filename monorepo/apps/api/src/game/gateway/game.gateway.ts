import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { GameService } from "../game.service";
import { instrument } from "@socket.io/admin-ui";
import { width, height, Puck, Paddle, POINT, PRECISION } from '../game.math';
import { Room } from '../game.room';

export enum OPTION {
    Robot,
    Retro,
    CoolCat,
    WeirdCrowd,
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
    *                               WAITING LISTS                                 *
    ******************************************************************************/

    /* ROOMS + PARTICIPANTS */

    // <roomName, Room>
    private roomsList = new Map<string, Room>();

    // <client.id, Room>
    private roomsParticipants = new Map<string, Room>();

    // <roomName, intervalId>
    private robotInterval = new Map<string, any>();


    /* WAITING LISTS */

    // <client.id, User>
    private robotWaitingList = new Map<string, User>();

    // <client.id, User>
    private retroWaitingList = new Map<string, User>();

    // <client.id, User>
    private coolCatWaitingList = new Map<string, User>();

    // <client.id, User>
    private weirdCrowdWaitingList = new Map<string, User>();

    // < 'id1-id2', [id1, id2] >
    private friendWaitingList = new Map<string, number[]>;

    /******************************************************************************
    *                         CONNECTION & DISCONNECTION                          *
    ******************************************************************************/

    // < user.id, Socket >
    private userToSocket = new Map<number, Socket>();

    // < client.id, User >
    private idToUser = new Map<string, User>();

    // Add user to maps if jwt OK, disconnect if not
    async handleConnection(client: any, ...args: any[]) {
        console.log("New game WS connection attempted (" + client.id + ")");

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

    async handleDisconnect(client: any) {

        console.log(client.id, "disconnected");

        if (this.idToUser.has(client.id)) {
            //check if client was in a room if so set Game.End and send info to front of other player
            if (this.roomsParticipants.has(client.id)) {
                const roomName = this.roomsParticipants.get(client.id).getName();
				if (!this.roomsParticipants.get(client.id).getGameEnd()) {
					this.server.to(roomName).emit("LogOut");
					this.roomsParticipants.get(client.id).setGameEnd();
				}
                console.log('set game end bc deco')
            }

            //check if client was in a waiting room if so remove from it
            this.withdrawFromAllWaitingLists(client.id);

            // rm from maps
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
    *                                GAME OPTIONS                                 *
    ******************************************************************************/

    @SubscribeMessage('robot')
    async onRobot(@ConnectedSocket() client: Socket) {

        const user = this.idToUser.get(client.id);
        this.robotWaitingList.set(client.id, user);

        await this.matchmaking(OPTION.Robot);

    }

    @SubscribeMessage('retro')
    async onRetro(@ConnectedSocket() client: Socket) {

        const user = this.idToUser.get(client.id);
        this.retroWaitingList.set(client.id, user);

        await this.matchmaking(OPTION.Retro);

    }

    @SubscribeMessage('coolcatopt')
    async onCoolcatopt(@ConnectedSocket() client: Socket) {

        const user = this.idToUser.get(client.id);
        this.coolCatWaitingList.set(client.id, user);

        await this.matchmaking(OPTION.CoolCat);

    }

    @SubscribeMessage('weirdCrowd')
    async onWeirdCrowd(@ConnectedSocket() client: Socket) {

        const user = this.idToUser.get(client.id);
        this.retroWaitingList.set(client.id, user);

        await this.matchmaking(OPTION.Retro);

    }

    async withdrawFromAllWaitingLists(clientId: string) {
        if (this.robotWaitingList.has(clientId))
            this.robotWaitingList.delete(clientId);

        if (this.retroWaitingList.has(clientId))
            this.retroWaitingList.delete(clientId);

        if (this.coolCatWaitingList.has(clientId))
            this.coolCatWaitingList.delete(clientId);

        if (this.weirdCrowdWaitingList.has(clientId))
            this.weirdCrowdWaitingList.delete(clientId);

    }

    /******************************************************************************
    *                             FRIEND INVITATION                               *
    ******************************************************************************/

    // INVITE TEST
    @SubscribeMessage('inviteGame')
    async handleInviteGame(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
        console.log("invite game", message)

        const user = await this.prisma.user.findUnique({
            where: { id: this.idToUser.get(client.id).id }
        });

        const target = await this.prisma.user.findUnique({
            where: { nickname: message.target }
        });
        // if target is offline
        if (!target) {
            client.emit('error', {
                message: 'This user does not exist'
            });
			return;
        }
        const targetSocket = this.userToSocket.get(target.id);

        // if target is offline
        if (!targetSocket) {
            client.emit('error', {
                message: 'This user is not online'
            });
			return;
        }
        // if target is ingame
        if (target.status === 'ingame') {
            client.emit('error', {
                message: 'This user is currently in-game'
            });
			return;
        }

        var listName;
        if (user.id < target.id)
            listName = user.id + '-' + target.id;
        else
            listName = target.id + '-' + user.id;
        // if first invite -> create waiting list for private game
        if (!this.friendWaitingList.has(listName)) {
            console.log("-creating friendWaitingList")
            this.friendWaitingList.set(listName, [user.id, target.id]);
            // renvoyer l'invite a target
            targetSocket.emit('inviteGame', {
                sender: user.nickname,
                target: target.nickname,
                // game type aussi
            });
        }
        // Already received invite -> start game
        else {
            //remove from all waiting lists
            this.withdrawFromAllWaitingLists(client.id);
            this.withdrawFromAllWaitingLists(targetSocket.id);

            // Send startGame event
            client.emit('startGame');
            targetSocket.emit('startGame');

            await this.sleep(300);
            var socketP1 = this.userToSocket.get(user.id);
            var socketP2 = this.userToSocket.get(target.id);
            // wait for new socket connection
            while (!socketP1 || !socketP2 || socketP1.id === client.id || socketP2.id === targetSocket.id) {
                socketP1 = this.userToSocket.get(user.id);
                socketP2 = this.userToSocket.get(target.id);
            }

            // create room	
            const room = new Room(listName, user, target, OPTION.Retro);

            // const socketP1 = this.userToSocket.get(user.id);
            // const socketP2 = this.userToSocket.get(target.id)

            await socketP1.join(listName);
            await socketP2.join(listName);

            // send room initial info to front
            socketP1.emit('Room', { name: listName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
            socketP2.emit('Room', { name: listName, role: ROLE.Right, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
            this.roomsList.set(listName, room);

            this.roomsParticipants.set(socketP1.id, room);
            this.roomsParticipants.set(socketP2.id, room);
            this.server.to(listName).emit('AreYouReady');
            this.friendWaitingList.delete(listName);
        }
    }

    /******************************************************************************
    *                                KEYS HANDLING                                *
    ******************************************************************************/

    @SubscribeMessage('keys')
    async onKeys(@ConnectedSocket() client: Socket, @MessageBody('action') action: string,
        @MessageBody('roomName') roomName: string, @MessageBody('role') role: ROLE) {

        const room = this.roomsList.get(roomName);

        let steps;
        //if (room.getOption() == OPTION.CoolCat)
        //    steps = 3;
        //else
        steps = 10;

        if (role == ROLE.Left) {
            if (action === 'upPressed') {
                room.getLeftPaddle().move(-1 * steps * PRECISION);
            } else if (action === 'downPressed') {
                room.getLeftPaddle().move(steps * PRECISION);
            } else if (action === 'released') {
                room.getLeftPaddle().move(0);
            }
            room.getLeftPaddle().update();
        }
        if (role == ROLE.Right) {
            if (action === 'upPressed') {
                room.getRightPaddle().move(-1 * steps * PRECISION);
            } else if (action === 'downPressed') {
                room.getRightPaddle().move(steps * PRECISION);
            } else if (action === 'released') {
                room.getRightPaddle().move(0);
            }
            room.getRightPaddle().update();
        }
    }

    /******************************************************************************
    *                                   COOL CAT                                  *
    ******************************************************************************/

    @SubscribeMessage('coolcat')
    async onCoolcat(@ConnectedSocket() client: Socket, @MessageBody('action') action: string,
        @MessageBody('roomName') roomName: string, @MessageBody('role') role: ROLE) {

        const room = this.roomsList.get(roomName);

        let steps;
        //if (room.getOption() == OPTION.CoolCat)
        //    steps = 3;
        //else
        steps = 2;

        if (role == ROLE.Left) {
            if (action === 'upPressed') {
                room.getLeftPaddle().move(-1 * steps * PRECISION);
            } else if (action === 'downPressed') {
                room.getLeftPaddle().move(steps * PRECISION);
            }
            room.getLeftPaddle().update();
        }
        if (role == ROLE.Right) {
            if (action === 'upPressed') {
                room.getRightPaddle().move(-1 * steps * PRECISION);
            } else if (action === 'downPressed') {
                room.getRightPaddle().move(steps * PRECISION);
            }
            room.getRightPaddle().update();
        }
        this.server.to(roomName).emit('Paddle', { leftPos: room.getLeftPaddle().getY(), rightPos: room.getRightPaddle().getY() });
        console.log(room.getLeftPaddle().getY());

    }


    /******************************************************************************
    *                                MATCHMAKING                                  *
    ******************************************************************************/

    async matchmaking(option: OPTION) {
        if (option == OPTION.Retro || option == OPTION.WeirdCrowd) {
            if (this.retroWaitingList.size >= 2) {
                const iteratorId = this.retroWaitingList.keys();
                const iteratorPlayer = this.retroWaitingList.values();

                const firstId = iteratorId.next();
                const firstPlayer = iteratorPlayer.next();

                const secondId = iteratorId.next();
                const secondPlayer = iteratorPlayer.next();

                // generate unique room name --> uuid ?
                const roomName = `retro-${firstId.value}-${secondId.value}`;

                const firstClient = this.userToSocket.get(firstPlayer.value.id);
                const secondClient = this.userToSocket.get(secondPlayer.value.id);

                // create room
                const room = new Room(roomName, firstPlayer.value, secondPlayer.value, OPTION.Retro);

                await firstClient.join(roomName);
                await secondClient.join(roomName);

                // send room initial info to front
                firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
                secondClient.emit('Room', { name: roomName, role: ROLE.Right, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });

                this.roomsList.set(roomName, room);

                this.roomsParticipants.set(firstId.value, room);
                this.roomsParticipants.set(secondId.value, room);

                this.server.to(roomName).emit('AreYouReady');

                this.retroWaitingList.delete(firstId.value);
                this.retroWaitingList.delete(secondId.value);
            }
        }

        else if (option == OPTION.Robot) {
            const iteratorId = this.robotWaitingList.keys();
            const iteratorPlayer = this.robotWaitingList.values();

            const firstId = iteratorId.next();
            const firstPlayer = iteratorPlayer.next();

            const robot = await this.prisma.user.findUnique({
                where: { nickname: 'robot' }
            });

            const roomName = `robot-${firstId.value}-robot`;

            const firstClient = this.userToSocket.get(firstPlayer.value.id);

            const room = new Room(roomName, firstPlayer.value, robot, OPTION.Robot);

            await firstClient.join(roomName);

            firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: "robot" });

            this.roomsList.set(roomName, room);
            this.server.to(roomName).emit('AreYouReady');
            this.robotWaitingList.delete(firstId.value);

            firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });

            this.roomsList.set(roomName, room);

            this.roomsParticipants.set(firstId.value, room);

            this.server.to(roomName).emit('AreYouReady');

            this.robotWaitingList.delete(firstId.value);
        }

        else if (option == OPTION.CoolCat) {

            if (this.coolCatWaitingList.size >= 2) {
                const iteratorId = this.coolCatWaitingList.keys();
                const iteratorPlayer = this.coolCatWaitingList.values();

                const firstId = iteratorId.next();
                const firstPlayer = iteratorPlayer.next();

                const secondId = iteratorId.next();
                const secondPlayer = iteratorPlayer.next();

                // generate unique room name --> uuid ?
                const roomName = `coolcat-${firstId.value}-${secondId.value}`;

                const firstClient = this.userToSocket.get(firstPlayer.value.id);
                const secondClient = this.userToSocket.get(secondPlayer.value.id);

                // create room
                const room = new Room(roomName, firstPlayer.value, secondPlayer.value, OPTION.CoolCat);

                await firstClient.join(roomName);
                await secondClient.join(roomName);

                // send room initial info to front
                firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
                secondClient.emit('Room', { name: roomName, role: ROLE.Right, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });

                this.roomsList.set(roomName, room);

                this.roomsParticipants.set(firstId.value, room);
                this.roomsParticipants.set(secondId.value, room);

                this.server.to(roomName).emit('AreYouReady');

                this.retroWaitingList.delete(firstId.value);
                this.retroWaitingList.delete(secondId.value);
            }

        }
    }

    /******************************************************************************
    *                                   ROBOT                                     *
    ******************************************************************************/

    async robotLoop(room: Room) {
        let error = (Math.random() * 5 - 5) * PRECISION; // error margin between -5 and 5
        let delta = Math.random() * 100; // reaction delay 0 up to 50ms
        let speed = (Math.random() * 4 + 4) * PRECISION / 2; // speed between 4 and 8

        await new Promise(resolve => setTimeout(resolve, delta)); // --> would be better if only on ball dir change 

        // add anticipation of ball move when ball goes toward other player

        // move down
        if (room.getPuck().getY() + 7.5 * PRECISION + error < room.getRightPaddle().getY()) {
            room.getRightPaddle().move(-speed);
        }
        // move up
        else if (room.getPuck().getY() - 7.5 * PRECISION + error > room.getRightPaddle().getY()) {
            room.getRightPaddle().move(speed);
        }
        // don't move
        else {
            room.getRightPaddle().move(0);
        }

        room.getRightPaddle().update();
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
        console.log('set room ready')

        //both players are ready (or just one player if plays with robot), then start game loop
        if ((room.getReady() >= 2) || (room.getReady() >= 1 && room.getOption() == OPTION.Robot)) {
            await this.gameService.statusIngame(room.getLeftUser().id);

            if (room.getOption() != OPTION.Robot) // robot user can play with multiple users at the same time
                await this.gameService.statusIngame(room.getRightUser().id);

            this.withdrawFromAllWaitingLists(client.id);

            // set count down
            for (let i = 3; i >= -1; i--) {
                if (i != 3)
                    await this.sleep(1000);
                this.server.to(roomName).emit('Countdown', i);
            }

            room.setGameStart();

            const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
            const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
            this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });

            // launch robot loop
            if (room.getOption() == OPTION.Robot) {
                if (!this.robotInterval.has(roomName))
                    this.robotInterval.set(roomName, setInterval(this.robotLoop, 30, room));
            }

            await this.sleep(300);

            while (!room.getGameEnd()) {
                //const updatePuckInterval = setInterval(() => {
                room.getPuck().update();
                //if (room.getPuck().checkPaddleRight(room.getRightPaddle()) || room.getPuck().checkPaddleLeft(room.getLeftPaddle()) || room.getPuck().checkEdges() == POINT.Left || room.getPuck().checkEdges() == POINT.Right) {
                room.getPuck().checkPaddleRight(room.getRightPaddle());
                room.getPuck().checkPaddleLeft(room.getLeftPaddle());
                const point = room.getPuck().checkEdges();
                if (point == POINT.Left) {
                    room.leftPoint();
                    this.server.to(roomName).emit('Score', { left: room.getLeftScore(), right: room.getRightScore() });
                }
                if (point == POINT.Right) {
                    room.rightPoint();
                    this.server.to(roomName).emit('Score', { left: room.getLeftScore(), right: room.getRightScore() });
                }
                const newPuckPos = { x: room.getPuck().getX(), y: room.getPuck().getY() };
                const newPuckDir = { x: room.getPuck().getXSpeed(), y: room.getPuck().getYSpeed() };
                this.server.to(roomName).emit('Puck', { puckPos: newPuckPos, puckDir: newPuckDir });
                //}
                //}, 1000 / 60);

                if (room.getOption() != OPTION.CoolCat)
                    this.server.to(roomName).emit('Paddle', { leftPos: room.getLeftPaddle().getY(), rightPos: room.getRightPaddle().getY() });

                //}
                await this.sleep(1000 / 60);
            }

            // if end of game due to deconnection, set the one who disconnected as loser (ignore robot)
            if (room.getLeftScore() < 7 && room.getRightScore() < 7) { // MAX_SCORE 
				if (!this.userToSocket.has(room.getLeftUser().id) || (room.getOption() !== OPTION.Robot && !this.userToSocket.has(room.getRightUser().id))) {
					if (!this.userToSocket.has(room.getLeftUser().id))
						room.setRightAsWinner();
	
					if (!this.userToSocket.has(room.getRightUser().id) && room.getOption() !== OPTION.Robot)
						room.setLeftAsWinner();
				}
			}

            this.server.to(roomName).emit('GameEnd');

            // send results of match & status to db for profiles
            await this.gameService.createMatch(room.getLeftUser().id, room.getRightUser().id, room.getLeftScore(), room.getRightScore(), "Robot");
            await this.gameService.statusOnline(room.getLeftUser().id);
            await this.gameService.statusOnline(room.getRightUser().id);

            // update achievements
            this.gameService.updateAchievements(room.getLeftUser().id);
            this.gameService.updateAchievements(room.getRightUser().id);

            if (this.robotInterval.has(roomName)) {
                clearInterval(this.robotInterval.get(roomName));
                this.robotInterval.delete(roomName);
            }
        }
    }

    // clean end of game --> new game
    @SubscribeMessage('clean')
    async onLeave(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {

        client.leave(roomName);

        if (this.roomsList.has(roomName))
            this.roomsList.delete(roomName);

        if (this.roomsParticipants.has(client.id))
            this.roomsParticipants.delete(client.id);
    }
}  
