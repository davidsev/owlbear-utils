import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineIntersection } from '../../src/Grid/lineIntersection';

test('finds where two crossing lines meet', () => {
    const p = lineIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
    assert.equal(p.x, 5);
    assert.equal(p.y, 5);
});

test('treats the arguments as infinite lines, not segments', () => {
    // Neither pair of points spans the crossing point at (10, 10), but the lines through them still meet there.
    const p = lineIntersection({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 20 }, { x: 1, y: 19 });
    assert.equal(p.x, 10);
    assert.equal(p.y, 10);
});

test('is independent of the order of the points within a line', () => {
    const forwards = lineIntersection({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 });
    const backwards = lineIntersection({ x: 10, y: 10 }, { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 });
    assert.equal(forwards.x, backwards.x);
    assert.equal(forwards.y, backwards.y);
});

test('gives a non-finite point for parallel lines', () => {
    const p = lineIntersection({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: 10, y: 5 });
    assert.equal(Number.isFinite(p.x), false);
    assert.equal(Number.isFinite(p.y), false);
});
