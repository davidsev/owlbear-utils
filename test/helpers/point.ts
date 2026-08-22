import type { Vector2 } from '@owlbear-rodeo/sdk';

/** Strips a Point (or any Vector2) down to a plain {x, y} object, for deepEqual against a literal. */
export function xy(point: Vector2): { x: number; y: number } {
    return { x: point.x, y: point.y };
}
