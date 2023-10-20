import { Point } from './Point';
import { Vector2 } from '@owlbear-rodeo/sdk';

export class LineSegment {

    public readonly p1: Point;
    public readonly p2: Point;

    public constructor (p1: Vector2, p2: Vector2) {
        // Make sure the points aren't equal
        if (p1.x === p2.x && p1.y === p2.y)
            throw new Error('Cannot create a line with two identical points');

        // Normalize the direction.  We don't really care as long as it's consistent, so smallest X wins, or smallest Y if X is equal.
        if (p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)) {
            this.p1 = new Point(p1);
            this.p2 = new Point(p2);
        } else {
            this.p1 = new Point(p2);
            this.p2 = new Point(p1);
        }
    }

    public toString (): string {
        return `Line(${this.p1.x},${this.p1.y} -> ${this.p2.x},${this.p2.y})`;
    }
}
