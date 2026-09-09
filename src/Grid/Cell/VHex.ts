import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { Cell } from './Cell';
import { axial_round } from '../BaseHexGrid';
import { BaseHex } from './BaseHex';
import type { VHexGrid } from '../VHexGrid';

/** A cell of a `VHexGrid`. */
export class VHex extends BaseHex {
    public declare readonly grid: VHexGrid;

    // biome-ignore lint/complexity/noUselessConstructor: narrows the inherited grid param to VHexGrid, so the declare above holds
    constructor(center: Vector2, grid: VHexGrid) {
        super(center, grid);
    }

    /** Builds the VHex at the given axial (q, r) hex coordinates. */
    static fromAxial(q: number, r: number, grid: VHexGrid): VHex {
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = grid.axial_to_xy(round_q, round_r);

        return new VHex({ x: x, y: y - grid.hexRadius / 2 }, grid);
    }

    /** This cell's axial (q, r, s) hex coordinates, where s is always `-q - r`. */
    get axialCoords(): [q: number, r: number, s: number] {
        // getCell/fromAxial offset y by half a hex before converting (OBR's 0,0 isn't a cell
        // center), so invert that offset here to get back the exact integers fromAxial was built
        // from, rather than a value that's only right once rounded.
        const [q, r] = this.grid.xy_to_axial(this.center.x, this.center.y + this.grid.hexRadius / 2);
        return [q, r, -q - r];
    }

    /** The six corners of this hex, starting top and going clockwise. */
    get corners(): Point[] {
        return [
            this.center.add({ x: 0, y: -this.grid.hexRadius }),
            this.center.add({ x: this.grid.dpi / 2, y: -this.grid.hexRadius / 2 }),
            this.center.add({ x: this.grid.dpi / 2, y: this.grid.hexRadius / 2 }),
            this.center.add({ x: 0, y: this.grid.hexRadius }),
            this.center.add({ x: -this.grid.dpi / 2, y: this.grid.hexRadius / 2 }),
            this.center.add({ x: -this.grid.dpi / 2, y: -this.grid.hexRadius / 2 }),
        ];
    }

    /** The midpoint of each of this hex's six edges, in the same order as `corners`. */
    get edgeMidpoints(): Point[] {
        return [
            this.center.add({ x: this.grid.dpi / 4, y: (-this.grid.hexRadius * 3) / 4 }),
            this.center.add({ x: this.grid.dpi / 2, y: 0 }),
            this.center.add({ x: this.grid.dpi / 4, y: (this.grid.hexRadius * 3) / 4 }),
            this.center.add({ x: -this.grid.dpi / 4, y: (this.grid.hexRadius * 3) / 4 }),
            this.center.add({ x: -this.grid.dpi / 2, y: 0 }),
            this.center.add({ x: -this.grid.dpi / 4, y: (-this.grid.hexRadius * 3) / 4 }),
        ];
    }

    /** Formats as `"VHex(x, y)"`. */
    public toString(): string {
        return `VHex${this.center}`;
    }

    /** True if this hex and `other` share an edge. */
    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (
            (Math.abs(xDiff - this.grid.dpi * 0.5) < 1 && Math.abs(yDiff - this.grid.hexRadius * 1.5) < 1) ||
            (Math.abs(xDiff - this.grid.dpi) < 1 && yDiff < 1)
        );
    }

    /** True if this hex contains the given point. */
    public containsPoint(point: Vector2): boolean {
        const cell = this.grid.getCell(point);
        return this.center.equals(cell.center);
    }

    /** This hex's six neighboring cells. Hex grids have no diagonal neighbors, so `include_corners` is ignored. */
    public neighbors(_include_corners: boolean): VHex[] {
        const [q, r] = this.grid.xy_to_axial(this.center.x, this.center.y);

        return [
            new VHex(new Point(...this.grid.axial_to_xy(q + 1, r)), this.grid),
            new VHex(new Point(...this.grid.axial_to_xy(q - 1, r)), this.grid),
            new VHex(new Point(...this.grid.axial_to_xy(q, r + 1)), this.grid),
            new VHex(new Point(...this.grid.axial_to_xy(q, r - 1)), this.grid),
            new VHex(new Point(...this.grid.axial_to_xy(q + 1, r - 1)), this.grid),
            new VHex(new Point(...this.grid.axial_to_xy(q - 1, r + 1)), this.grid),
        ];
    }
}
