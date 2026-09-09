import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import { LineSegment } from '../LineSegment';
import type { Grid } from '../Grid';

/** The abstract base every grid-type-specific cell (`Square`, `VHex`, `HHex`, `Isometric`, `Dimetric`) extends. */
export abstract class Cell {
    /** The grid snapshot this cell was created from. */
    public readonly grid: Grid;

    protected constructor(grid: Grid) {
        this.grid = grid;
    }

    /** The center point of this cell. */
    public abstract get center(): Point;

    /** The corner points of this cell, in order around its perimeter. */
    public abstract get corners(): Point[];

    /** The midpoint of each edge of this cell, in the same order as `edges`. */
    public abstract get edgeMidpoints(): Point[];

    /**
     * A point on this cell's perimeter near the given point. Works for points both inside and outside the cell.
     * `Square` and `BaseAxonometric` return the true nearest point on the perimeter; `BaseHex` instead returns
     * where the ray from the cell's center through `point` crosses the perimeter (see there for why).
     */
    public abstract nearestPointOnEdge(point: Vector2): Point;

    /** Formats as the cell type followed by its center, eg. `"Square(50, 50)"`. */
    public abstract toString(): string;

    /**
     * The closest point to `point` on any of this cell's edges -- the standard closest-point-on-convex-polygon
     * algorithm, correct whether `point` is inside or outside the cell. `Square` and `BaseAxonometric` use this
     * for `nearestPointOnEdge`; `BaseHex` doesn't, since its `nearestPointOnEdge` is deliberately a radial
     * projection instead.
     */
    protected nearestPointOnPerimeter(point: Vector2): Point {
        return Point.nearestPoint(
            point,
            this.edges.map((edge) => edge.nearestPointOnSegment(point)),
        );
    }

    /** This cell's edges as line segments, derived from `corners`. */
    public get edges(): LineSegment[] {
        const lines: LineSegment[] = [];
        const corners = this.corners;
        for (let i = 0; i < corners.length; i++) {
            const p1 = corners[i];
            const p2 = corners[(i + 1) % corners.length];
            lines.push(new LineSegment(p1, p2));
        }
        return lines;
    }

    /** Default adjacency check: true if this cell and `other` share an edge. Grid-type subclasses override this with cheaper math. */
    public isAdjacent(other: Cell): boolean {
        return this.edges.some((edge) => other.edges.some((otherEdge) => edge.equals(otherEdge)));
    }

    /** True if this cell contains the given point. */
    public abstract containsPoint(point: Vector2): boolean;

    /** This cell's neighboring cells, optionally including diagonal/corner neighbors. */
    public abstract neighbors(include_corners: boolean): Cell[];
}
