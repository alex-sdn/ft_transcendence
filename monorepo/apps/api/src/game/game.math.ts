export const PRECISION: number = 4;
export const VELOCITY: number = 4;
export const PUCK: number = 5 * PRECISION;
export const width: number = 600 * PRECISION;
export const height: number = 400 * PRECISION;

export enum POINT {
    Left,
    Right,
    Nobody,
}

/******************************************************************************
*                                  PADDLE                                     *
******************************************************************************/

export class Paddle {

    private x: number;
    private y: number;
    private w: number;
    private h: number;
    private ychange: number;

    constructor(isLeft: boolean) {
        this.y = height / 2;
        this.w = 10 * PRECISION;
        this.h = 100 * PRECISION;
        this.ychange = 0;

        if (isLeft) {
            this.x = 10 * PRECISION;
        } else {
            this.x = width - 10 * PRECISION;
        }
    }

	// test middle
	reset(): void {
		this.y = height / 2;
	}

    move(steps: number): void {
        this.ychange = steps;
    }

    update(): void {
        this.y += this.ychange;
        this.y = this.constrain(this.y, this.h / 2, height - this.h / 2);
    }

    private constrain(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    //GETTERS
    
    getY(): number {
        return this.y;
    }

    getX(): number {
        return this.x;
    }

    getW(): number {
        return this.w;
    }

    getH(): number {
        return this.h;
    }

    getYChange(): number {
        return this.ychange;
    }
}

/******************************************************************************
*                                  PUCK                                       *
******************************************************************************/

export class Puck {
    private x: number;
    private y: number;
    private xspeed: number;
    private yspeed: number;
    private r: number;

    constructor() {
        this.x = width / 2;
        this.y = height / 2;
        this.xspeed = 0;
        this.yspeed = 0;
        this.r = 5 * PRECISION;

        this.reset();
    }

    //add -5 + 5 ?
    checkPaddleLeft(p: Paddle): boolean {
        if (
            this.y - this.r < p.getY() + p.getH() / 2 &&
            this.y + this.r > p.getY() - p.getH() / 2 &&
            this.x - this.r < p.getX() + p.getW() / 2
        ) {
            if (this.x > p.getX()) {
                let diff = this.y - (p.getY() - p.getH() / 2);
                let rad = this.radians(45);
                let angle = this.map(diff, 0, p.getH(), -rad, rad);
                this.xspeed = VELOCITY * Math.cos(angle) * PRECISION;
                this.yspeed = VELOCITY * Math.sin(angle) * PRECISION;
                this.x = p.getX() + p.getW() / 2 + this.r;
                return (true);
            }
        }
        return (false);
    }

    //add -5 + 5 ?
    checkPaddleRight(p: Paddle): boolean {
        if (
            this.y - this.r < p.getY() + p.getH() / 2 &&
            this.y + this.r > p.getY() - p.getH() / 2 &&
            this.x + this.r > p.getX() - p.getW() / 2
        ) {
            if (this.x < p.getX()) {
                let diff = this.y - (p.getY() - p.getH() / 2);
                let angle = this.map(diff, 0, p.getH(), this.radians(225), this.radians(135));
                this.xspeed = VELOCITY * Math.cos(angle) * PRECISION;
                this.yspeed = VELOCITY * Math.sin(angle) * PRECISION;
                this.x = p.getX() - p.getW() / 2 - this.r;
                return (true);
            }
        }
        return (false);
    }

    update(): void {
        this.x += this.xspeed;
        this.y += this.yspeed;
    }

    reset(): void {
        this.x = width / 2;
        this.y = height / 2;
        let angle = this.random(-Math.PI / 4, Math.PI / 4);
        this.xspeed = VELOCITY * Math.cos(angle) * PRECISION;
        this.yspeed = VELOCITY * Math.sin(angle) * PRECISION;

        if (Math.random() < 0.5) {
            this.xspeed *= -1;
        }
    }

    checkEdges(): POINT {
        if (this.y < PUCK || this.y > height - PUCK) {
            this.yspeed *= -1;
            return (POINT.Nobody);
        }

        if (this.x - this.r - PUCK > width) {
            this.reset();
            return (POINT.Left);
        }

        if (this.x + this.r + PUCK < 0) {
            this.reset();
            return (POINT.Right);
        }
    }

    //GETTERS

    getY(): number {
        return this.y;
    }

    getX(): number {
        return this.x;
    }

    getYSpeed(): number {
        return this.yspeed;
    }

    getXSpeed(): number {
        return this.xspeed;
    }

    //MATH TOOLS

    private radians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    private map(value: number, start1: number, stop1: number, start2: number, stop2: number): number {
        return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    }

    private random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}
