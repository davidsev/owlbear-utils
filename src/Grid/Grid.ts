import { Grid as BaseGrid, GridMeasurement, GridScale, GridStyle, GridType, Vector2 } from '@owlbear-rodeo/sdk';
import { SnapTo } from './SnapTo';
import { Cell } from './Cell/Cell';
import { Square } from './Cell/Square';
import { VHex } from './Cell/VHex';
import { Point } from './Point';
import { HHex } from './Cell/HHex';
import { Measure } from './MeasurementFunctions';
import { Isometric } from './Cell/Isometric';
import { Dimetric } from './Cell/Dimetric';
import { axial_round, axial_to_xy_h, axial_to_xy_v, xy_to_axial_h, xy_to_axial_v } from './HexFunctions';
import { uv_to_xy_dimetric, uv_to_xy_isometric, xy_to_uv_dimetric, xy_to_uv_isometric } from './AxonometricFunctions';

const SQRT3 = Math.sqrt(3);

/** An immutable snapshot of a scene's grid settings, with no link to OBR. */
export class Grid implements BaseGrid {
    private readonly gridData: BaseGrid;
    private readonly scaleData: GridScale;

    constructor (gridData: BaseGrid, scaleData: GridScale) {
        this.gridData = gridData;
        this.scaleData = scaleData;
    }

    get dpi (): number {
        return this.gridData.dpi;
    }

    get hexRadius (): number {
        return this.gridData.dpi / SQRT3;
    }

    get style (): GridStyle {
        return this.gridData.style;
    }

    get type (): GridType {
        return this.gridData.type;
    }

    get measurement (): GridMeasurement {
        return this.gridData.measurement;
    }

    get scale (): string {
        return this.gridData.scale;
    }

    get gridScale (): GridScale {
        return this.scaleData;
    }

    public getCell (point: Vector2): Cell {
        if (this.type === 'SQUARE') {
            const halfDpi = { x: this.dpi / 2, y: this.dpi / 2 };
            const center = (new Point(point)).add(halfDpi).roundToNearest(this.dpi).sub(halfDpi);
            return new Square(center, this);
        }

        if (this.type === 'HEX_VERTICAL') {
            // OBR has 0,0 not in the center of a hex, so offset by half a hex
            const vec = new Point({ x: point.x, y: point.y + (this.hexRadius / 2) });
            const [q, r] = xy_to_axial_v(vec.x, vec.y, this);
            const [round_q, round_r] = axial_round(q, r);
            const [x, y] = axial_to_xy_v(round_q, round_r, this);
            return new VHex({ x, y: y - (this.hexRadius / 2) }, this);
        }

        if (this.type === 'HEX_HORIZONTAL') {
            // OBR has 0,0 not in the center of a hex, so offset by half a hex
            const vec = new Point({ x: point.x + (this.hexRadius / 2), y: point.y });
            const [q, r] = xy_to_axial_h(vec.x, vec.y, this);
            const [round_q, round_r] = axial_round(q, r);
            const [x, y] = axial_to_xy_h(round_q, round_r, this);
            return new HHex({ x: x - (this.hexRadius / 2), y }, this);
        }

        if (this.type === 'ISOMETRIC') {
            // OBR has 0,0 not in the center of a cell, so offset by a bit.
            const xOffset = this.dpi - (this.hexRadius / 4);
            const vec = new Point({ x: point.x + xOffset, y: point.y });
            const [u, v] = xy_to_uv_isometric(vec.x, vec.y, this);
            const [x, y] = uv_to_xy_isometric(Math.round(u), Math.round(v), this);
            return new Isometric({ x: x - xOffset, y }, this);
        }

        if (this.type === 'DIMETRIC') {
            // OBR has 0,0 not in the center of a cell, so offset by a bit.
            const xOffset = this.dpi;
            const vec = new Point({ x: point.x + xOffset, y: point.y });
            const [u, v] = xy_to_uv_dimetric(vec.x, vec.y, this);
            const [x, y] = uv_to_xy_dimetric(Math.round(u), Math.round(v), this);
            return new Dimetric({ x: x - xOffset, y }, this);
        }

        throw new Error(`Grid type "${this.type}" not supported`);
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
        const cleanPoints = points.map(p => p instanceof Cell ? p.center : new Point(p));

        if (this.measurement == 'EUCLIDEAN')
            return Measure.euclidean(cleanPoints, this);
        if (this.type === 'SQUARE' && this.measurement === 'CHEBYSHEV')
            return Measure.chebyshevSquare(cleanPoints, this);
        if (this.type === 'HEX_VERTICAL' && this.measurement === 'CHEBYSHEV')
            return Measure.chebyshevVHex(cleanPoints, this);
        if (this.type === 'HEX_HORIZONTAL' && this.measurement === 'CHEBYSHEV')
            return Measure.chebyshevHHex(cleanPoints, this);
        if (this.type === 'ISOMETRIC' && this.measurement === 'CHEBYSHEV')
            return Measure.chebyshevIsometric(cleanPoints, this);
        if (this.type === 'DIMETRIC' && this.measurement === 'CHEBYSHEV')
            return Measure.chebyshevDimetric(cleanPoints, this);
        if (this.type === 'SQUARE' && this.measurement === 'MANHATTAN')
            return Measure.manhattanSquare(cleanPoints, this);
        if (this.type === 'ISOMETRIC' && this.measurement === 'MANHATTAN')
            return Measure.manhattanIsometric(cleanPoints, this);
        if (this.type === 'DIMETRIC' && this.measurement === 'MANHATTAN')
            return Measure.manhattanDimetric(cleanPoints, this);
        if (this.type === 'SQUARE' && this.measurement === 'ALTERNATING')
            return Measure.alternatingSquare(cleanPoints, this);
        if (this.type === 'ISOMETRIC' && this.measurement === 'ALTERNATING')
            return Measure.alternatingIsometric(cleanPoints, this);
        if (this.type === 'DIMETRIC' && this.measurement === 'ALTERNATING')
            return Measure.alternatingDimetric(cleanPoints, this);

        return 0;
    }

