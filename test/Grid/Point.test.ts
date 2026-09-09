import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Point } from '../../src/Grid/Point';

test('constructs from a Vector2-like object', () => {
    const p = new Point({ x: 1, y: 2 });
    assert.equal(p.x, 1);
    assert.equal(p.y, 2);
});

test('constructs from x, y numbers', () => {
    const p = new Point(3, 4);
    assert.equal(p.x, 3);
    assert.equal(p.y, 4);
});

test('cleans -0 to 0', () => {
    const p = new Point(-0, -0.0000000001);
    assert.equal(Object.is(p.x, 0), true);
    assert.equal(Object.is(p.y, 0), true);
});

test('throws on invalid arguments', () => {
    // biome-ignore lint/suspicious/noExplicitAny: exercising the runtime guard against bad call shapes
    assert.throws(() => new (Point as any)('a', 'b'));
    // biome-ignore lint/suspicious/noExplicitAny: exercising the runtime guard against bad call shapes
    assert.throws(() => new (Point as any)(1, 2, 3));
});

test('nearestPoint returns the closest of a list', () => {
    const nearest = Point.nearestPoint({ x: 0, y: 0 }, [
        { x: 10, y: 10 },
        { x: 1, y: 1 },
        { x: 5, y: 5 },
    ]);
    assert.equal(nearest.x, 1);
    assert.equal(nearest.y, 1);
});

test('nearestPoint throws on an empty list', () => {
    assert.throws(() => Point.nearestPoint({ x: 0, y: 0 }, []));
});

test('sub subtracts', () => {
    const p = new Point(5, 5).sub({ x: 2, y: 1 });
    assert.equal(p.x, 3);
    assert.equal(p.y, 4);
});

test('add adds', () => {
    const p = new Point(5, 5).add({ x: 2, y: 1 });
    assert.equal(p.x, 7);
    assert.equal(p.y, 6);
});

test('scale and mult both multiply', () => {
    assert.deepEqual(new Point(2, 3).scale(2), new Point(4, 6));
    assert.deepEqual(new Point(2, 3).mult(2), new Point(4, 6));
});

test('div divides', () => {
    const p = new Point(10, 4).div(2);
    assert.equal(p.x, 5);
    assert.equal(p.y, 2);
});

test('roundToNearest with a single number', () => {
    const p = new Point(12, 38).roundToNearest(10);
    assert.equal(p.x, 10);
    assert.equal(p.y, 40);
});

test('roundToNearest with a Vector2', () => {
    const p = new Point(12, 38).roundToNearest({ x: 10, y: 5 });
    assert.equal(p.x, 10);
    assert.equal(p.y, 40);
});

test('roundUpToNearest always rounds away from zero towards +infinity', () => {
    const p = new Point(11, -11).roundUpToNearest(10);
    assert.equal(p.x, 20);
    assert.equal(p.y, -10);
});

test('roundDownToNearest always rounds towards -infinity', () => {
    const p = new Point(19, -1).roundDownToNearest(10);
    assert.equal(p.x, 10);
    assert.equal(p.y, -10);
});

test('distanceTo computes euclidean distance', () => {
    const distance = new Point(0, 0).distanceTo({ x: 3, y: 4 });
    assert.equal(distance, 5);
});

test('equals is true within a 1 unit tolerance', () => {
    const p = new Point(10, 10);
    assert.equal(p.equals({ x: 10.5, y: 9.5 }), true);
    assert.equal(p.equals({ x: 11, y: 10 }), false);
});

test('toString formats to integer coordinates', () => {
    assert.equal(new Point(1.6, 2.4).toString(), '(2, 2)');
});

test('magnitude computes the vector length', () => {
    assert.equal(new Point(3, 4).magnitude, 5);
});

test('normalise scales to a unit vector', () => {
    const p = new Point(3, 4).normalise();
    assert.equal(p.magnitude, 1);
    assert.equal(p.x, 0.6);
    assert.equal(p.y, 0.8);
});

test('normalise throws on a zero-length vector', () => {
    assert.throws(() => new Point(0, 0).normalise());
});

test('perpendicular rotates 90deg left, keeping magnitude', () => {
    const p = new Point(3, 4).perpendicular();
    assert.equal(p.x, 4);
    assert.equal(p.y, -3);
    assert.equal(p.magnitude, 5);
});
