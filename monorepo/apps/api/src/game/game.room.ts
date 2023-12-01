import { User } from "@prisma/client";
import { width, height, Puck, Paddle } from './game.math';

let isPlaying: boolean = false;

// export interface Score {
//     left: number;
//     right: number;
// }

/******************************************************************************
*                               SOCKET ROOMS                                  *
******************************************************************************/

export class Room {

    private name: string;
    
    private leftPlayer: User;
    private rightPlayer: User;

    private ready: number

    private leftPaddle: Paddle;
    private rightPaddle: Paddle;

    private puck: Puck;

    private leftScore: number;
    private rightScore: number;

    private leftNickname: string;
    private rightNickname: string;

    private gameEnd: boolean;

    constructor(name: string, left: User, right: User) {

        this.name = name;

        this.leftPlayer = left;
        this.rightPlayer = right;

        this.leftNickname = left.nickname;
        this.rightNickname = right.nickname;

        this.puck = new Puck();
        
        this.leftPaddle = new Paddle(true);
        this.rightPaddle = new Paddle(false);
        
        this.leftScore = 0;
        this.rightScore = 0;

        this.ready = 0;

        this.gameEnd = false;
    }

    async isReady(): Promise<void> {
        this.ready++;
    }

    leftPoint()
    {
        this.leftScore++;
    }

    rightPoint()
    {
        this.rightScore++;
    }

    //getters

    getReady(): number {
        return this.ready;
    }

    getPuck(): Puck {
        return this.puck;
    }

    getLeftPaddle(): Paddle {
        return this.leftPaddle;
    }

    getRightPaddle(): Paddle {
        return this.rightPaddle;
    }

    getLeftScore(): number {
        return this.leftScore;
    }

    getRightScore(): number {
        return this.rightScore;
    }

    getGameEnd(): boolean {
        if (this.leftScore >= 3 || this.rightScore >= 3)
            this.gameEnd = true;
        return this.gameEnd;
    }

    getLeftNickname(): string {
        return this.leftNickname;
    }

    getRightNickname(): string {
        return this.rightNickname;
    }

    getLeftUser(): User {
        return this.leftPlayer;
    }

    getRightUser(): User {
        return this.rightPlayer;
    }

    //setters

    setGameEnd(): void {
        this.gameEnd = true;
    }
}
