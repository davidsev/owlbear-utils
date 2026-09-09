import { Point } from './Point';
import type { Vector2 } from '@owlbear-rodeo/sdk';

/**
 * Where the line through p1 and p2 crosses the line through p3 and p4.
 * (https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)
 *
 * These are infinite lines rather than segments, so the result needn't lie between the points given.  Parallel lines
 * (or a pair given as two identical points) have no intersection, and yield a non-finite point rather than throwing -
 * callers that can hit that case have to rule it out themselves.
 */
export function lineIntersection(p1: Vector2, p2: Vector2, p3: Vector2, p4: Vector2): Point {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const x3 = p3.x;
    const y3 = p3.y;
    const x4 = p4.x;
    const y4 = p4.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const line1 = x1 * y2 - y1 * x2;
    const line2 = x3 * y4 - y3 * x4;

    return new Point({
        x: (line1 * (x3 - x4) - (x1 - x2) * line2) / denominator,
        y: (line1 * (y3 - y4) - (y1 - y2) * line2) / denominator,
    });
}
