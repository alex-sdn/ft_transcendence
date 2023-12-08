import { User } from "@prisma/client";
import { width, height, Puck, Paddle } from './game.math';
import { OPTION } from './gateway/game.gateway';

let isPlaying: boolean = false;

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

    private gameOption: OPTION;

    constructor(name: string, left: User, right: User, option: OPTION) {

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

        this.gameOption = option;

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

    getName(): string {
        return this.name;
    }

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
        if (this.leftScore >= 7 || this.rightScore >= 7)
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

    getOption(): OPTION {
        return this.gameOption;
    }

    //setters

    setGameEnd(): void {
        this.gameEnd = true;
    }

    setGameStart(): void {
        this.gameEnd = false;
    }

    setLeftAsWinner(): void {
        this.leftScore = 7;
    }

    setRightAsWinner(): void {
        this.rightScore = 7;
    }

}
