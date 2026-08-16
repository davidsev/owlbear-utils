import OBR, {
    type Grid as BaseGrid,
    type GridMeasurement,
    type GridScale,
    type GridStyle,
    type GridType,
    type Vector2,
} from '@owlbear-rodeo/sdk';
import { Grid } from './Grid';
import type { SnapTo } from './SnapTo';
import type { Cell } from './Cell/Cell';
import type { Square } from './Cell/Square';
import type { VHex } from './Cell/VHex';
import type { HHex } from './Cell/HHex';
import type { Isometric } from './Cell/Isometric';
import type { Dimetric } from './Cell/Dimetric';
import type { Point } from './Point';

/** Called with the new settings whenever the grid changes. */
export type GridChangeCallback = (grid: Grid) => void;

/** Watches OBR's scene grid, and exposes the current settings as a Grid. */
export class LiveGrid implements BaseGrid {
    private current?: Grid;
    private readyPromises: (() => void)[] = [];
    private changeCallbacks: GridChangeCallback[] = [];
    private obrUnsubscribe?: () => void;
    /** Bumped for every update, so a slow scale lookup can't overwrite newer data. */
    private seq = 0;

    /** Sets up the event listener, and resolves once the first data is loaded. */
    public async init() {
        // Don't subscribe twice, or every change would be published twice.
        if (this.obrUnsubscribe) return;

        // Watch for grid changes.
        this.obrUnsubscribe = OBR.scene.grid.onChange((gridData) => {
            const seq = ++this.seq;

            // getScale() only adds the parsed breakdown to the raw string that's already in
            // gridData, so if the scale hasn't changed we can publish without waiting for it.
            const cachedScale = this.current?.gridScale;
            if (cachedScale && cachedScale.raw === gridData.scale) {
                this.publish(new Grid(gridData, cachedScale));
                return;
            }

            OBR.scene.grid
                .getScale()
                .then((scaleData) => {
                    // Something newer arrived while we were waiting, so drop this.
                    if (seq === this.seq) this.publish(new Grid(gridData, scaleData));
                })
                .catch((err) => {
                    console.error('[owlbear-utils] Failed to read the grid scale', err);
                });
        });

        // Set the initial data (the change event won't fire if the scene has already loaded).
        if (await OBR.scene.isReady()) {
            const seq = ++this.seq;
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
            const gridData: BaseGrid = {
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
            const scaleData = await promises.scale;

            // A change event may have landed while we were loading, and that data is newer.
            if (seq === this.seq) this.publish(new Grid(gridData, scaleData));
        }
    }

    /** Swap in a new snapshot, then tell everyone who's waiting. */
    private publish(grid: Grid): void {
        this.current = grid;

        this.readyPromises.forEach((resolve) => {
            resolve();
        });
        this.readyPromises = [];

        // Copy the list, so a callback that unsubscribes doesn't disturb the iteration.
        for (const callback of [...this.changeCallbacks]) {
            try {
                callback(grid);
            } catch (err) {
                console.error('[owlbear-utils] Error in a grid change callback', err);
            }
        }
    }

    /**
     * Watch for grid changes.
     * This fires after our own data has been updated, so unlike OBR's event it's safe to read
     * the grid from the callback.  Returns a function to unsubscribe.
     */
    public onChange(callback: GridChangeCallback): () => void {
        this.changeCallbacks.push(callback);
        return () => {
            const index = this.changeCallbacks.indexOf(callback);
            if (index !== -1) this.changeCallbacks.splice(index, 1);
        };
    }

    public async awaitReady() {
        if (this.current) return Promise.resolve();
        return new Promise<void>((resolve) => {
            this.readyPromises.push(resolve);
        });
    }

    private get grid(): Grid {
        if (!this.current) throw new Error('Grid data not loaded yet');
        return this.current;
    }

    /** The current settings, as an immutable snapshot to pass to cells and other helpers. */
    public get snapshot(): Grid {
        return this.grid;
    }

    get dpi(): number {
        return this.grid.dpi;
    }

    get hexRadius(): number {
        return this.grid.hexRadius;
    }

    get style(): GridStyle {
        return this.grid.style;
    }

    get type(): GridType {
        return this.grid.type;
    }

    get measurement(): GridMeasurement {
        return this.grid.measurement;
    }

    get scale(): string {
        return this.grid.scale;
    }

    get gridScale(): GridScale {
        return this.grid.gridScale;
    }

    public getCell(point: Vector2): Cell {
        return this.grid.getCell(point);
    }

    public snapTo(point: Vector2, snapTo: SnapTo): Point {
        return this.grid.snapTo(point, snapTo);
    }

    /** Returns the distance between two point, measured in grid cells. */
    public measure(...points: (Cell | Vector2)[]): number {
        return this.grid.measure(...points);
    }

    /** Get whether the point is closest to the corner or the center of a cell. */
    public getNearestSnapType(point: Vector2): SnapTo {
        return this.grid.getNearestSnapType(point);
    }

    public iterateCellsBoundingPoints<T extends Square | VHex | HHex | Isometric | Dimetric>(points: T[]): T[] {
        return this.grid.iterateCellsBoundingPoints(points);
    }
}
