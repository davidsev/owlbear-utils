import { Cell } from './Cell';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';
import { lineIntersection } from '../lineIntersection';
import type { BaseHexGrid } from '../BaseHexGrid';

/** Shared by `VHex` and `HHex`, the two hex cell orientations. */
export abstract class BaseHex extends Cell {
    public declare readonly grid: BaseHexGrid;
    public readonly center: Point;

    constructor(center: Vector2, grid: BaseHexGrid) {
        super(grid);
        this.center = new Point(center);
    }

    /**
     * The point where the line from the cell's center through `point` crosses the nearest edge, ie. a radial
     * projection onto the perimeter rather than the closest point on it.  (`BaseAxonometric` projects
     * perpendicularly instead, so despite the shared name the two don't agree.)
     */
    public nearestPointOnEdge(point: Vector2): Point {
        const nearestCorner = Point.nearestPoint(point, this.corners);
        const secondNearestCorner = Point.nearestPoint(
            point,
            this.corners.filter((corner) => corner.distanceTo(nearestCorner) > 5),
        );

        // Line 1 is nearestCorner to secondNearestCorner, ie. the nearest edge.
        // Line 2 is point to center.

        // If point is the cell's own center, line 2 has zero length so the intersection below is
        // undefined (0/0).  The center is equidistant from every edge, so just return the midpoint
        // of the two nearest corners -- ie. the midpoint of line 1, which is a point on an edge.
        if (point.x === this.center.x && point.y === this.center.y) {
            return new Point({
                x: (nearestCorner.x + secondNearestCorner.x) / 2,
                y: (nearestCorner.y + secondNearestCorner.y) / 2,
            });
        }

        return lineIntersection(nearestCorner, secondNearestCorner, point, this.center);
    }

    /** This cell's axial (q, r, s) hex coordinates, where s is always `-q - r`. */
    public abstract get axialCoords(): [q: number, r: number, s: number];
}
