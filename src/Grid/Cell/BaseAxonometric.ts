import { Cell } from './Cell';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';
import type { BaseAxonometricGrid } from '../BaseAxonometricGrid';

/** Shared by `Isometric` and `Dimetric`, the two axonometric cell types. */
export abstract class BaseAxonometric extends Cell {
    public declare readonly grid: BaseAxonometricGrid;
    public readonly center: Point;

    constructor(center: Vector2, grid: BaseAxonometricGrid) {
        super(grid);
        this.center = new Point(center);
    }

    /** The closest point on this cell's perimeter to the given point, whether inside or outside the cell. */
    public nearestPointOnEdge(point: Vector2): Point {
        return this.nearestPointOnPerimeter(point);
    }

    /** This cell's coordinates in the grid's (u, v) axonometric coordinate system. */
    get axonometricCoords(): [u: number, v: number] {
        return this.grid.xy_to_uv(this.center.x, this.center.y);
    }
}
