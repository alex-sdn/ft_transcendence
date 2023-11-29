import { User } from "@prisma/client";
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

    private name: string;
    
    private left: User;
    private right: User;

    private ready: Ready;

    private leftPaddle: Paddle;
    private rightPaddle: Paddle;

    private puck: Puck;

    private score: Score;

    constructor(name: string, left: User, right: User) {
        this.name = name;
        this.left = left;
        this.right = right;
        //this.init();
    }

    //init


    //+ getters and setters

}