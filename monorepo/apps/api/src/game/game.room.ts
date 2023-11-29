import { User } from "@prisma/client";
import { width, height, Puck, Paddle } from './game.math';

let isPlaying: boolean = false;

export interface Score {
    left: number;
    right: number;
}

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

    private score: Score;

    constructor(name: string, left: User, right: User) {

        this.name = name;

        this.leftPlayer = left;
        this.rightPlayer = right;

        this.puck = new Puck();
        
        this.leftPaddle = new Paddle(true);
        this.rightPaddle = new Paddle(false);
        
        this.ready = 0;
    }

    async isReady(): Promise<void> {
        this.ready++;
    }

    //getters & setters

    getReady(): number {
        return this.ready;
    }

}
