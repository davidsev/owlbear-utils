import OBR, {
    type Grid as BaseGrid,
    type GridMeasurement,
    type GridScale,
    type GridStyle,
    type GridType,
    type Vector2,
} from '@owlbear-rodeo/sdk';
import type { Grid } from './Grid';
import type { AnyGrid } from './AnyGrid';
import { assertSupportedGridType, buildGrid } from './buildGrid';
import type { SnapTo } from './SnapTo';
import type { Cell } from './Cell/Cell';
import type { AnyCell } from './Cell/AnyCell';
import type { Point } from './Point';

/** Called with the new settings whenever the grid changes. */
export type GridChangeCallback = (grid: AnyGrid) => void;

/** Watches OBR's scene grid, and exposes the current settings as a Grid. */
export class LiveGrid implements BaseGrid {
    private current?: AnyGrid;
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
            // Fail here rather than letting buildGrid() throw further down: on the async path that
            // error would land in the catch below and be reported as a scale lookup failure.
            assertSupportedGridType(gridData.type);

            const seq = ++this.seq;

            // getScale() only adds the parsed breakdown to the raw string that's already in
            // gridData, so if the scale hasn't changed we can publish without waiting for it.
            const cachedScale = this.current?.gridScale;
            if (cachedScale && cachedScale.raw === gridData.scale) {
                this.publish(buildGrid(gridData, cachedScale));
                return;
            }

            OBR.scene.grid
                .getScale()
                .then((scaleData) => {
                    // Something newer arrived while we were waiting, so drop this.
                    if (seq === this.seq) this.publish(buildGrid(gridData, scaleData));
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
            if (seq === this.seq) this.publish(buildGrid(gridData, scaleData));
        }
    }

    /** Swap in a new snapshot, then tell everyone who's waiting. */
    private publish(grid: AnyGrid): void {
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

    /** Resolves once the first grid snapshot has loaded. */
    public async awaitReady() {
        if (this.current) return Promise.resolve();
        return new Promise<void>((resolve) => {
            this.readyPromises.push(resolve);
        });
    }

    private get grid(): AnyGrid {
        if (!this.current) throw new Error('Grid data not loaded yet');
        return this.current;
    }

    /**
     * The current settings, as an immutable snapshot to pass to cells and other helpers.
     * Switch on `.type` to narrow this to a concrete grid class — see `AnyGrid`.
     */
    public get snapshot(): AnyGrid {
        return this.grid;
    }

    /** The pixel size of one grid cell. */
    get dpi(): number {
        return this.grid.dpi;
    }

    /** The radius of a hex cell, in pixels, derived from `dpi`. */
    get hexRadius(): number {
        return this.grid.hexRadius;
    }

    /** The scene's grid line/shading style. */
    get style(): GridStyle {
        return this.grid.style;
    }

    /** Which grid type the scene currently uses. */
    get type(): GridType {
        return this.grid.type;
    }

    /** The distance measurement rule this grid uses (Euclidean, Chebyshev, Manhattan, or Alternating). */
    get measurement(): GridMeasurement {
        return this.grid.measurement;
    }

    /** The unit label for one grid cell, eg. `"5ft"`. */
    get scale(): string {
        return this.grid.scale;
    }

    /** The scale settings (cell size and unit label) of the current snapshot. */
    get gridScale(): GridScale {
        return this.grid.gridScale;
    }

    /** Returns the cell of the current grid type that contains the given point. */
    public getCell(point: Vector2): AnyCell {
        return this.grid.getCell(point);
    }

    /** Snaps a point to the nearest of the requested `SnapTo` targets (center, corner, edge, edge midpoint) of its cell. */
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

    /** Returns every cell that touches the convex hull of the given cells (see `Grid.iterateCellsBoundingPoints`). */
    public iterateCellsBoundingPoints<T extends AnyCell>(points: T[]): T[] {
        // Go via the base class: each subclass narrows this method's parameter, so calling it on
        // the AnyGrid union asks for the intersection of all five cell types, which nothing
        // satisfies.  The upcast takes any Cell[] though, so the `as T[]` below is only sound
        // because Grid.checkCellType() re-checks the cells against the grid at runtime.
        const grid: Grid = this.grid;
        return grid.iterateCellsBoundingPoints(points) as T[];
    }
}
