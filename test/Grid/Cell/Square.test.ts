import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SquareGrid } from '../../../src/Grid/SquareGrid';
import { makeGridData, makeGridScale } from '../../helpers/gridData';

function makeGrid(dpi = 100) {
    return new SquareGrid(makeGridData('SQUARE', { dpi }), makeGridScale());
}

test('corners are dpi/2 away from the center on both axes', () => {
    const cell = makeGrid().getCell({ x: 0, y: 0 }); // center (50, 50)
    const corners = cell.corners.map((c) => ({ x: c.x, y: c.y }));
    assert.deepEqual(corners, [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
    ]);
});

test('edges connect consecutive corners and have length dpi', () => {
    const cell = makeGrid().getCell({ x: 0, y: 0 });
    const edges = cell.edges;
    assert.equal(edges.length, 4);
    for (const edge of edges) {
        assert.equal(edge.length, 100);
    }
});

test('toString includes the center', () => {
    const cell = makeGrid().getCell({ x: 0, y: 0 });
    assert.equal(cell.toString(), 'Square(50, 50)');
});

test('nearestPointOnEdge finds the closest point on the cell boundary', () => {
    const cell = makeGrid().getCell({ x: 0, y: 0 }); // center (50, 50), bounds [0,100]
    const nearest = cell.nearestPointOnEdge({ x: 50, y: 5 });
    assert.equal(nearest.x, 50);
    assert.equal(nearest.y, 0);
});

test('isAdjacent is true only for orthogonal neighbors', () => {
    const grid = makeGrid();
    const center = grid.getCell({ x: 50, y: 50 });
    const right = grid.getCell({ x: 150, y: 50 });
    const diagonal = grid.getCell({ x: 150, y: 150 });
    assert.equal(center.isAdjacent(right), true);
    assert.equal(center.isAdjacent(diagonal), false);
});

test('containsPoint is inclusive on the min edge and exclusive on the max edge', () => {
    const cell = makeGrid().getCell({ x: 0, y: 0 }); // bounds [0,100)
    assert.equal(cell.containsPoint({ x: 0, y: 0 }), true);
    assert.equal(cell.containsPoint({ x: 99.9, y: 99.9 }), true);
    assert.equal(cell.containsPoint({ x: 100, y: 0 }), false);
});

test('neighbors excludes diagonals unless include_corners is true', () => {
    const cell = makeGrid().getCell({ x: 50, y: 50 });
    assert.equal(cell.neighbors(false).length, 4);
    assert.equal(cell.neighbors(true).length, 8);
});

test('every neighbor is adjacent to the origin cell', () => {
    const cell = makeGrid().getCell({ x: 50, y: 50 });
    for (const neighbor of cell.neighbors(false)) {
        assert.equal(cell.isAdjacent(neighbor), true);
    }
});
