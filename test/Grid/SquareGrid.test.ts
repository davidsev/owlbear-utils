import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SquareGrid } from '../../src/Grid/SquareGrid';
import { VHexGrid } from '../../src/Grid/VHexGrid';
import { makeGridData, makeGridScale } from '../helpers/gridData';
import { xy } from '../helpers/point';

function makeGrid(measurement?: 'CHEBYSHEV' | 'MANHATTAN' | 'ALTERNATING' | 'EUCLIDEAN') {
    return new SquareGrid(makeGridData('SQUARE', { dpi: 100, measurement }), makeGridScale());
}

test('type is SQUARE', () => {
    assert.equal(makeGrid().type, 'SQUARE');
});

test('getCell snaps a point to the enclosing cell center', () => {
    const grid = makeGrid();
    assert.deepEqual(xy(grid.getCell({ x: 0, y: 0 }).center), { x: 50, y: 50 });
    assert.deepEqual(xy(grid.getCell({ x: 99, y: 1 }).center), { x: 50, y: 50 });
    assert.deepEqual(xy(grid.getCell({ x: 100, y: 100 }).center), { x: 150, y: 150 });
});

test('getCell is idempotent on an existing cell center', () => {
    const grid = makeGrid();
    const cell = grid.getCell({ x: 234, y: -178 });
    assert.deepEqual(xy(grid.getCell(cell.center).center), xy(cell.center));
});

test('iterateCellsBoundingPoints returns [] for no input', () => {
    assert.deepEqual(makeGrid().iterateCellsBoundingPoints([]), []);
});

test('iterateCellsBoundingPoints covers the bounding box of the given cells', () => {
    const grid = makeGrid();
    const a = grid.getCell({ x: 0, y: 0 }); // center (50, 50)
    const b = grid.getCell({ x: 250, y: 150 }); // center (250, 150)
    const cells = grid.iterateCellsBoundingPoints([a, b]);

    // 3 cells wide (50, 150, 250) x 2 cells tall (50, 150) = 6
    assert.equal(cells.length, 6);
    assert.equal(
        cells.some((c) => c.center.x === 150 && c.center.y === 150),
        true,
    );
});

test('iterateCellsBoundingPoints throws when a cell belongs to a different grid type', () => {
    const square = makeGrid();
    const hex = new VHexGrid(makeGridData('HEX_VERTICAL'), makeGridScale());
    const hexCell = hex.getCell({ x: 0, y: 0 });
    // biome-ignore lint/suspicious/noExplicitAny: passing a cell from another grid type purely to exercise the runtime guard
    assert.throws(() => square.iterateCellsBoundingPoints([hexCell as any]));
});

test('measureChebyshev is the largest single-axis distance in grid cells', () => {
    const grid = makeGrid('CHEBYSHEV');
    const distance = grid.measure({ x: 50, y: 50 }, { x: 350, y: 450 });
    assert.equal(distance, 4);
});

test('measureManhattan sums both axis distances in grid cells', () => {
    const grid = makeGrid('MANHATTAN');
    const distance = grid.measure({ x: 50, y: 50 }, { x: 350, y: 450 });
    assert.equal(distance, 7);
});

test('measureAlternating adds the long axis plus half the short axis, rounded down', () => {
    const grid = makeGrid('ALTERNATING');
    const distance = grid.measure({ x: 50, y: 50 }, { x: 350, y: 450 });
    assert.equal(distance, 5);
});

test('measure EUCLIDEAN measures straight-line distance in grid cells', () => {
    const grid = makeGrid('EUCLIDEAN');
    const distance = grid.measure({ x: 0, y: 0 }, { x: 300, y: 400 });
    assert.equal(distance, 5);
});

test('measure sums distances across more than two points', () => {
    const grid = makeGrid('CHEBYSHEV');
    const distance = grid.measure({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 200 });
    assert.equal(distance, 3);
});
