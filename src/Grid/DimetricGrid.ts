import type { Vector2 } from '@owlbear-rodeo/sdk';
import { BaseAxonometricGrid } from './BaseAxonometricGrid';
import { Dimetric } from './Cell/Dimetric';

/** A dimetric (2:1) axonometric grid. */
export class DimetricGrid extends BaseAxonometricGrid<Dimetric> {
    public get type() {
        return 'DIMETRIC' as const;
    }

    /** Converts a scene-space point to fractional (u, v) coordinates in this dimetric projection. */
    public xy_to_uv(x: number, y: number): [u: number, v: number] {
        const w = this.dpi * 2;
        const h = this.dpi;
        return [x / w + y / h, x / w - y / h];
    }

    /** Converts (u, v) coordinates back to a scene-space point in this dimetric projection. */
    public uv_to_xy(u: number, v: number): [x: number, y: number] {
        const w = this.dpi * 2;
        const h = this.dpi;
        return [((u + v) * w) / 2, ((u - v) * h) / 2];
    }

    /** Returns the dimetric cell that contains the given point. */
    public getCell(point: Vector2): Dimetric {
        // OBR has 0,0 not in the center of a cell, so offset by a bit.  xOffset / (dpi * 2) is
        // exactly 0.5, so without the nudge below, points on the diagonal cell boundaries (eg. the
        // origin) land exactly on a rounding tie. The offset is negative and nudged just under dpi
        // in magnitude so the tie breaks towards the cell above/right of the boundary point,
        // matching SquareGrid's round-half-up convention.
        const xOffset = -(this.dpi * (1 - 1e-9));
        const [u, v] = this.xy_to_uv(point.x + xOffset, point.y);
        const [x, y] = this.uv_to_xy(Math.round(u), Math.round(v));
        return new Dimetric({ x: x - xOffset, y }, this);
    }
}
