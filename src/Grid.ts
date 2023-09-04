import OBR, { Grid as BaseGrid, GridMeasurement, GridScale, GridStyle, GridType, Vector2 } from '@owlbear-rodeo/sdk';
import { SnapTo } from './Grid/SnapTo';
import { Cell } from './Grid/Cell/Cell';
import { Square } from './Grid/Cell/Square';
import { VHex } from './Grid/Cell/VHex';
import { Point } from './Point';
import { HHex } from './Grid/Cell/HHex';

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

        // If we have no points to snap to, return the original point.
        if (possibleSnapPoints.length === 0) {
            return new Point(point);
        }
        // If there's only one, then return that.
        if (possibleSnapPoints.length === 1) {
            return possibleSnapPoints[0];
        }

        // If there's more than one, work out which is closest to the original point.
        let closestPoint: Point = possibleSnapPoints[0];
        let closestDistance: number = closestPoint.distanceTo(point);
        for (let i = 1; i < possibleSnapPoints.length; i++) {
            const distance = possibleSnapPoints[i].distanceTo(point);
            if (distance < closestDistance) {
                closestPoint = possibleSnapPoints[i];
                closestDistance = distance;
            }
        }
        return closestPoint;
    }
}
