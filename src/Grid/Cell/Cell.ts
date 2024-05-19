import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { LineSegment } from '../LineSegment';

export abstract class Cell {

    public abstract get center (): Point;

    public abstract get corners (): Point[];

    public abstract nearestPointOnEdge (point: Vector2): Point;

    public abstract toString (): string;

    public get edges (): LineSegment[] {
        const lines: LineSegment[] = [];
        for (let i = 0; i < this.corners.length; i++) {
            const p1 = this.corners[i];
            const p2 = this.corners[(i + 1) % this.corners.length];
            lines.push(new LineSegment(p1, p2));
        }
        return lines;
    }

    public isAdjacent (other: Cell): boolean {
        return this.edges.some(edge => other.edges.some(otherEdge => edge.equals(otherEdge)));
    }

    public abstract containsPoint (point: Vector2): boolean ;

    public abstract neighbors (include_corners: boolean): Cell[];
}

