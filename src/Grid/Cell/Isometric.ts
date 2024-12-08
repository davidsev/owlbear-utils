import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { grid } from '../../index';
import { Cell } from './Cell';
import { uv_to_xy_isometric, xy_to_uv_isometric } from '../IsometricFunctions';
import { BaseAxonometric } from './BaseAxonometric';

const SQRT3 = Math.sqrt(3);

export class Isometric extends BaseAxonometric {

    static fromCoords (point: Vector2): Isometric {
        // OBR has 0,0 not in the center of a cell, so offset by a bit.
        const xOffset = grid.dpi - (grid.hexRadius / 4);
        const vec = new Point({
            x: point.x + xOffset,
            y: point.y,
        });

        const [u, v] = xy_to_uv_isometric(vec.x, vec.y);
        const [x, y] = uv_to_xy_isometric(Math.round(u), Math.round(v));

        return new Isometric({ x: x - xOffset, y });
    }

    get corners (): Point[] {
        return [
            this.center.add({ x: 0, y: -grid.dpi / 2 }),
            this.center.add({ x: +grid.dpi / SQRT3 * 1.5, y: 0 }),
            this.center.add({ x: 0, y: +grid.dpi / 2 }),
            this.center.add({ x: -grid.dpi / SQRT3 * 1.5, y: 0 }),
        ];
    }

    public toString (): string {
        return `Isometric${this.center}`;
    }

    public neighbors (include_corners: boolean): Isometric[] {
        const [u, v] = xy_to_uv_isometric(this.center.x, this.center.y);

        const sides = [
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v))),
            new Isometric(new Point(...uv_to_xy_isometric(u, v + 1))),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v))),
            new Isometric(new Point(...uv_to_xy_isometric(u, v - 1))),
        ];
        const corners = [
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v + 1))),
            new Isometric(new Point(...uv_to_xy_isometric(u + 1, v - 1))),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v + 1))),
            new Isometric(new Point(...uv_to_xy_isometric(u - 1, v - 1))),
        ];

        return [
            ...sides,
            ...(include_corners ? corners : []),
        ];
    }

    isAdjacent (other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (
            Math.abs(xDiff - grid.dpi / SQRT3 * 1.5) < 0.1
            && Math.abs(yDiff - grid.dpi / 2) < 0.1
        );
    }

    public static iterateCellsBoundingPoints (points: Isometric[]): Isometric[] {
        let uMin = Infinity;
        let uMax = -Infinity;
        let vMin = Infinity;
        let vMax = -Infinity;

        for (const point of points) {
            const [u, v] = xy_to_uv_isometric(point.center.x, point.center.y);
            uMin = Math.min(uMin, u);
            uMax = Math.max(uMax, u);
            vMin = Math.min(vMin, v);
            vMax = Math.max(vMax, v);
        }

        const cells: Isometric[] = [];
        for (let u = Math.floor(uMin); u <= Math.ceil(uMax); u++) {
            for (let v = Math.floor(vMin); v <= Math.ceil(vMax); v++) {
                const [x, y] = uv_to_xy_isometric(v, u);
                cells.push(Isometric.fromCoords({ x, y }));
            }
        }

        return cells;
    }

    public containsPoint (point: Vector2): boolean {
        const Cell = Isometric.fromCoords(point);
        return this.center.equals(Cell.center);
    }

    public get axonometricCoords (): [u: number, v: number] {
        return xy_to_uv_isometric(this.center.x, this.center.y);
    }
}
