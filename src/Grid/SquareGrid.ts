import type { Vector2 } from '@owlbear-rodeo/sdk';
import { Grid } from './Grid';
import { Point } from './Point';
import { Square } from './Cell/Square';

export class SquareGrid extends Grid<Square> {
    public get type() {
        return 'SQUARE' as const;
    }

    public getCell(point: Vector2): Square {
        const halfDpi = { x: this.dpi / 2, y: this.dpi / 2 };
        const center = new Point(point).add(halfDpi).roundToNearest(this.dpi).sub(halfDpi);
        return new Square(center, this);
    }

    protected iterateCells(points: Square[]): Square[] {
        const xMin = Math.min(...points.map((point) => point.center.x));
        const xMax = Math.max(...points.map((point) => point.center.x));
        const yMin = Math.min(...points.map((point) => point.center.y));
        const yMax = Math.max(...points.map((point) => point.center.y));

        const cells: Square[] = [];
        for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x += this.dpi) {
            for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y += this.dpi) {
                cells.push(this.getCell({ x, y }));
            }
        }
        return cells;
    }

    protected measureChebyshev(points: Point[]): number {
        const gridPoints = points.map((p) => p.div(this.dpi));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        }
        return distance;
    }

    protected measureManhattan(points: Point[]): number {
        const gridPoints = points.map((p) => p.div(this.dpi));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        }
        return distance;
    }

    protected measureAlternating(points: Point[]): number {
        const gridPoints = points.map((p) => p.div(this.dpi));
        let big = 0;
        let small = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            big += Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
            small += Math.min(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        }
        return big + Math.floor(small / 2);
    }
}
