import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { BaseAxonometric } from './BaseAxonometric';
import type { IsometricGrid } from '../IsometricGrid';
import { SQRT3 } from '../constants';

/** A cell of an `IsometricGrid`. */
export class Isometric extends BaseAxonometric {
    public declare readonly grid: IsometricGrid;

    // biome-ignore lint/complexity/noUselessConstructor: narrows the inherited grid param to IsometricGrid, so the declare above holds
    constructor(center: Vector2, grid: IsometricGrid) {
        super(center, grid);
    }

    /** The four corners of this diamond, starting top and going clockwise. */
    get corners(): Point[] {
        return [
            this.center.add({ x: 0, y: -this.grid.dpi / 2 }),
            this.center.add({ x: (+this.grid.dpi / SQRT3) * 1.5, y: 0 }),
            this.center.add({ x: 0, y: +this.grid.dpi / 2 }),
            this.center.add({ x: (-this.grid.dpi / SQRT3) * 1.5, y: 0 }),
        ];
    }

    /** The midpoint of each of this cell's four edges, starting top-right and going clockwise. */
    get edgeMidpoints(): Point[] {
        return [
            this.center.add({ x: (+this.grid.dpi / SQRT3) * 0.75, y: -this.grid.dpi / 4 }),
            this.center.add({ x: (+this.grid.dpi / SQRT3) * 0.75, y: +this.grid.dpi / 4 }),
            this.center.add({ x: (-this.grid.dpi / SQRT3) * 0.75, y: +this.grid.dpi / 4 }),
            this.center.add({ x: (-this.grid.dpi / SQRT3) * 0.75, y: -this.grid.dpi / 4 }),
        ];
    }

    /** Formats as `"Isometric(x, y)"`. */
    public toString(): string {
        return `Isometric${this.center}`;
    }

    /** This cell's four (or eight, with diagonals) neighboring cells. */
    public neighbors(include_corners: boolean): Isometric[] {
        const [u, v] = this.grid.xy_to_uv(this.center.x, this.center.y);

        const sides = [
            new Isometric(new Point(...this.grid.uv_to_xy(u + 1, v)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u, v + 1)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u - 1, v)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u, v - 1)), this.grid),
        ];
        const corners = [
            new Isometric(new Point(...this.grid.uv_to_xy(u + 1, v + 1)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u + 1, v - 1)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u - 1, v + 1)), this.grid),
            new Isometric(new Point(...this.grid.uv_to_xy(u - 1, v - 1)), this.grid),
        ];

        return [...sides, ...(include_corners ? corners : [])];
    }

    /** True if this cell and `other` share an edge. */
    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return Math.abs(xDiff - (this.grid.dpi / SQRT3) * 1.5) < 0.1 && Math.abs(yDiff - this.grid.dpi / 2) < 0.1;
    }

    /** True if this cell contains the given point. */
    public containsPoint(point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }
}
