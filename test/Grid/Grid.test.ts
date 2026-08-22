import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SquareGrid } from '../../src/Grid/SquareGrid';
import { VHexGrid } from '../../src/Grid/VHexGrid';
import { SnapTo } from '../../src/Grid/SnapTo';
import { makeGridData, makeGridScale } from '../helpers/gridData';
import { xy } from '../helpers/point';

function makeGrid(measurement?: 'CHEBYSHEV' | 'MANHATTAN' | 'ALTERNATING' | 'EUCLIDEAN') {
    return new SquareGrid(makeGridData('SQUARE', { dpi: 100, measurement }), makeGridScale());
}

test('constructor throws when grid data type does not match the subclass', () => {
    assert.throws(() => new SquareGrid(makeGridData('HEX_VERTICAL'), makeGridScale()), /Cannot create a "SQUARE" grid/);
});

test('exposes dpi, style, measurement, scale and gridScale from the underlying data', () => {
    const gridData = makeGridData('SQUARE', { dpi: 100, measurement: 'CHEBYSHEV' });
    const gridScale = makeGridScale();
    const grid = new SquareGrid(gridData, gridScale);
    assert.equal(grid.dpi, 100);
    assert.equal(grid.style, gridData.style);
    assert.equal(grid.measurement, 'CHEBYSHEV');
    assert.equal(grid.scale, '5ft');
    assert.equal(grid.gridScale, gridScale);
});

test('snapTo CENTER returns the cell center', () => {
    const grid = makeGrid();
    const snapped = grid.snapTo({ x: 20, y: 20 }, SnapTo.CENTER);
    assert.deepEqual(xy(snapped), { x: 50, y: 50 });
});

test('snapTo CORNER returns the nearest corner', () => {
    const grid = makeGrid();
    const snapped = grid.snapTo({ x: 5, y: 5 }, SnapTo.CORNER);
    assert.deepEqual(xy(snapped), { x: 0, y: 0 });
});

test('snapTo with no flags returns the original point', () => {
    const grid = makeGrid();
    const snapped = grid.snapTo({ x: 12, y: 34 }, 0 as SnapTo);
    assert.deepEqual(xy(snapped), { x: 12, y: 34 });
});

test('snapTo ALL picks the single nearest candidate among center, corners and edge', () => {
    const grid = makeGrid();
    // Point close to the top edge midpoint of the (50, 50) cell.
    const snapped = grid.snapTo({ x: 50, y: 3 }, SnapTo.ALL);
    assert.deepEqual(xy(snapped), { x: 50, y: 0 });
});

test('getNearestSnapType reports CENTER near the middle of a cell', () => {
    const grid = makeGrid();
    assert.equal(grid.getNearestSnapType({ x: 55, y: 55 }), SnapTo.CENTER);
});

test('getNearestSnapType reports CORNER near a cell corner', () => {
    const grid = makeGrid();
    assert.equal(grid.getNearestSnapType({ x: 2, y: 2 }), SnapTo.CORNER);
});

test('measure throws for an unrecognised measurement', () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the fallback branch for a measurement OBR hasn't added yet
    const grid = makeGrid('UNKNOWN' as any);
    assert.throws(() => grid.measure({ x: 0, y: 0 }, { x: 300, y: 400 }), /Unrecognised measurement/);
});

test('iterateCellsBoundingPoints throws crossing a different grid type of the same shape', () => {
    const square = makeGrid();
    const hex = new VHexGrid(makeGridData('HEX_VERTICAL'), makeGridScale());
    const hexCell = hex.getCell({ x: 0, y: 0 });
    // biome-ignore lint/suspicious/noExplicitAny: passing a cell from another grid type purely to exercise the runtime guard
    assert.throws(() => square.iterateCellsBoundingPoints([hexCell as any]), /Cannot iterate cells/);
});

test('iterateCellsBoundingPoints accepts cells from a different snapshot of the same grid type, eg. after a dpi change', () => {
    const gridA = makeGrid();
    const gridB = new SquareGrid(makeGridData('SQUARE', { dpi: 200 }), makeGridScale());
    const cell = gridA.getCell({ x: 0, y: 0 });
    assert.doesNotThrow(() => gridB.iterateCellsBoundingPoints([cell]));
});
