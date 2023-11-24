export const width: number = 600;
export const height: number = 400;

let leftscore: number = 0;
let rightscore: number = 0;

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
        this.w = 10;
        this.h = 100;
        this.ychange = 0;

        if (isLeft) {
            this.x = 0;
        } else {
            this.x = width;
        }
    }

    //don't use this one
    move(steps: number): void {
        this.ychange = steps;
    }

    update(steps: number): void {
        this.y += steps;
        this.y = this.constrain(this.y, this.h / 2, height - this.h / 2);
        //console.log(this.y);
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
        this.r = 6;

        this.reset();
    }

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
                this.xspeed = 5 * Math.cos(angle);
                this.yspeed = 5 * Math.sin(angle);
                this.x = p.getX() + p.getW() / 2 + this.r;
                return (true);
            }
        }
        return (false);
    }

    checkPaddleRight(p: Paddle): boolean {
        if (
            this.y - this.r < p.getY() + p.getH() / 2 &&
            this.y + this.r > p.getY() - p.getH() / 2 &&
            this.x + this.r > p.getX() - p.getW() / 2
        ) {
            if (this.x < p.getX()) {
                let diff = this.y - (p.getY() - p.getH() / 2);
                let angle = this.map(diff, 0, p.getH(), this.radians(225), this.radians(135));
                this.xspeed = 5 * Math.cos(angle);
                this.yspeed = 5 * Math.sin(angle);
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
        this.xspeed = 5 * Math.cos(angle);
        this.yspeed = 5 * Math.sin(angle);

        if (Math.random() < 0.5) {
            this.xspeed *= -1;
        }
    }

    checkEdges(): boolean {
        if (this.y < 0 || this.y > height) {
            this.yspeed *= -1;
            return (true);
        }

        if (this.x - this.r > width) {
            leftscore++;
            this.reset();
            return (true);
        }

        if (this.x + this.r < 0) {
            rightscore++;
            this.reset();
            return (true);
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