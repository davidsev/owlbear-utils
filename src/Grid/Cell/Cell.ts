import { Point } from '../../Point';

export abstract class Cell {

    public abstract get center (): Point;

    public abstract get corners (): Point[];

    public abstract toString (): string;
}

