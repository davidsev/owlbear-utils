import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { uv_to_xy_isometric, xy_to_uv_isometric } from '../AxonometricFunctions';
import { BaseAxonometric } from './BaseAxonometric';
import type { Grid } from '../Grid';

const SQRT3 = Math.sqrt(3);

export class Isometric extends BaseAxonometric {
    constructor(center: Vector2, grid: Grid) {
        super(center, grid);
        if (grid.type !== 'ISOMETRIC') throw new Error(`Cannot create an Isometric cell for a "${grid.type}" grid`);
    }

    get corners(): Point[] {
        return [
            this.center.add({ x: 0, y: -this.grid.dpi / 2 }),
            this.center.add({ x: (+this.grid.dpi / SQRT3) * 1.5, y: 0 }),
            this.center.add({ x: 0, y: +this.grid.dpi / 2 }),
            this.center.add({ x: (-this.grid.dpi / SQRT3) * 1.5, y: 0 }),
        ];
    }

    public toString(): string {
        return `Isometric${this.center}`;
    }

    public neighbors(include_corners: boolean): Isometric[] {
        const [u, v] = xy_to_uv_isometric(this.center.x, this.center.y, this.grid);

        const sides = [
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u, v + 1, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u, v - 1, this.grid)), this.grid),
        ];
        const corners = [
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v + 1, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v - 1, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v + 1, this.grid)), this.grid),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v - 1, this.grid)), this.grid),
        ];

        return [...sides, ...(include_corners ? corners : [])];
    }

    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return Math.abs(xDiff - (this.grid.dpi / SQRT3) * 1.5) < 0.1 && Math.abs(yDiff - this.grid.dpi / 2) < 0.1;
    }

    public containsPoint(point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }

    public get axonometricCoords(): [u: number, v: number] {
        return xy_to_uv_isometric(this.center.x, this.center.y, this.grid);
    }
}
