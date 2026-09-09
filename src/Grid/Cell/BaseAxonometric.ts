import { Cell } from './Cell';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';
import { lineIntersection } from '../lineIntersection';
import type { BaseAxonometricGrid } from '../BaseAxonometricGrid';

/** Shared by `Isometric` and `Dimetric`, the two axonometric cell types. */
export abstract class BaseAxonometric extends Cell {
    public declare readonly grid: BaseAxonometricGrid;
    public readonly center: Point;

    constructor(center: Vector2, grid: BaseAxonometricGrid) {
        super(grid);
        this.center = new Point(center);
    }

    /**
     * `point` projected perpendicularly onto the infinite line through its two nearest corners.  For a point
     * inside the cell that is the closest point on the perimeter; for one outside it the projection can land
     * past the edge's ends, off the cell entirely.
     */
    public nearestPointOnEdge(point: Vector2): Point {
        const nearestCorner = Point.nearestPoint(point, this.corners);
        const neighboringCorners = this.corners.filter((corner) => {
            return corner.x !== nearestCorner.x && corner.y !== nearestCorner.y;
        });
        const secondNearestCorner = Point.nearestPoint(point, neighboringCorners);

        // Line 1 is nearestCorner to secondNearestCorner, ie. the nearest edge.
        // Line 2 is the perpendicular to line 1 that goes through the point.
        // EG move nearestCorner to 0,0, rotate 90deg, then move to Point
        const edgeNormal = secondNearestCorner.sub(nearestCorner).perpendicular();
        const pointOnNormal = edgeNormal.add(point);

        // The two lines are perpendicular by construction, so they always intersect.
        return lineIntersection(nearestCorner, secondNearestCorner, point, pointOnNormal);
    }

    /** This cell's coordinates in the grid's (u, v) axonometric coordinate system. */
    get axonometricCoords(): [u: number, v: number] {
        return this.grid.xy_to_uv(this.center.x, this.center.y);
    }
}
