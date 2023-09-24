import { grid } from '../index';

// Mostly taken from https://www.redblobgames.com/grids/hexagons/

const SQRT3 = Math.sqrt(3);

export function xy_to_axial_v (x: number, y: number): [number, number] {
    const q = (SQRT3 / 3 * x - 1. / 3 * y) / grid.hexRadius;
    const r = (2. / 3 * y) / grid.hexRadius;
    return [q, r];
}

export function xy_to_axial_h (x: number, y: number): [number, number] {
    const q = (2. / 3 * x) / grid.hexRadius;
    const r = (-1. / 3 * x + SQRT3 / 3 * y) / grid.hexRadius;
    return [q, r];
}

export function axial_round (x: number, y: number): [number, number] {
    const rounded_x = Math.round(x);
    const rounded_y = Math.round(y);
    x -= rounded_x;
    y -= rounded_y; // remainder
    const dx = Math.round(x + 0.5 * y) * Number(x * x >= y * y);
    const dy = Math.round(y + 0.5 * x) * Number(x * x < y * y);
    return [rounded_x + dx, rounded_y + dy];
}

export function axial_to_xy_v (q: number, r: number): [number, number] {
    const x = grid.hexRadius * (SQRT3 * q + SQRT3 / 2 * r);
    const y = grid.hexRadius * (3. / 2 * r);
    return [x, y];
}

export function axial_to_xy_h (q: number, r: number): [number, number] {
    const x = grid.hexRadius * (3. / 2 * q);
    const y = grid.hexRadius * (SQRT3 / 2 * q + SQRT3 * r);
    return [x, y];
}


