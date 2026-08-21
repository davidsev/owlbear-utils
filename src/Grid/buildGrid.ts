import type { Grid as BaseGrid, GridScale, GridType } from '@owlbear-rodeo/sdk';
import type { AnyGrid } from './AnyGrid';
import { SquareGrid } from './SquareGrid';
import { VHexGrid } from './VHexGrid';
import { HHexGrid } from './HHexGrid';
import { IsometricGrid } from './IsometricGrid';
import { DimetricGrid } from './DimetricGrid';

/** The grid types we have a Grid subclass for.  This is every type OBR currently has. */
const SUPPORTED_GRID_TYPES: readonly string[] = ['SQUARE', 'HEX_VERTICAL', 'HEX_HORIZONTAL', 'ISOMETRIC', 'DIMETRIC'];

/**
 * Throws unless we can build a Grid for this type.
 *
 * Split out from `buildGrid` so callers can fail fast, before doing any async work whose error
 * handling would otherwise bury the real cause.  If OBR ever adds a grid type we don't know
 * about, we want a loud error rather than a half-working grid.
 */
export function assertSupportedGridType(type: GridType): void {
    if (!SUPPORTED_GRID_TYPES.includes(type)) throw new Error(`Grid type "${type}" not supported`);
}

/** Builds the concrete Grid subclass matching the given grid data's type. */
export function buildGrid(gridData: BaseGrid, scaleData: GridScale): AnyGrid {
    assertSupportedGridType(gridData.type);

    if (gridData.type === 'SQUARE') return new SquareGrid(gridData, scaleData);
    if (gridData.type === 'HEX_VERTICAL') return new VHexGrid(gridData, scaleData);
    if (gridData.type === 'HEX_HORIZONTAL') return new HHexGrid(gridData, scaleData);
    if (gridData.type === 'ISOMETRIC') return new IsometricGrid(gridData, scaleData);
    if (gridData.type === 'DIMETRIC') return new DimetricGrid(gridData, scaleData);

    // Unreachable, since assertSupportedGridType() has already checked the type.
    throw new Error(`Grid type "${gridData.type}" not supported`);
}
