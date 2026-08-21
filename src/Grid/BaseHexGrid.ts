import { Grid } from './Grid';
import type { Point } from './Point';
import type { BaseHex } from './Cell/BaseHex';

// Mostly taken from https://www.redblobgames.com/grids/hexagons/
export function axial_round(x: number, y: number): [number, number] {
    const rounded_x = Math.round(x);
    const rounded_y = Math.round(y);
    x -= rounded_x;
    y -= rounded_y; // remainder
    const dx = Math.round(x + 0.5 * y) * Number(x * x >= y * y);
    const dy = Math.round(y + 0.5 * x) * Number(x * x < y * y);
    return [rounded_x + dx, rounded_y + dy];
}

/**
 * Shared by the two hex orientations.  Everything here is written against the abstract axial
 * conversions below, so the subclasses only have to supply those and their own `getCell`.
 */
export abstract class BaseHexGrid<C extends BaseHex = BaseHex> extends Grid<C> {
    public abstract xy_to_axial(x: number, y: number): [q: number, r: number];

    public abstract axial_to_xy(q: number, r: number): [x: number, y: number];

    protected iterateCells(points: C[]): C[] {
        let rMin = Infinity,
            rMax = -Infinity,
            qMin = Infinity,
            qMax = -Infinity;
        for (const point of points) {
            const [q, r] = this.xy_to_axial(point.center.x, point.center.y);
            rMin = Math.min(rMin, r);
            rMax = Math.max(rMax, r);
            qMin = Math.min(qMin, q);
            qMax = Math.max(qMax, q);
        }

        const cells: C[] = [];
        for (let r = Math.floor(rMin); r <= Math.ceil(rMax); r++) {
            for (let q = Math.floor(qMin); q <= Math.ceil(qMax); q++) {
                const [x, y] = this.axial_to_xy(q, r);
                cells.push(this.getCell({ x, y }));
            }
        }
        return cells;
    }

    protected measureChebyshev(points: Point[]): number {
        const gridPoints = points.map((p) => {
            const [q, r] = this.xy_to_axial(p.x, p.y);
            return { q, r, s: -q - r };
        });
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
        }
        return distance;
    }

    // Hex grids have no meaningful Manhattan or Alternating measurement, so they keep Grid's
    // default of throwing.
}
