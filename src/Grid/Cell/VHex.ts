import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell, grid } from '../../index';
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

    isAdjacent (other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (Math.abs(xDiff - grid.dpi * 0.5) < 1 && Math.abs(yDiff - grid.hexRadius * 1.5) < 1)
            || (Math.abs(xDiff - grid.dpi) < 1 && yDiff < 1);
    }

    public static iterateCellsBoundingPoints (points: VHex[]): VHex[] {
        let rMin = Infinity;
        let rMax = -Infinity;
        let qMin = Infinity;
        let qMax = -Infinity;

        for (const point of points) {
            const [q, r] = xy_to_axial_v(point.center.x, point.center.y);
            rMin = Math.min(rMin, r);
            rMax = Math.max(rMax, r);
            qMin = Math.min(qMin, q);
            qMax = Math.max(qMax, q);
        }

        const cells: VHex[] = [];
        for (let r = Math.floor(rMin); r <= Math.ceil(rMax); r++) {
            for (let q = Math.floor(qMin); q <= Math.ceil(qMax); q++) {
                const [x, y] = axial_to_xy_v(q, r);
                cells.push(VHex.fromCoords({ x, y }));
            }
        }

        return cells;
    }

    public containsPoint (point: Vector2): boolean {
        const Cell = VHex.fromCoords(point);
        return this.center.equals(Cell.center);
    }
}
