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
     * The point where the line from the cell's center through `point` crosses the perimeter, ie. a radial
     * projection onto the perimeter rather than the closest point on it.  (`BaseAxonometric` returns the
     * closest point instead, so despite the shared name the two don't agree.)  Works for `point` both inside
     * and outside the cell, since the edge it picks is whichever one the ray actually crosses, not whichever
     * one has the nearest corners.
     */
    public nearestPointOnEdge(point: Vector2): Point {
        // If point is the cell's own center, the ray's direction is undefined.  The center is equidistant
        // from every edge, so just return an edge midpoint -- ie. a point on an edge.
        if (point.x === this.center.x && point.y === this.center.y) {
            return this.edgeMidpoints[0];
        }

        for (const edge of this.edges) {
            const intersection = lineIntersection(edge.p1, edge.p2, this.center, point);
            if (!Number.isFinite(intersection.x) || !Number.isFinite(intersection.y)) continue; // Parallel to this edge.

            // Where intersection falls along edge.p1 -> edge.p2, as a fraction; off the finite edge if outside [0, 1].
            const dx = edge.p2.x - edge.p1.x;
            const dy = edge.p2.y - edge.p1.y;
            const t = ((intersection.x - edge.p1.x) * dx + (intersection.y - edge.p1.y) * dy) / (dx * dx + dy * dy);
            if (t < -1e-6 || t > 1 + 1e-6) continue;

            // Only the crossing in the direction of `point` (not the one behind the center) counts.
            const forward =
                (intersection.x - this.center.x) * (point.x - this.center.x) + (intersection.y - this.center.y) * (point.y - this.center.y);
            if (forward <= 0) continue;

            return intersection;
        }

        throw new Error(`nearestPointOnEdge: no edge of ${this} intersects the ray from its center through ${new Point(point)}`);
    }

    /** This cell's axial (q, r, s) hex coordinates, where s is always `-q - r`. */
    public abstract get axialCoords(): [q: number, r: number, s: number];
}
