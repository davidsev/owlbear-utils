import type { Vector2 } from '@owlbear-rodeo/sdk';
import { BaseAxonometricGrid } from './BaseAxonometricGrid';
import { SQRT3 } from './constants';
import { Isometric } from './Cell/Isometric';

export class IsometricGrid extends BaseAxonometricGrid<Isometric> {
    public get type() {
        return 'ISOMETRIC' as const;
    }

    public xy_to_uv(x: number, y: number): [u: number, v: number] {
        const w = (this.dpi / SQRT3) * 3;
        const h = this.dpi;
        return [x / w + y / h, x / w - y / h];
    }

    public uv_to_xy(u: number, v: number): [x: number, y: number] {
        const w = (this.dpi / SQRT3) * 3;
        const h = this.dpi;
        return [((u + v) * w) / 2, ((u - v) * h) / 2];
    }

    public getCell(point: Vector2): Isometric {
        // OBR has 0,0 not in the center of a cell, so offset by half a cell width (dpi * SQRT3 / 2,
        // the same half-width Isometric.corners uses).  xOffset / w is exactly 0.5, so without the
        // nudge below, points on the diagonal cell boundaries (eg. the origin) land exactly on a
        // rounding tie.  The offset is negative and nudged just under that magnitude so the tie
        // breaks towards the cell above/right of the boundary point, matching SquareGrid's
        // round-half-up convention and DimetricGrid's.
        const xOffset = -(((this.dpi * SQRT3) / 2) * (1 - 1e-9));
        const [u, v] = this.xy_to_uv(point.x + xOffset, point.y);
        const [x, y] = this.uv_to_xy(Math.round(u), Math.round(v));
        return new Isometric({ x: x - xOffset, y }, this);
    }
}
