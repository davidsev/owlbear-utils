import type { Square } from './Square';
import type { VHex } from './VHex';
import type { HHex } from './HHex';
import type { Isometric } from './Isometric';
import type { Dimetric } from './Dimetric';

/**
 * Every concrete Cell subclass.
 *
 * Mirrors `AnyGrid` on the grid side, but unlike `AnyGrid` it isn't discriminated by a `.type` field —
 * TypeScript can't narrow `cell` via `cell.grid.type` (narrowing through a nested property doesn't
 * propagate to the outer union), so use `instanceof` instead, eg. `if (cell instanceof VHex) { ... }`.
 */
export type AnyCell = Square | VHex | HHex | Isometric | Dimetric;
