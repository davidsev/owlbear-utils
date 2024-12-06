import { Vector2 } from '@owlbear-rodeo/sdk';

/** Clean -0 to be 0, so toString and other comparisons work as expected. */
function cleanZero (value: number): number {
    if (Math.abs(value) < 0.000000001)
        return 0;
    return value;
}

/** A point in 2D space. */
export class Point implements Vector2 {

    public readonly x: number;
    public readonly y: number;

    constructor (vector: Vector2);
    constructor (x: number, y: number);
    constructor (...arr: any[]) {
        if (arr.length === 1 && typeof arr[0] === 'object') {
            this.x = cleanZero(arr[0].x);
            this.y = cleanZero(arr[0].y);
        } else if (arr.length === 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
            this.x = cleanZero(arr[0]);
            this.y = cleanZero(arr[1]);
        } else
            throw new Error('Invalid arguments to Point constructor');
    }

    public static nearestPoint (center: Vector2, points: Vector2[]): Point {
        if (points.length === 0)
            throw new Error('Cannot find nearest point of empty array');

        const centerPoint = new Point(center);

        let closestPoint = points[0];
        let closestDistance: number = centerPoint.distanceTo(closestPoint);
        for (let i = 1; i < points.length; i++) {
            const distance = centerPoint.distanceTo(points[i]);
            if (distance < closestDistance) {
                closestPoint = points[i];
                closestDistance = distance;
            }
        }
        return new Point(closestPoint);

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

    public roundToNearest (roundTo: Vector2): Point ;
    public roundToNearest (roundTo: number): Point ;
    public roundToNearest (roundTo: number | Vector2): Point {
        const n = typeof roundTo === 'number' ? { x: roundTo, y: roundTo } : roundTo;
        return new Point({
            x: Math.round(this.x / n.x) * n.x,
            y: Math.round(this.y / n.y) * n.y,
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
        return Math.abs(this.x - rhs.x) < 1 && Math.abs(this.y - rhs.y) < 1;
    }

    public toString (): string {
        return `(${this.x.toFixed(0)}, ${this.y.toFixed(0)})`;
    }
}
