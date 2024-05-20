import { Cell } from './Cell';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';

export abstract class BaseHex extends Cell {

    public readonly center: Point;

    constructor (center: Vector2) {
        super();
        this.center = new Point(center);
    }

    public nearestPointOnEdge (point: Vector2): Point {
        const nearestCorner = Point.nearestPoint(point, this.corners);
        const secondNearestCorner = Point.nearestPoint(
            point,
            this.corners.filter((corner) => corner.distanceTo(nearestCorner) > 5),
        );

        // Line 1 is nearestCorner to nextNearestCorner
        const x1 = nearestCorner.x;
        const y1 = nearestCorner.y;
        const x2 = secondNearestCorner.x;
        const y2 = secondNearestCorner.y;

        // Line 2 is point to center
        const x3 = point.x;
        const y3 = point.y;
        const x4 = this.center.x;
        const y4 = this.center.y;

        // Find where they intersect.  (https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)
        return new Point({
            x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
            y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
        });
    }

    abstract get axialCoords (): [q: number, r: number, s: number];
}
