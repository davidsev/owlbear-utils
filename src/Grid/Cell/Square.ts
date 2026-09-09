import { Cell } from './Cell';
import { Point } from '../Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';
import type { SquareGrid } from '../SquareGrid';

/** A cell of a `SquareGrid`. */
export class Square extends Cell {
    public declare readonly grid: SquareGrid;
    public readonly center: Point;

    constructor(center: Vector2, grid: SquareGrid) {
        super(grid);
        this.center = new Point(center);
    }

    /** The four corners of this square, starting top-left and going clockwise. */
    get corners(): Point[] {
        const halfDpi = this.grid.dpi / 2;
        return [
            this.center.add({ x: -halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: +halfDpi }),
            this.center.add({ x: -halfDpi, y: +halfDpi }),
        ];
    }

    /** The midpoint of each of this square's four edges, starting top and going clockwise. */
    get edgeMidpoints(): Point[] {
        const halfDpi = this.grid.dpi / 2;
        return [
            this.center.add({ x: 0, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: 0 }),
            this.center.add({ x: 0, y: +halfDpi }),
            this.center.add({ x: -halfDpi, y: 0 }),
        ];
    }

    /** Formats as `"Square(x, y)"`. */
    public toString(): string {
        return `Square${this.center}`;
    }

    /**
     * The closest point on this square's perimeter to the given point, for a point inside the square.  The
     * candidates aren't clamped to the edges, so for a point outside it the result can be off the perimeter.
     */
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

    /** True if this square and `other` share an edge (not just a corner). */
    isAdjacent(other: Cell): boolean {
        const xDiff = Math.abs(this.center.x - other.center.x);
        const yDiff = Math.abs(this.center.y - other.center.y);
        return (xDiff === this.grid.dpi && yDiff === 0) || (xDiff === 0 && yDiff === this.grid.dpi);
    }

    /** True if this square contains the given point. */
    public containsPoint(point: Vector2): boolean {
        return (
            point.x >= this.center.x - this.grid.dpi / 2 &&
            point.x < this.center.x + this.grid.dpi / 2 &&
            point.y >= this.center.y - this.grid.dpi / 2 &&
            point.y < this.center.y + this.grid.dpi / 2
        );
    }

    /** This square's up to eight neighboring cells, optionally including diagonal ones. */
    public neighbors(include_corners: boolean): Square[] {
        const neighbors: Square[] = [];
        for (let x = -this.grid.dpi; x <= this.grid.dpi; x += this.grid.dpi) {
            for (let y = -this.grid.dpi; y <= this.grid.dpi; y += this.grid.dpi) {
                if (x === 0 && y === 0) continue;
                if (!include_corners && Math.abs(x) === Math.abs(y)) continue;
                neighbors.push(this.grid.getCell(this.center.add({ x, y })));
            }
        }
        return neighbors;
    }
}
