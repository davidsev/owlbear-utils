import type { SquareGrid } from './SquareGrid';
import type { VHexGrid } from './VHexGrid';
import type { HHexGrid } from './HHexGrid';
import type { IsometricGrid } from './IsometricGrid';
import type { DimetricGrid } from './DimetricGrid';

/**
 * Every concrete Grid subclass, as a union discriminated by `type`.
 *
 * Each subclass declares `type` as a literal, so switching on it narrows to the matching class
 * and gives you correctly typed cells with no casts:
 *
 * ```ts
 * if (grid.snapshot.type === 'HEX_VERTICAL') {
 *     const cell = grid.snapshot.getCell(point);  // a VHex, not a Cell
 * }
 * ```
 */
export type AnyGrid = SquareGrid | VHexGrid | HHexGrid | IsometricGrid | DimetricGrid;
