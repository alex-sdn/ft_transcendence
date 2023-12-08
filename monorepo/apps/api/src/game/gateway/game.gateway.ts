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

    // < 'id1-id2', [id1, id2] >
    private friendWaitingList = new Map<string, number[]>;

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
                this.server.to(roomName).emit("LogOut");
                this.roomsParticipants.get(client.id).setGameEnd();
                console.log('set game end bc deco')
            }

            //check if client was in a waiting room if so remove from it
            if (this.defaultWaitingList.has(client.id))
                this.defaultWaitingList.delete(client.id);

            if (this.upgradedWaitingList.has(client.id))
                this.upgradedWaitingList.delete(client.id);

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

        //add robot user in db
    }

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
        }
        const targetSocket = this.userToSocket.get(target.id);

        // if target is offline
        if (!targetSocket) {
            client.emit('error', {
                message: 'This user is not online'
            });
        }
        // if target is ingame
        if (target.status === 'ingame') {
            client.emit('error', {
                message: 'This user is currently in-game'
            });
        }

        var listName;
        if (user.id < target.id)
            listName = user.id + '-' + target.id;
        else
            listName = target.id + '-' + user.id;
        // if first invite -> create waiting list for private game
        if (!this.friendWaitingList.has(listName)) {
            console.log("here")
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
            //sacha --> check all waiting lists
            if (this.defaultWaitingList.has(client.id))
                this.defaultWaitingList.delete(client.id);
            if (this.defaultWaitingList.has(targetSocket.id))
                this.defaultWaitingList.delete(targetSocket.id);
            if (this.upgradedWaitingList.has(client.id))
                this.upgradedWaitingList.delete(client.id);
            if (this.upgradedWaitingList.has(targetSocket.id))
                this.upgradedWaitingList.delete(targetSocket.id);

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
            const room = new Room(listName, user, target);

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

        if (role == ROLE.Left) {
            if (action === 'upPressed') {
                room.getLeftPaddle().move(-10);
            } else if (action === 'downPressed') {
                room.getLeftPaddle().move(10);;
            } else if (action === 'released') {
                room.getLeftPaddle().move(0);
            }
            room.getLeftPaddle().update();
        }
        if (role == ROLE.Right) {
            if (action === 'upPressed') {
                room.getRightPaddle().move(-10);
            } else if (action === 'downPressed') {
                room.getRightPaddle().move(10);;
            } else if (action === 'released') {
                room.getRightPaddle().move(0);
            }
            room.getRightPaddle().update();
        }
    }

    /******************************************************************************
    *                                   MATCHMAKING                               *
    ******************************************************************************/

    async matchmaking(option: OPTION) // add upgraded features
    {
        if (option == OPTION.Default) {
            if (this.defaultWaitingList.size >= 2) {
                const iteratorId = this.defaultWaitingList.keys();
                const iteratorPlayer = this.defaultWaitingList.values();

                const firstId = iteratorId.next();
                const firstPlayer = iteratorPlayer.next();

                const secondId = iteratorId.next();
                const secondPlayer = iteratorPlayer.next();

                // generate unique room name
                const roomName = `default-${firstId.value}-${secondId.value}`;

                const firstClient = this.userToSocket.get(firstPlayer.value.id);
                const secondClient = this.userToSocket.get(secondPlayer.value.id);

                // create room
                const room = new Room(roomName, firstPlayer.value, secondPlayer.value);

                await firstClient.join(roomName);
                await secondClient.join(roomName);

                // send room initial info to front
                firstClient.emit('Room', { name: roomName, role: ROLE.Left, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });
                secondClient.emit('Room', { name: roomName, role: ROLE.Right, leftNickname: room.getLeftNickname(), rightNickname: room.getRightNickname() });

                this.roomsList.set(roomName, room);

                this.roomsParticipants.set(firstId.value, room);
                this.roomsParticipants.set(secondId.value, room);

                this.server.to(roomName).emit('AreYouReady');

                this.defaultWaitingList.delete(firstId.value);
                this.defaultWaitingList.delete(secondId.value);

            }
        }

        /******************************************************************************
        *                                   ROBOT                                     *
        ******************************************************************************/

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
        console.log('set room ready')
        //both players are ready --> start game loop
        if (room.getReady() >= 2) {
            console.log('both ready');
            await this.gameService.statusIngame(room.getLeftUser().id);
            await this.gameService.statusIngame(room.getRightUser().id);

            if (this.defaultWaitingList.has(client.id))
                this.defaultWaitingList.delete(client.id);

            if (this.upgradedWaitingList.has(client.id))
                this.upgradedWaitingList.delete(client.id);

            //set count down

            isPlaying = true; // change for setGameStart() for code consistency

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
                this.server.to(roomName).emit('Paddle', { leftPos: room.getLeftPaddle().getY(), rightPos: room.getRightPaddle().getY() });
                await this.sleep(1000 / 60);
            }

            //if end of game due to deconnection (find method to identify deconnected socket) --> set the one who deconnected as loser

            if (!this.userToSocket.has(room.getLeftUser().id)) {
                room.setLeftAsWinner();
                console.log("left as winner bc disconnect")

            }

            if (!this.userToSocket.has(room.getRightUser().id))
                room.setRightAsWinner();

            // send results of match & status to db for profiles
            await this.gameService.createMatch(room.getLeftUser().id, room.getRightUser().id, room.getLeftScore(), room.getRightScore(), "ranked");
            await this.gameService.statusOnline(room.getLeftUser().id);
            await this.gameService.statusOnline(room.getRightUser().id);
            // update achievements
            this.gameService.updateAchievements(room.getLeftUser().id);
            this.gameService.updateAchievements(room.getRightUser().id);
        }
    }

    // clean end of game
    @SubscribeMessage('clean')
    async onLeave(@ConnectedSocket() client: Socket, @MessageBody('roomName') roomName: string) {

        client.leave(roomName);

        if (this.roomsList.has(roomName))
            this.roomsList.delete(roomName);

        if (this.roomsParticipants.has(client.id))
            this.roomsParticipants.delete(client.id);
    }
}  
