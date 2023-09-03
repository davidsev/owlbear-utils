import { Cell } from './Cell';
import { Vector } from '../../Vector';
import { grid } from '../../index';
import { Vector2 } from '@owlbear-rodeo/sdk';

export class Square extends Cell {

    public readonly center: Vector;

    constructor (center: Vector2) {
        super();
        this.center = new Vector(center);
    }

    static fromCoords (point: Vector2): Square {
        return new Square((new Vector(point)).nearestGridCenter);
    }

    get corners (): Vector[] {
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
