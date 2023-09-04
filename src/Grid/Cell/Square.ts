import { Cell } from './Cell';
import { Point } from '../../Point';
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
}
