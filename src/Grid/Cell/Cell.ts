import { Point } from '../Point';
import { Vector2 } from '@owlbear-rodeo/sdk';

export abstract class Cell {

    public abstract get center (): Point;

    public abstract get corners (): Point[];

    public abstract nearestPointOnEdge (point: Vector2): Point;

    public abstract toString (): string;
}

