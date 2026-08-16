import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { axial_round, axial_to_xy_h, xy_to_axial_h } from '../HexFunctions';
import { BaseHex } from './BaseHex';
import type { Grid } from '../Grid';

export class HHex extends BaseHex {
    constructor(center: Vector2, grid: Grid) {
        super(center, grid);
        if (grid.type !== 'HEX_HORIZONTAL') throw new Error(`Cannot create a HHex cell for a "${grid.type}" grid`);
    }

    static fromAxial(q: number, r: number, grid: Grid): HHex {
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = axial_to_xy_h(round_q, round_r, grid);

        return new HHex({ x: x - grid.hexRadius / 2, y }, grid);
    }

    get axialCoords(): [q: number, r: number, s: number] {
        const [q, r] = xy_to_axial_h(this.center.x, this.center.y, this.grid);
        return [q, r, -q - r];
    }

    get corners(): Point[] {
        return [
            this.center.add({ x: -this.grid.hexRadius, y: 0 }),
            this.center.add({ x: -this.grid.hexRadius / 2, y: this.grid.dpi / 2 }),
            this.center.add({ x: this.grid.hexRadius / 2, y: this.grid.dpi / 2 }),
            this.center.add({ x: this.grid.hexRadius, y: 0 }),
            this.center.add({ x: this.grid.hexRadius / 2, y: -this.grid.dpi / 2 }),
            this.center.add({ x: -this.grid.hexRadius / 2, y: -this.grid.dpi / 2 }),
        ];
    }

    public toString(): string {
        return `HHex${this.center}`;
    }

    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (
            (Math.abs(xDiff - this.grid.hexRadius * 1.5) < 1 && Math.abs(yDiff - this.grid.dpi * 0.5) < 1) ||
            (xDiff < 1 && Math.abs(yDiff - this.grid.dpi) < 1)
        );
    }

    public containsPoint(point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }

    public neighbors(_include_corners: boolean): HHex[] {
        const [q, r] = xy_to_axial_h(this.center.x, this.center.y, this.grid);

        return [
            new HHex(new Point(...axial_to_xy_h(q + 1, r, this.grid)), this.grid),
            new HHex(new Point(...axial_to_xy_h(q - 1, r, this.grid)), this.grid),
            new HHex(new Point(...axial_to_xy_h(q, r + 1, this.grid)), this.grid),
            new HHex(new Point(...axial_to_xy_h(q, r - 1, this.grid)), this.grid),
            new HHex(new Point(...axial_to_xy_h(q + 1, r - 1, this.grid)), this.grid),
            new HHex(new Point(...axial_to_xy_h(q - 1, r + 1, this.grid)), this.grid),
        ];
    }
}
