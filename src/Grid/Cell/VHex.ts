import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { grid } from '../../index';
import { axial_round, axial_to_xy_v, xy_to_axial_v } from '../HexFunctions';
import { BaseHex } from './BaseHex';

export class VHex extends BaseHex {

    static fromCoords (point: Vector2): VHex {

        // OBR has 0,0 not in the center of a hex, so offset by half a hex
        const vec = new Point({
            x: point.x,
            y: point.y + (grid.hexRadius / 2),
        });

        const [q, r] = xy_to_axial_v(vec.x, vec.y);
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = axial_to_xy_v(round_q, round_r);

        return new VHex({ x, y: y - (grid.hexRadius / 2) });
    }

    get corners (): Point[] {
        return [
            this.center.add({ x: 0, y: -grid.hexRadius }),
            this.center.add({ x: grid.dpi / 2, y: -grid.hexRadius / 2 }),
            this.center.add({ x: grid.dpi / 2, y: grid.hexRadius / 2 }),
            this.center.add({ x: 0, y: grid.hexRadius }),
            this.center.add({ x: -grid.dpi / 2, y: grid.hexRadius / 2 }),
            this.center.add({ x: -grid.dpi / 2, y: -grid.hexRadius / 2 }),
        ];
    }

    public toString (): string {
        return `VHex${this.center}`;
    }
}
