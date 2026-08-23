import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { axial_round } from '../BaseHexGrid';
import { BaseHex } from './BaseHex';
import type { HHexGrid } from '../HHexGrid';

export class HHex extends BaseHex {
    public declare readonly grid: HHexGrid;

    // biome-ignore lint/complexity/noUselessConstructor: narrows the inherited grid param to HHexGrid, so the declare above holds
    constructor(center: Vector2, grid: HHexGrid) {
        super(center, grid);
    }

    static fromAxial(q: number, r: number, grid: HHexGrid): HHex {
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = grid.axial_to_xy(round_q, round_r);

        return new HHex({ x: x - grid.hexRadius / 2, y }, grid);
    }

    get axialCoords(): [q: number, r: number, s: number] {
        // getCell/fromAxial offset x by half a hex before converting (OBR's 0,0 isn't a cell
        // center), so invert that offset here to get back the exact integers fromAxial was built
        // from, rather than a value that's only right once rounded.
        const [q, r] = this.grid.xy_to_axial(this.center.x + this.grid.hexRadius / 2, this.center.y);
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
        const [q, r] = this.grid.xy_to_axial(this.center.x, this.center.y);

        return [
            new HHex(new Point(...this.grid.axial_to_xy(q + 1, r)), this.grid),
            new HHex(new Point(...this.grid.axial_to_xy(q - 1, r)), this.grid),
            new HHex(new Point(...this.grid.axial_to_xy(q, r + 1)), this.grid),
            new HHex(new Point(...this.grid.axial_to_xy(q, r - 1)), this.grid),
            new HHex(new Point(...this.grid.axial_to_xy(q + 1, r - 1)), this.grid),
            new HHex(new Point(...this.grid.axial_to_xy(q - 1, r + 1)), this.grid),
        ];
    }
}
