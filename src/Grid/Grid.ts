import type { Grid as BaseGrid, GridMeasurement, GridScale, GridStyle, GridType, Vector2 } from '@owlbear-rodeo/sdk';
import { SnapTo } from './SnapTo';
import { Cell } from './Cell/Cell';
import { Point } from './Point';
import { SQRT3 } from './constants';

/**
 * An immutable snapshot of a scene's grid settings, with no link to OBR.
 *
 * `C` is the cell class this grid type deals in, so subclasses get correctly typed `getCell()` and
 * `iterateCellsBoundingPoints()` without redeclaring either.  It defaults to `Cell`, so plain `Grid`
 * still means "some grid, cell type unknown".
 */
export abstract class Grid<C extends Cell = Cell> implements BaseGrid {
    private readonly gridData: BaseGrid;
    private readonly scaleData: GridScale;

    public constructor(gridData: BaseGrid, scaleData: GridScale) {
        this.gridData = gridData;
        this.scaleData = scaleData;
        this.checkGridType();
    }

    /**
     * Which grid type this class handles.  Subclasses return a literal (`'SQUARE' as const`), which
     * is what lets `AnyGrid` discriminate on it.
     *
     * This has to be an accessor rather than a field: accessors live on the prototype, so they work
     * from the constructor above, whereas a subclass field isn't assigned until after `super()`
     * returns (TypeScript rejects reading an abstract *property* from a constructor for that reason).
     */
    public abstract get type(): GridType;

    /**
     * Throws if the grid data doesn't match the subclass it was handed to, eg. `new SquareGrid()`
     * on hex data.  Every getter below reads from `gridData` while `type` comes from the subclass,
     * so a mismatch would silently report the wrong type rather than failing.
     */
    private checkGridType(): void {
        if (this.gridData.type !== this.type) throw new Error(`Cannot create a "${this.type}" grid from "${this.gridData.type}" grid data`);
    }

    get dpi(): number {
        return this.gridData.dpi;
    }

    get hexRadius(): number {
        return this.gridData.dpi / SQRT3;
    }

    get style(): GridStyle {
        return this.gridData.style;
    }

    get measurement(): GridMeasurement {
        return this.gridData.measurement;
    }

    get scale(): string {
        return this.gridData.scale;
    }

    get gridScale(): GridScale {
        return this.scaleData;
    }

    public abstract getCell(point: Vector2): C;

    public snapTo(point: Vector2, snapTo: SnapTo): Point {
        const cell = this.getCell(point);

        // Make a list of the places we can snap to.
        const possibleSnapPoints: Point[] = [];

        // Work out each selected point.
        if (snapTo & SnapTo.CENTER) possibleSnapPoints.push(cell.center);
        if (snapTo & SnapTo.CORNER) possibleSnapPoints.push(...cell.corners);
        if (snapTo & SnapTo.EDGE) possibleSnapPoints.push(cell.nearestPointOnEdge(point));

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
    public measure(...points: (Cell | Vector2)[]): number {
        const cleanPoints = points.map((p) => (p instanceof Cell ? p.center : new Point(p)));

        if (this.measurement === 'EUCLIDEAN') {
            const gridPoints = cleanPoints.map((p) => p.div(this.dpi));
            let distance = 0;
            for (let i = 1; i < gridPoints.length; i++) {
                distance += gridPoints[i].distanceTo(gridPoints[i - 1]);
            }
            return distance;
        }
        if (this.measurement === 'CHEBYSHEV') return this.measureChebyshev(cleanPoints);
        if (this.measurement === 'MANHATTAN') return this.measureManhattan(cleanPoints);
        if (this.measurement === 'ALTERNATING') return this.measureAlternating(cleanPoints);

        throw new Error(`Unrecognised measurement "${this.measurement}"`);
    }

    protected abstract measureChebyshev(points: Point[]): number;

    /** Not every grid type supports this measurement, so the default is to throw. */
    protected measureManhattan(_points: Point[]): number {
        throw new Error(`"${this.type}" grids don't support MANHATTAN measurement`);
    }

    /** Not every grid type supports this measurement, so the default is to throw. */
    protected measureAlternating(_points: Point[]): number {
        throw new Error(`"${this.type}" grids don't support ALTERNATING measurement`);
    }

    /** Get whether the point is closest to the corner or the center of a cell. */
    public getNearestSnapType(point: Vector2): SnapTo {
        const cell = this.getCell(point);
        const closestPoint = this.snapTo(point, SnapTo.ALL);

        if (closestPoint.equals(cell.center)) return SnapTo.CENTER;
        else return SnapTo.CORNER;
    }

    /**
     * Returns every cell that touches the convex hull of the given cells.  This is deliberately not
     * guaranteed to be the minimal/exact set - computing that precisely is expensive and unnecessary
     * for most callers (eg. redrawing a viewport), so implementations may over-include cells near the
     * edge. If a strict/exact version is ever needed, add it separately rather than tightening this one.
     */
    public iterateCellsBoundingPoints(points: C[]): C[] {
        if (points.length === 0) return [];
        this.checkCellType(points);
        return this.iterateCells(points);
    }

    /** The per-grid-type half of `iterateCellsBoundingPoints`, called once the input is validated. */
    protected abstract iterateCells(points: C[]): C[];

    /**
     * The generic `LiveGrid.iterateCellsBoundingPoints` bridge means the compile-time cell type
     * doesn't guarantee the points actually belong to this grid's type, so we check at runtime.
     * (A different snapshot of the same type is fine, eg. the same scene after a dpi change.)
     */
    private checkCellType(points: Cell[]): void {
        for (const point of points) {
            if (point.grid.type !== this.type)
                throw new Error(`Cannot iterate cells from a "${point.grid.type}" grid on a "${this.type}" grid`);
        }
    }
}
