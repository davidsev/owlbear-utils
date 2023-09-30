import { Vector2 } from '@owlbear-rodeo/sdk';

/** A point in 2D space. */
export class Point implements Vector2 {

    public readonly x: number;
    public readonly y: number;

    constructor (vector: Vector2);
    constructor (x: number, y: number);
    constructor (...arr: any[]) {
        if (arr.length === 1 && typeof arr[0] === 'object') {
            this.x = arr[0].x;
            this.y = arr[0].y;
        } else if (arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
            this.x = arr[0];
            this.y = arr[1];
        } else
            throw new Error('Invalid arguments to Point constructor');
    }

    public sub (rhs: Vector2): Point {
        return new Point({
            x: this.x - rhs.x,
            y: this.y - rhs.y,
        });
    }

    public add (rhs: Vector2): Point {
        return new Point({
            x: this.x + rhs.x,
            y: this.y + rhs.y,
        });
    }

    public scale (rhs: number): Point {
        return new Point({
            x: this.x * rhs,
            y: this.y * rhs,
        });
    }

    public mult (rhs: number): Point {
        return new Point({
            x: this.x * rhs,
            y: this.y * rhs,
        });
    }

    public div (rhs: number): Point {
        return new Point({
            x: this.x / rhs,
            y: this.y / rhs,
        });
    }

    public roundToNearest (n: number): Point {
        return new Point({
            x: Math.round(this.x / n) * n,
            y: Math.round(this.y / n) * n,
        });
    }

    public roundUpToNearest (n: number): Point {
        return new Point({
            x: Math.ceil(this.x / n) * n,
            y: Math.ceil(this.y / n) * n,
        });
    }

    public roundDownToNearest (n: number): Point {
        return new Point({
            x: Math.floor(this.x / n) * n,
            y: Math.floor(this.y / n) * n,
        });
    }

    public distanceTo (rhs: Vector2): number {
        return Math.sqrt(Math.pow(this.x - rhs.x, 2) + Math.pow(this.y - rhs.y, 2));
    }

    public equals (rhs: Vector2): boolean {
        return this.x === rhs.x && this.y === rhs.y;
    }

    public toString (): string {
        return `(${this.x.toFixed(0)}, ${this.y.toFixed(0)})`;
    }
}