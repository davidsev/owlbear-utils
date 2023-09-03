import { Vector } from '../../Vector';

export abstract class Cell {

    public abstract get center (): Vector;

    public abstract get corners (): Vector[];

    public abstract toString (): string;
}

