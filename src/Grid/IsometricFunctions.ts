import { grid } from '../index';

const SQRT3 = Math.sqrt(3);

export function xy_to_uv_isometric (x: number, y: number): [u: number, v: number] {
    const w = grid.dpi / SQRT3 * 3;
    const h = grid.dpi;
    return [
        x / w + y / h,
        x / w - y / h,
    ];
}

export function uv_to_xy_isometric (u: number, v: number): [x: number, y: number] {
    const w = grid.dpi / SQRT3 * 3;
    const h = grid.dpi;
    return [
        (u + v) * w / 2,
        (u - v) * h / 2,
    ];
}

export function xy_to_uv_dimetric (x: number, y: number): [u: number, v: number] {
    const w = grid.dpi * 2;
    const h = grid.dpi;
    return [
        x / w + y / h,
        x / w - y / h,
    ];
}

export function uv_to_xy_dimetric (u: number, v: number): [x: number, y: number] {
    const w = grid.dpi * 2;
    const h = grid.dpi;
    return [
        (u + v) * w / 2,
        (u - v) * h / 2,
    ];
}

