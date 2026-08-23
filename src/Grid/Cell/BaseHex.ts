import { Cell } from './Cell';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';
import type { BaseHexGrid } from '../BaseHexGrid';

export abstract class BaseHex extends Cell {
    public declare readonly grid: BaseHexGrid;
    public readonly center: Point;

    constructor(center: Vector2, grid: BaseHexGrid) {
        super(grid);
        this.center = new Point(center);
    }

    public nearestPointOnEdge(point: Vector2): Point {
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

        // If point is the cell's own center, line 2 has zero length so the intersection below is
        // undefined (0/0).  The center is equidistant from every edge, so just return the midpoint
        // of the two nearest corners -- ie. the midpoint of line 1, which is a point on an edge.
        if (x3 === x4 && y3 === y4) {
            return new Point({ x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
        }

        // Find where they intersect.  (https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)
        return new Point({
            x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
            y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
        });
    }

    public abstract get axialCoords(): [q: number, r: number, s: number];
}
