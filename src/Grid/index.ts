import OBR, { Grid as BaseGrid, GridMeasurement, GridScale, GridStyle, GridType, Vector2 } from '@owlbear-rodeo/sdk';
import { SnapTo } from './SnapTo';
import { Cell } from './Cell/Cell';
import { Square } from './Cell/Square';
import { VHex } from './Cell/VHex';
import { Point } from './Point';
import { HHex } from './Cell/HHex';
import { Measure } from './MeasurementFunctions';
import { Isometric } from './Cell/Isometric';
import { Dimetric } from './Cell/Dimetric';

const SQRT3 = Math.sqrt(3);

export class Grid implements BaseGrid {
    private gridData?: BaseGrid;
    private scaleData?: GridScale;
    private static instance: Grid;
    private readyPromises: (() => void)[] = [];

    /** Sets up the event listener, and resolves once the first data is loaded. */
    public async init () {

        // Watch for grid changes.
        OBR.scene.grid.onChange(async (gridData) => {
            // Copy in the data.
            this.gridData = gridData;
            // Also get the proper scale data.
            this.scaleData = (await OBR.scene.grid.getScale());

            this.readyPromises.forEach(resolve => resolve());
            this.readyPromises = [];
        });

        // Set the initial data (the change event won't fire if the scene has already loaded).
        if (await OBR.scene.isReady()) {
            const promises = {
                dpi: OBR.scene.grid.getDpi(),
                measurement: OBR.scene.grid.getMeasurement(),
                scale: OBR.scene.grid.getScale(),
                style: {
                    lineType: OBR.scene.grid.getLineType(),
                    lineOpacity: OBR.scene.grid.getOpacity(),
                    lineColor: OBR.scene.grid.getColor(),
                    lineWidth: OBR.scene.grid.getLineWidth(),
                },
                type: OBR.scene.grid.getType(),
            };
            this.gridData = {
                dpi: await promises.dpi,
                measurement: await promises.measurement,
                scale: (await promises.scale).raw,
                style: {
                    lineType: await promises.style.lineType,
                    lineOpacity: await promises.style.lineOpacity,
                    lineColor: await promises.style.lineColor,
                    lineWidth: await promises.style.lineWidth,
                },
                type: await promises.type,
            };
            this.scaleData = await promises.scale;

            this.readyPromises.forEach(resolve => resolve());
            this.readyPromises = [];
        }
    }

    public async awaitReady () {
        if (this.gridData)
            return Promise.resolve();
        return new Promise<void>(resolve => {
            this.readyPromises.push(resolve);
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
        if (this.gridData.type === 'ISOMETRIC')
            return Isometric.fromCoords(point);
        if (this.gridData.type === 'DIMETRIC')
            return Dimetric.fromCoords(point);

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
    public measure (...points: (Cell | Vector2)[]): number {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');

        const cleanPoints = points.map(p => p instanceof Cell ? p.center : new Point(p));

        if (this.gridData.measurement == 'EUCLIDEAN')
            return Measure.euclidean(cleanPoints);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevSquare(cleanPoints);
        if (this.gridData.type === 'HEX_VERTICAL' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevVHex(cleanPoints);
        if (this.gridData.type === 'HEX_HORIZONTAL' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevHHex(cleanPoints);
        if (this.gridData.type === 'ISOMETRIC' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevIsometric(cleanPoints);
        if (this.gridData.type === 'DIMETRIC' && this.gridData.measurement === 'CHEBYSHEV')
            return Measure.chebyshevDimetric(cleanPoints);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'MANHATTAN')
            return Measure.manhattanSquare(cleanPoints);
        if (this.gridData.type === 'ISOMETRIC' && this.gridData.measurement === 'MANHATTAN')
            return Measure.manhattanIsometric(cleanPoints);
        if (this.gridData.type === 'DIMETRIC' && this.gridData.measurement === 'MANHATTAN')
            return Measure.manhattanDimetric(cleanPoints);
        if (this.gridData.type === 'SQUARE' && this.gridData.measurement === 'ALTERNATING')
            return Measure.alternatingSquare(cleanPoints);
        if (this.gridData.type === 'ISOMETRIC' && this.gridData.measurement === 'ALTERNATING')
            return Measure.alternatingIsometric(cleanPoints);
        if (this.gridData.type === 'DIMETRIC' && this.gridData.measurement === 'ALTERNATING')
            return Measure.alternatingDimetric(cleanPoints);

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

    public iterateCellsBoundingPoints<T extends (Square | VHex | HHex | Isometric | Dimetric)> (points: T[]): T[] {
        if (!this.gridData)
            throw new Error('Grid data not loaded yet');

        if (points.length === 0)
            return [];

        if (points[0] instanceof Square)
            return Square.iterateCellsBoundingPoints(points) as T[];
        if (this.gridData.type === 'HEX_VERTICAL')
            return VHex.iterateCellsBoundingPoints(points as VHex[]) as T[];
        if (this.gridData.type === 'HEX_HORIZONTAL')
            return HHex.iterateCellsBoundingPoints(points as HHex[]) as T[];
        if (this.gridData.type === 'ISOMETRIC')
            return Isometric.iterateCellsBoundingPoints(points as Isometric[]) as T[];
        if (this.gridData.type === 'DIMETRIC')
            return Dimetric.iterateCellsBoundingPoints(points as Dimetric[]) as T[];

        throw new Error(`Grid type "${this.gridData.type}" not supported`);
    }
}
