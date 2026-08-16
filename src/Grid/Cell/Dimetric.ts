import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell } from './Cell';
import { uv_to_xy_dimetric, xy_to_uv_dimetric } from '../AxonometricFunctions';
import { BaseAxonometric } from './BaseAxonometric';
import type { Grid } from '../Grid';

export class Dimetric extends BaseAxonometric {
    constructor(center: Vector2, grid: Grid) {
        super(center, grid);
        if (grid.type !== 'DIMETRIC') throw new Error(`Cannot create a Dimetric cell for a "${grid.type}" grid`);
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
        const [u, v] = xy_to_uv_dimetric(this.center.x, this.center.y, this.grid);

        const sides = [
            new Dimetric(new Point(...uv_to_xy_dimetric(u + 1, v, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u, v + 1, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u - 1, v, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u, v - 1, this.grid)), this.grid),
        ];
        const corners = [
            new Dimetric(new Point(...uv_to_xy_dimetric(u + 1, v + 1, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u + 1, v - 1, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u - 1, v + 1, this.grid)), this.grid),
            new Dimetric(new Point(...uv_to_xy_dimetric(u - 1, v - 1, this.grid)), this.grid),
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

    public get axonometricCoords(): [u: number, v: number] {
        return xy_to_uv_dimetric(this.center.x, this.center.y, this.grid);
    }
}
