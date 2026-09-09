import { Point } from './Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';

/** A line between two points, normalised on construction so direction doesn't affect `equals()`. */
export class LineSegment {
    public readonly p1: Point;
    public readonly p2: Point;

    /**
     * @throws If the two points are identical, since that isn't a line.
     */
    public constructor(p1: Vector2, p2: Vector2) {
        // Make sure the points aren't equal
        if (p1.x === p2.x && p1.y === p2.y) throw new Error('Cannot create a line with two identical points');

        // Normalize the direction.  We don't really care as long as it's consistent, so smallest X wins, or smallest Y if X is equal.
        if (p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)) {
            this.p1 = new Point(p1);
            this.p2 = new Point(p2);
        } else {
            this.p1 = new Point(p2);
            this.p2 = new Point(p1);
        }
    }

    public toString(precision: number = 0): string {
        const fmt = (n: number) => n.toFixed(precision).replace(/\.0+$/, '');
        return `Line(${fmt(this.p1.x)},${fmt(this.p1.y)} -> ${fmt(this.p2.x)},${fmt(this.p2.y)})`;
    }

    /** True if both endpoints match, regardless of which was passed as `p1`/`p2`. */
    public equals(other: LineSegment): boolean {
        return this.p1.equals(other.p1) && this.p2.equals(other.p2);
    }

    /** The distance between the two endpoints. */
    public get length(): number {
        return this.p1.distanceTo(this.p2);
    }

    /** The closest point on this finite segment (not the infinite line through it) to `point`. */
    public nearestPointOnSegment(point: Vector2): Point {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const lengthSquared = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((point.x - this.p1.x) * dx + (point.y - this.p1.y) * dy) / lengthSquared));
        return new Point({
            x: this.p1.x + t * dx,
            y: this.p1.y + t * dy,
        });
    }
}
