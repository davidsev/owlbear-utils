import { Grid } from './Grid';
import type { Point } from './Point';
import type { BaseAxonometric } from './Cell/BaseAxonometric';

/**
 * Shared by the isometric and dimetric grids, which differ only in the width of a cell.  Everything
 * here is written against the abstract uv conversions below, so the subclasses only have to supply
 * those and their own `getCell`.
 */
export abstract class BaseAxonometricGrid<C extends BaseAxonometric = BaseAxonometric> extends Grid<C> {
    public abstract xy_to_uv(x: number, y: number): [u: number, v: number];

    public abstract uv_to_xy(u: number, v: number): [x: number, y: number];

    protected iterateCells(points: C[]): C[] {
        let uMin = Infinity,
            uMax = -Infinity,
            vMin = Infinity,
            vMax = -Infinity;
        for (const point of points) {
            const [u, v] = this.xy_to_uv(point.center.x, point.center.y);
            uMin = Math.min(uMin, u);
            uMax = Math.max(uMax, u);
            vMin = Math.min(vMin, v);
            vMax = Math.max(vMax, v);
        }

        const cells: C[] = [];
        for (let u = Math.floor(uMin); u <= Math.ceil(uMax); u++) {
            for (let v = Math.floor(vMin); v <= Math.ceil(vMax); v++) {
                const [x, y] = this.uv_to_xy(u, v);
                cells.push(this.getCell({ x, y }));
            }
        }
        return cells;
    }

    protected measureChebyshev(points: Point[]): number {
        const gridPoints = points.map((p) => this.xy_to_uv(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return distance;
    }

    protected measureManhattan(points: Point[]): number {
        const gridPoints = points.map((p) => this.xy_to_uv(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        }
        return distance;
    }

    protected measureAlternating(points: Point[]): number {
        const gridPoints = points.map((p) => this.xy_to_uv(p.x, p.y));
        let big = 0;
        let small = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            big += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
            small += Math.min(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return big + Math.floor(small / 2);
    }
}
