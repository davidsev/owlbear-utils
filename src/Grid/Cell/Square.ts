import { Cell } from './Cell';
import { Point } from '../Point';
import { grid } from '../../index';
import { Vector2 } from '@owlbear-rodeo/sdk';

export class Square extends Cell {

    public readonly center: Point;

    constructor (center: Vector2) {
        super();
        this.center = new Point(center);
    }

    static fromCoords (point: Vector2): Square {
        const halfDpi = { x: grid.dpi / 2, y: grid.dpi / 2 };
        return new Square((new Point(point)).add(halfDpi).roundToNearest(grid.dpi).sub(halfDpi));
    }

    get corners (): Point[] {
        const halfDpi = grid.dpi / 2;
        return [
            this.center.add({ x: -halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: -halfDpi }),
            this.center.add({ x: +halfDpi, y: +halfDpi }),
            this.center.add({ x: -halfDpi, y: +halfDpi }),
        ];
    }

    public toString (): string {
        return `Square${this.center}`;
    }

    public nearestPointOnEdge (point: Vector2): Point {
        const minX = this.center.x - (grid.dpi / 2);
        const maxX = this.center.x + (grid.dpi / 2);
        const minY = this.center.y - (grid.dpi / 2);
        const maxY = this.center.y + (grid.dpi / 2);

        const points = [
            { x: minX, y: point.y },
            { x: maxX, y: point.y },
            { x: point.x, y: minY },
            { x: point.x, y: maxY },
        ];

        return Point.nearestPoint(point, points);
    }
}
