import { Point } from '../Point';
import { Cell } from './Cell';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { grid } from '../../index';
import { axial_round, axial_to_xy_h, xy_to_axial_h } from '../HexFunctions';

export class HHex extends Cell {

    public readonly center: Point;

    constructor (center: Vector2) {
        super();
        this.center = new Point(center);
    }

    static fromCoords (point: Vector2): HHex {

        // OBR has 0,0 not in the center of a hex, so offset by half a hex
        const vec = new Point({
            x: point.x + (grid.hexRadius / 2),
            y: point.y,
        });

        const [q, r] = xy_to_axial_h(vec.x, vec.y);
        const [round_q, round_r] = axial_round(q, r);
        const [x, y] = axial_to_xy_h(round_q, round_r);

        return new HHex({ x: x - (grid.hexRadius / 2), y });
    }

    get corners (): Point[] {
        return [
            this.center.add({ x: -grid.hexRadius, y: 0 }),
            this.center.add({ x: -grid.hexRadius / 2, y: grid.dpi / 2 }),
            this.center.add({ x: grid.hexRadius / 2, y: grid.dpi / 2 }),
            this.center.add({ x: grid.hexRadius, y: 0 }),
            this.center.add({ x: grid.hexRadius / 2, y: -grid.dpi / 2 }),
            this.center.add({ x: -grid.hexRadius / 2, y: -grid.dpi / 2 }),
        ];
    }

    public toString (): string {
        return `VHex${this.center}`;
    }
}
