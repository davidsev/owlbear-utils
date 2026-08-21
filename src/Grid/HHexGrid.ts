import type { Vector2 } from '@owlbear-rodeo/sdk';
import { BaseHexGrid, axial_round } from './BaseHexGrid';
import { SQRT3 } from './constants';
import { HHex } from './Cell/HHex';

export class HHexGrid extends BaseHexGrid<HHex> {
    public get type() {
        return 'HEX_HORIZONTAL' as const;
    }

    public xy_to_axial(x: number, y: number): [q: number, r: number] {
        const q = ((2 / 3) * x) / this.hexRadius;
        const r = ((-1 / 3) * x + (SQRT3 / 3) * y) / this.hexRadius;
        return [q, r];
    }

    public axial_to_xy(q: number, r: number): [x: number, y: number] {
        const x = this.hexRadius * ((3 / 2) * q);
        const y = this.hexRadius * ((SQRT3 / 2) * q + SQRT3 * r);
        return [x, y];
    }

    public getCell(point: Vector2): HHex {
        // OBR has 0,0 not in the center of a hex, so offset by half a hex
        const [q, r] = this.xy_to_axial(point.x + this.hexRadius / 2, point.y);
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = this.axial_to_xy(round_q, round_r);
        return new HHex({ x: x - this.hexRadius / 2, y }, this);
    }
}
