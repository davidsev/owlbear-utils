import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Cell, grid } from '../../index';
import { axial_round, axial_to_xy_h, xy_to_axial_h } from '../HexFunctions';
import { BaseHex } from './BaseHex';

const SQRT3 = Math.sqrt(3);

export class HHex extends BaseHex {

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

    isAdjacent (other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (Math.abs(xDiff - grid.hexRadius * 1.5) < 1 && Math.abs(yDiff - grid.dpi * 0.5) < 1)
            || (xDiff < 1 && Math.abs(yDiff - grid.dpi) < 1);
    }

    public static iterateCellsBoundingPoints (points: HHex[]): HHex[] {
        let rMin = Infinity;
        let rMax = -Infinity;
        let qMin = Infinity;
        let qMax = -Infinity;

        for (const point of points) {
            const [q, r] = xy_to_axial_h(point.center.x, point.center.y);
            rMin = Math.min(rMin, r);
            rMax = Math.max(rMax, r);
            qMin = Math.min(qMin, q);
            qMax = Math.max(qMax, q);
        }

        const cells: HHex[] = [];
        for (let r = Math.floor(rMin); r <= Math.ceil(rMax); r++) {
            for (let q = Math.floor(qMin); q <= Math.ceil(qMax); q++) {
                const [x, y] = axial_to_xy_h(q, r);
                cells.push(HHex.fromCoords({ x, y }));
            }
        }

        return cells;
    }

    public containsPoint (point: Vector2): boolean {
        const Cell = HHex.fromCoords(point);
        return this.center.equals(Cell.center);
    }
}
