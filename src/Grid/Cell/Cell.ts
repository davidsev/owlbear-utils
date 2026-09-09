import type { Point } from '../Point';
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
     * A point on this cell's perimeter near the given point, intended for points inside the cell.
     * Implementations project onto an edge's infinite line without clamping to the edge, so for a point
     * outside the cell the result may not be the nearest such point, or may not be on the perimeter at all.
     */
    public abstract nearestPointOnEdge(point: Vector2): Point;

    /** Formats as the cell type followed by its center, eg. `"Square(50, 50)"`. */
    public abstract toString(): string;

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
