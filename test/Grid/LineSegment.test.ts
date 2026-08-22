import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LineSegment } from '../../src/Grid/LineSegment';

test('throws when both points are identical', () => {
    assert.throws(() => new LineSegment({ x: 1, y: 1 }, { x: 1, y: 1 }));
});

test('normalizes direction so the smallest x comes first', () => {
    const line = new LineSegment({ x: 10, y: 0 }, { x: 0, y: 5 });
    assert.equal(line.p1.x, 0);
    assert.equal(line.p1.y, 5);
    assert.equal(line.p2.x, 10);
    assert.equal(line.p2.y, 0);
});

test('normalizes direction by smallest y when x is equal', () => {
    const line = new LineSegment({ x: 5, y: 10 }, { x: 5, y: 0 });
    assert.equal(line.p1.y, 0);
    assert.equal(line.p2.y, 10);
});

test('toString formats with the given precision', () => {
    const line = new LineSegment({ x: 0, y: 0 }, { x: 3.456, y: 7.891 });
    assert.equal(line.toString(), 'Line(0,0 -> 3,8)');
    assert.equal(line.toString(2), 'Line(0,0 -> 3.46,7.89)');
});

test('equals compares endpoints regardless of construction order', () => {
    const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 10 });
    const b = new LineSegment({ x: 10, y: 10 }, { x: 0, y: 0 });
    assert.equal(a.equals(b), true);
});

test('equals is false for different lines', () => {
    const a = new LineSegment({ x: 0, y: 0 }, { x: 10, y: 10 });
    const b = new LineSegment({ x: 0, y: 0 }, { x: 20, y: 20 });
    assert.equal(a.equals(b), false);
});

test('length is the euclidean distance between endpoints', () => {
    const line = new LineSegment({ x: 0, y: 0 }, { x: 3, y: 4 });
    assert.equal(line.length, 5);
});
