import { Cell } from './Cell';
import { Vector2 } from '@owlbear-rodeo/sdk';
import { Point } from '../Point';

export abstract class BaseAxonometric extends Cell {

    public readonly center: Point;

    constructor (center: Vector2) {
        super();
        this.center = new Point(center);
    }

    public nearestPointOnEdge (point: Vector2): Point {
        const nearestCorner = Point.nearestPoint(point, this.corners);
        const neighboringCorners = this.corners.filter((corner) => {
            return corner.x != nearestCorner.x && corner.y != nearestCorner.y;
        });
        const secondNearestCorner = Point.nearestPoint(point, neighboringCorners);

        // Line 1 is nearestCorner to nextNearestCorner
        const x1 = nearestCorner.x;
        const y1 = nearestCorner.y;
        const x2 = secondNearestCorner.x;
        const y2 = secondNearestCorner.y;

        // Line 2 is the tangent to the line that goes through the point.
        // EG move nearestCorner to 0,0, rotate 90deg, then move to Point
        const x3 = point.x;
        const y3 = point.y;
        const normalisedEndPoint = secondNearestCorner.sub(nearestCorner);
        const rotated = new Point({ x: normalisedEndPoint.y, y: -normalisedEndPoint.x });
        const movedEndPoint = rotated.add(point);
        const x4 = movedEndPoint.x;
        const y4 = movedEndPoint.y;

        // Find where they intersect.  (https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)
        return new Point({
            x: ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
            y: ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
        });
    }

    abstract get axonometricCoords (): [u: number, v: number];
}
