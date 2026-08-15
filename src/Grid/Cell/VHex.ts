import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell } from './Cell';
import { axial_round, axial_to_xy_v, xy_to_axial_v } from '../HexFunctions';
import { BaseHex } from './BaseHex';
import type { Grid } from '../Grid';

export class VHex extends BaseHex {

    constructor (center: Vector2, grid: Grid) {
        super(center, grid);
        if (grid.type !== 'HEX_VERTICAL')
            throw new Error(`Cannot create a VHex cell for a "${grid.type}" grid`);
    }

    static fromAxial (q: number, r: number, grid: Grid): VHex {
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = axial_to_xy_v(round_q, round_r, grid);

        return new VHex({ x: x, y: y - (grid.hexRadius / 2) }, grid);
    }

    get axialCoords (): [q: number, r: number, s: number] {
        const [q, r] = xy_to_axial_v(this.center.x, this.center.y, this.grid);
        return [q, r, -q - r];
    }

    get corners (): Point[] {
        return [
            this.center.add({ x: 0, y: -this.grid.hexRadius }),
            this.center.add({ x: this.grid.dpi / 2, y: -this.grid.hexRadius / 2 }),
            this.center.add({ x: this.grid.dpi / 2, y: this.grid.hexRadius / 2 }),
            this.center.add({ x: 0, y: this.grid.hexRadius }),
            this.center.add({ x: -this.grid.dpi / 2, y: this.grid.hexRadius / 2 }),
            this.center.add({ x: -this.grid.dpi / 2, y: -this.grid.hexRadius / 2 }),
        ];
    }

    public toString (): string {
        return `VHex${this.center}`;
    }

    isAdjacent (other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (Math.abs(xDiff - this.grid.dpi * 0.5) < 1 && Math.abs(yDiff - this.grid.hexRadius * 1.5) < 1)
            || (Math.abs(xDiff - this.grid.dpi) < 1 && yDiff < 1);
    }

    public containsPoint (point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }

    public neighbors (include_corners: boolean): VHex[] {
        const [q, r] = xy_to_axial_v(this.center.x, this.center.y, this.grid);

        return [
            new VHex(new Point(...axial_to_xy_v(q + 1, r, this.grid)), this.grid),
            new VHex(new Point(...axial_to_xy_v(q - 1, r, this.grid)), this.grid),
            new VHex(new Point(...axial_to_xy_v(q, r + 1, this.grid)), this.grid),
            new VHex(new Point(...axial_to_xy_v(q, r - 1, this.grid)), this.grid),
            new VHex(new Point(...axial_to_xy_v(q + 1, r - 1, this.grid)), this.grid),
            new VHex(new Point(...axial_to_xy_v(q - 1, r + 1, this.grid)), this.grid),
        ];
    }
}
