import { width, height, Puck, Paddle } from './game.math';

let isPlaying: boolean = false;

export interface Ready {
    left: boolean;
    right: boolean;
}

export interface PuckPos {
    x: number;
    y: number;
}

export interface PuckDir {
    x: number;
    y: number;
}

export interface Score {
    left: number;
    right: number;
}

export class Room {
    private left: string;
    private right: string;
    private name: string;
    private ready: Ready;

    private leftPaddle: Paddle;
    private rightPaddle: Paddle;
    private puck: Puck;

    private score: Score;

    //private winner: User | null;
    //private loser: User | null;

    constructor(left: string, right: string, name: string) {
        this.left = left;
        this.right = right;
        this.name = name;
        
        this.init();
    }

    //+ getters and setters

}