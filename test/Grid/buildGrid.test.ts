import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertSupportedGridType, buildGrid } from '../../src/Grid/buildGrid';
import { SquareGrid } from '../../src/Grid/SquareGrid';
import { VHexGrid } from '../../src/Grid/VHexGrid';
import { HHexGrid } from '../../src/Grid/HHexGrid';
import { IsometricGrid } from '../../src/Grid/IsometricGrid';
import { DimetricGrid } from '../../src/Grid/DimetricGrid';
import { makeGridData, makeGridScale } from '../helpers/gridData';

test('assertSupportedGridType passes for every known grid type', () => {
    for (const type of ['SQUARE', 'HEX_VERTICAL', 'HEX_HORIZONTAL', 'ISOMETRIC', 'DIMETRIC'] as const) {
        assert.doesNotThrow(() => assertSupportedGridType(type));
    }
});

test('assertSupportedGridType throws for an unknown grid type', () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the runtime guard against a grid type OBR hasn't added yet
    assert.throws(() => assertSupportedGridType('OCTAGON' as any), /not supported/);
});

const cases = [
    ['SQUARE', SquareGrid],
    ['HEX_VERTICAL', VHexGrid],
    ['HEX_HORIZONTAL', HHexGrid],
    ['ISOMETRIC', IsometricGrid],
    ['DIMETRIC', DimetricGrid],
] as const;

for (const [type, cls] of cases) {
    test(`buildGrid returns a ${cls.name} for "${type}" data`, () => {
        const grid = buildGrid(makeGridData(type), makeGridScale());
        assert.equal(grid instanceof cls, true);
        assert.equal(grid.type, type);
    });
}

test('buildGrid throws for an unsupported grid type', () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the runtime guard against a grid type OBR hasn't added yet
    assert.throws(() => buildGrid(makeGridData('OCTAGON' as any), makeGridScale()), /not supported/);
});
