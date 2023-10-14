import OBR, { Grid as BaseGrid, GridMeasurement, GridScale, GridStyle, GridType, Vector2 } from '@owlbear-rodeo/sdk';
import { SnapTo } from './SnapTo';
import { Cell } from './Cell/Cell';
import { Square } from './Cell/Square';
import { VHex } from './Cell/VHex';
import { Point } from './Point';
import { HHex } from './Cell/HHex';
import { Measure } from './MeasurementFunctions';

const SQRT3 = Math.sqrt(3);

export class Grid implements BaseGrid {
    private gridData?: BaseGrid;
    private scaleData?: GridScale;
    private static instance: Grid;

    /** Sets up the event listener, and resolves once the first data is loaded. */
    public init () {
        return new Promise<void>((resolve?: (value: (PromiseLike<void> | void)) => void) => {
            // Watch for grid changes.
            OBR.scene.grid.onChange(async (gridData) => {
                // Copy in the data.
                this.gridData = gridData;
                // Also get the proper scale data.
                this.scaleData = (await OBR.scene.grid.getScale());
                // If this is the first call then resolve the promise.
                if (resolve) {
                    resolve();
                    resolve = undefined;
                }
            });
        });
    }

    static getInstance (): Grid {
        if (!Grid.instance)
            Grid.instance = new Grid();
        return Grid.instance;
    }

    public fake (gridData: BaseGrid, scaleData: GridScale) {
        this.gridData = gridData;
        this.scaleData = scaleData;
    }

    get dpi (): number {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.dpi;
    }

    get hexRadius (): number {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.dpi / SQRT3;
    }

    get style (): GridStyle {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.style;
    }

    get type (): GridType {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.type;
    }

    get measurement (): GridMeasurement {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.measurement;
    }

    get scale (): string {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        return this.gridData.scale;
    }

    get gridScale (): GridScale {
        if (!this.scaleData)
            throw new Error('Grid data not loaded yet');
        return this.scaleData;
    }

    public getCell (point: Vector2): Cell {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');
        if (this.gridData.type === 'SQUARE')
            return Square.fromCoords(point);
        if (this.gridData.type === 'HEX_VERTICAL')
            return VHex.fromCoords(point);
        if (this.gridData.type === 'HEX_HORIZONTAL')
            return HHex.fromCoords(point);

        throw new Error(`Grid type "${this.gridData.type}" not supported`);
    }

    public snapTo (point: Vector2, snapTo: SnapTo): Point {

        const cell = this.getCell(point);

        // Make a list of the places we can snap to.
        const possibleSnapPoints: Point[] = [];

        // Work out each selected point.
        if (snapTo & SnapTo.CENTER)
            possibleSnapPoints.push(cell.center);
        if (snapTo & SnapTo.CORNER)
            possibleSnapPoints.push(...cell.corners);
        if (snapTo & SnapTo.EDGE)
            possibleSnapPoints.push(cell.nearestPointOnEdge(point));

        // If we have no points to snap to, return the original point.
        if (possibleSnapPoints.length === 0) {
            return new Point(point);
        }
        // If there's only one, then return that.
        if (possibleSnapPoints.length === 1) {
            return possibleSnapPoints[0];
        }

        // If there's more than one, work out which is closest to the original point.
        return Point.nearestPoint(point, possibleSnapPoints);
    }

    /** Returns the distance between two point, measured in grid cells. */
    public measure (a: Cell | Vector2, b: Cell | Vector2): number {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');

        let pointA: Point;
        if (a instanceof Cell)
            pointA = a.center;
        else
            pointA = new Point(a);
        let pointB: Point;
        if (b instanceof Cell)
            pointB = b.center;
        else
            pointB = new Point(b);

        if (this.gridData.measurement == 'EUCLIDEAN')
            return Measure.euclidean(pointA, pointB);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevSquare(pointA, pointB);
        if (this.gridData.type === 'HEX_VERTICAL' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevVHex(pointA, pointB);
        if (this.gridData.type === 'HEX_HORIZONTAL' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevHHex(pointA, pointB);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'MANHATTAN')
            return Measure.manhattanSquare(pointA, pointB);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'ALTERNATING')
            return Measure.alternatingSquare(pointA, pointB);

        return 0;
    }

    /** Get whether the point is closest to the corner or the center of a cell. */
    public getNearestSnapType (point: Vector2): SnapTo {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');

        const cell = this.getCell(point);
        const closestPoint = this.snapTo(point, SnapTo.ALL);

        if (closestPoint.equals(cell.center))
            return SnapTo.CENTER;
        else
            return SnapTo.CORNER;
    }
}
