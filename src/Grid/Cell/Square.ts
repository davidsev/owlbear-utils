import { Cell } from './Cell';
import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';
import type { Grid } from '../Grid';

export class Square extends Cell {
    public readonly center: Point;

    constructor(center: Vector2, grid: Grid) {
        super(grid);
        if (grid.type !== 'SQUARE') throw new Error(`Cannot create a Square cell for a "${grid.type}" grid`);
        this.center = new Point(center);
    }

    get corners(): Point[] {
        const halfDpi = this.grid.dpi / 2;
        return [
            this.center.add({ x: -halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: +halfDpi }),
            this.center.add({ x: -halfDpi, y: +halfDpi }),
        ];
    }

    public toString(): string {
        return `Square${this.center}`;
    }

    public nearestPointOnEdge(point: Vector2): Point {
        const minX = this.center.x - this.grid.dpi / 2;
        const maxX = this.center.x + this.grid.dpi / 2;
        const minY = this.center.y - this.grid.dpi / 2;
        const maxY = this.center.y + this.grid.dpi / 2;

        const points = [
            { x: minX, y: point.y },
            { x: maxX, y: point.y },
            { x: point.x, y: minY },
            { x: point.x, y: maxY },
        ];

        return Point.nearestPoint(point, points);
    }

    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (xDiff === this.grid.dpi && yDiff === 0) || (xDiff === 0 && yDiff === this.grid.dpi);
    }

    public containsPoint(point: Vector2): boolean {
        return (
            point.x >= this.center.x - this.grid.dpi / 2 &&
            point.x < this.center.x + this.grid.dpi / 2 &&
            point.y >= this.center.y - this.grid.dpi / 2 &&
            point.y < this.center.y + this.grid.dpi / 2
        );
    }

    public neighbors(include_corners: boolean): Square[] {
        const neighbors: Square[] = [];
        for (let x = -this.grid.dpi; x <= this.grid.dpi; x += this.grid.dpi) {
            for (let y = -this.grid.dpi; y <= this.grid.dpi; y += this.grid.dpi) {
                if (x === 0 && y === 0) continue;
                if (!include_corners && Math.abs(x) === Math.abs(y)) continue;
                neighbors.push(this.grid.getCell(this.center.add({ x, y })) as Square);
            }
        }
        return neighbors;
    }
}