    /** Get whether the point is closest to the corner or the center of a cell. */
    public getNearestSnapType (point: Vector2): SnapTo {
        const cell = this.getCell(point);
        const closestPoint = this.snapTo(point, SnapTo.ALL);

        if (closestPoint.equals(cell.center))
            return SnapTo.CENTER;
        else
            return SnapTo.CORNER;
    }

    public iterateCellsBoundingPoints<T extends (Square | VHex | HHex | Isometric | Dimetric)> (points: T[]): T[] {
        if (points.length === 0)
            return [];

        // We return cells of whatever type this grid is, but T comes from the cells passed in.
        // If those disagree the result would be a lie, so check rather than silently mis-type it.
        // (A different grid of the same type is fine, eg. the same scene after a dpi change.)
        for (const point of points) {
            if (point.grid.type !== this.type)
                throw new Error(`Cannot iterate cells from a "${point.grid.type}" grid on a "${this.type}" grid`);
        }

        if (this.type === 'SQUARE') {
            const xMin = Math.min(...points.map(point => point.center.x));
            const xMax = Math.max(...points.map(point => point.center.x));
            const yMin = Math.min(...points.map(point => point.center.y));
            const yMax = Math.max(...points.map(point => point.center.y));

            const cells: Square[] = [];
            for (let x = Math.floor(xMin); x <= Math.ceil(xMax); x += this.dpi) {
                for (let y = Math.floor(yMin); y <= Math.ceil(yMax); y += this.dpi) {
                    cells.push(this.getCell({ x, y }) as Square);
                }
            }
            return cells as T[];
        }

        if (this.type === 'HEX_VERTICAL') {
            let rMin = Infinity, rMax = -Infinity, qMin = Infinity, qMax = -Infinity;
            for (const point of points) {
                const [q, r] = xy_to_axial_v(point.center.x, point.center.y, this);
                rMin = Math.min(rMin, r);
                rMax = Math.max(rMax, r);
                qMin = Math.min(qMin, q);
                qMax = Math.max(qMax, q);
            }

            const cells: VHex[] = [];
            for (let r = Math.floor(rMin); r <= Math.ceil(rMax); r++) {
                for (let q = Math.floor(qMin); q <= Math.ceil(qMax); q++) {
                    const [x, y] = axial_to_xy_v(q, r, this);
                    cells.push(this.getCell({ x, y }) as VHex);
                }
            }
            return cells as T[];
        }

        if (this.type === 'HEX_HORIZONTAL') {
            let rMin = Infinity, rMax = -Infinity, qMin = Infinity, qMax = -Infinity;
            for (const point of points) {
                const [q, r] = xy_to_axial_h(point.center.x, point.center.y, this);
                rMin = Math.min(rMin, r);
                rMax = Math.max(rMax, r);
                qMin = Math.min(qMin, q);
                qMax = Math.max(qMax, q);
            }

            const cells: HHex[] = [];
            for (let r = Math.floor(rMin); r <= Math.ceil(rMax); r++) {
                for (let q = Math.floor(qMin); q <= Math.ceil(qMax); q++) {
                    const [x, y] = axial_to_xy_h(q, r, this);
                    cells.push(this.getCell({ x, y }) as HHex);
                }
            }
            return cells as T[];
        }

        if (this.type === 'ISOMETRIC') {
            let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
            for (const point of points) {
                const [u, v] = xy_to_uv_isometric(point.center.x, point.center.y, this);
                uMin = Math.min(uMin, u);
                uMax = Math.max(uMax, u);
                vMin = Math.min(vMin, v);
                vMax = Math.max(vMax, v);
            }

            const cells: Isometric[] = [];
            for (let u = Math.floor(uMin); u <= Math.ceil(uMax); u++) {
                for (let v = Math.floor(vMin); v <= Math.ceil(vMax); v++) {
                    const [x, y] = uv_to_xy_isometric(u, v, this);
                    cells.push(this.getCell({ x, y }) as Isometric);
                }
            }
            return cells as T[];
        }

        if (this.type === 'DIMETRIC') {
            let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
            for (const point of points) {
                const [u, v] = xy_to_uv_dimetric(point.center.x, point.center.y, this);
                uMin = Math.min(uMin, u);
                uMax = Math.max(uMax, u);
                vMin = Math.min(vMin, v);
                vMax = Math.max(vMax, v);
            }

            const cells: Dimetric[] = [];
            for (let u = Math.floor(uMin); u <= Math.ceil(uMax); u++) {
                for (let v = Math.floor(vMin); v <= Math.ceil(vMax); v++) {
                    const [x, y] = uv_to_xy_dimetric(u, v, this);
                    cells.push(this.getCell({ x, y }) as Dimetric);
                }
            }
            return cells as T[];
        }

        throw new Error(`Grid type "${this.type}" not supported`);
    }
}
