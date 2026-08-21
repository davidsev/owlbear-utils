import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { BaseAxonometric } from './BaseAxonometric';
import type { DimetricGrid } from '../DimetricGrid';

export class Dimetric extends BaseAxonometric {
    public declare readonly grid: DimetricGrid;

    // biome-ignore lint/complexity/noUselessConstructor: narrows the inherited grid param to DimetricGrid, so the declare above holds
    constructor(center: Vector2, grid: DimetricGrid) {
        super(center, grid);
    }

    get corners(): Point[] {
        return [
            this.center.add({ x: 0, y: -this.grid.dpi / 2 }),
            this.center.add({ x: +this.grid.dpi, y: 0 }),
            this.center.add({ x: 0, y: +this.grid.dpi / 2 }),
            this.center.add({ x: -this.grid.dpi, y: 0 }),
        ];
    }

    public toString(): string {
        return `Dimetric${this.center}`;
    }

    public neighbors(include_corners: boolean): Dimetric[] {
        const [u, v] = this.grid.xy_to_uv(this.center.x, this.center.y);

        const sides = [
            new Dimetric(new Point(...this.grid.uv_to_xy(u + 1, v)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u, v + 1)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u - 1, v)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u, v - 1)), this.grid),
        ];
        const corners = [
            new Dimetric(new Point(...this.grid.uv_to_xy(u + 1, v + 1)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u + 1, v - 1)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u - 1, v + 1)), this.grid),
            new Dimetric(new Point(...this.grid.uv_to_xy(u - 1, v - 1)), this.grid),
        ];

        return [...sides, ...(include_corners ? corners : [])];
    }

    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return Math.abs(xDiff - this.grid.dpi) < 0.1 && Math.abs(yDiff - this.grid.dpi / 2) < 0.1;
    }

    public containsPoint(point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }
}
