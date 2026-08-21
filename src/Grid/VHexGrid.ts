import type { Vector2 } from '@owlbear-rodeo/sdk';
import { BaseHexGrid, axial_round } from './BaseHexGrid';
import { SQRT3 } from './constants';
import { VHex } from './Cell/VHex';

export class VHexGrid extends BaseHexGrid<VHex> {
    public get type() {
        return 'HEX_VERTICAL' as const;
    }

    public xy_to_axial(x: number, y: number): [q: number, r: number] {
        const q = ((SQRT3 / 3) * x - (1 / 3) * y) / this.hexRadius;
        const r = ((2 / 3) * y) / this.hexRadius;
        return [q, r];
    }

    public axial_to_xy(q: number, r: number): [x: number, y: number] {
        const x = this.hexRadius * (SQRT3 * q + (SQRT3 / 2) * r);
        const y = this.hexRadius * ((3 / 2) * r);
        return [x, y];
    }

    public getCell(point: Vector2): VHex {
        // OBR has 0,0 not in the center of a hex, so offset by half a hex
        const [q, r] = this.xy_to_axial(point.x, point.y + this.hexRadius / 2);
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = this.axial_to_xy(round_q, round_r);
        return new VHex({ x, y: y - this.hexRadius / 2 }, this);
    }
}
