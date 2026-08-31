import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IsometricGrid } from '../../src/Grid/IsometricGrid';
import { DimetricGrid } from '../../src/Grid/DimetricGrid';
import { SQRT3 } from '../../src/Grid/constants';
import { makeGridData, makeGridScale } from '../helpers/gridData';
import { xy } from '../helpers/point';

const orientations = [
    { name: 'IsometricGrid', type: 'ISOMETRIC', Grid: IsometricGrid },
    { name: 'DimetricGrid', type: 'DIMETRIC', Grid: DimetricGrid },
] as const;

// getCell(uv_to_xy(0, 0))'s expected (u, v): both grids' input-offset math lands just off an
// integer tie and rounds back to (0, 0).
const EXPECTED_ORIGIN_UV: Record<string, [number, number]> = {
    ISOMETRIC: [0, 0],
    DIMETRIC: [0, 0],
};

const CORNER_OFFSETS: Record<string, (dpi: number) => { x: number; y: number }[]> = {
    ISOMETRIC: (dpi) => [
        { x: 0, y: -dpi / 2 },
        { x: (dpi / SQRT3) * 1.5, y: 0 },
        { x: 0, y: dpi / 2 },
        { x: (-dpi / SQRT3) * 1.5, y: 0 },
    ],
    DIMETRIC: (dpi) => [
        { x: 0, y: -dpi / 2 },
        { x: dpi, y: 0 },
        { x: 0, y: dpi / 2 },
        { x: -dpi, y: 0 },
    ],
};

for (const { name, type, Grid } of orientations) {
    test(`${name}: type is "${type}"`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        assert.equal(grid.type, type);
    });

    test(`${name}: getCell is idempotent on an already-snapped center`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const points = [
            { x: 0, y: 0 },
            { x: 237, y: -118 },
            { x: -412, y: 350 },
        ];
        for (const point of points) {
            const cell = grid.getCell(point);
            const resnapped = grid.getCell(cell.center);
            assert.equal(resnapped.center.equals(cell.center), true);
        }
    });

    test(`${name}: uv_to_xy and xy_to_uv round-trip`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const [x, y] = grid.uv_to_xy(3, -2);
        const [u, v] = grid.xy_to_uv(x, y);
        assert.equal(Math.round(u), 3);
        assert.equal(Math.round(v), -2);
    });

    test(`${name}: neighbors are adjacent to the origin cell and land on real cell centers`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const sides = cell.neighbors(false);
        const withCorners = cell.neighbors(true);
        assert.equal(sides.length, 4);
        assert.equal(withCorners.length, 8);
        for (const neighbor of sides) {
            assert.equal(cell.isAdjacent(neighbor), true);
            assert.equal(grid.getCell(neighbor.center).center.equals(neighbor.center), true);
        }
    });

    test(`${name}: corners match the orientation's geometry`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const expected = CORNER_OFFSETS[type](grid.dpi).map((o) => ({
            x: cell.center.x + o.x,
            y: cell.center.y + o.y,
        }));
        assert.deepEqual(cell.corners.map(xy), expected);
    });

    test(`${name}: nearestPointOnEdge returns a point already sitting on an edge unchanged`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const [c0, c1] = cell.corners;
        const midpoint = { x: (c0.x + c1.x) / 2, y: (c0.y + c1.y) / 2 };
        const nearest = cell.nearestPointOnEdge(midpoint);
        assert.ok(Math.abs(nearest.x - midpoint.x) < 1e-6);
        assert.ok(Math.abs(nearest.y - midpoint.y) < 1e-6);
    });

    test(`${name}: edgeMidpoints are the midpoints of each pair of adjacent corners`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const corners = cell.corners;
        const midpoints = cell.edgeMidpoints;
        assert.equal(midpoints.length, corners.length);
        corners.forEach((c0, i) => {
            const c1 = corners[(i + 1) % corners.length];
            assert.ok(Math.abs(midpoints[i].x - (c0.x + c1.x) / 2) < 1e-6, `midpoint ${i} x was ${midpoints[i].x}`);
            assert.ok(Math.abs(midpoints[i].y - (c0.y + c1.y) / 2) < 1e-6, `midpoint ${i} y was ${midpoints[i].y}`);
        });
    });

    test(`${name}: iterateCellsBoundingPoints covers every (u, v) pair in the bounding box exactly once`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const [x0, y0] = grid.uv_to_xy(0, 0);
        const [x1, y1] = grid.uv_to_xy(2, 1);
        const a = grid.getCell({ x: x0, y: y0 });
        const b = grid.getCell({ x: x1, y: y1 });
        const cells = grid.iterateCellsBoundingPoints([a, b] as never);

        for (const cell of cells) {
            assert.equal(grid.getCell(cell.center).center.equals(cell.center), true);
        }

        const uv = cells.map((c) => grid.xy_to_uv(c.center.x, c.center.y).map(Math.round));
        const us = new Set(uv.map(([u]) => u));
        const vs = new Set(uv.map(([, v]) => v));

        for (const u of us) {
            for (const v of vs) {
                assert.equal(uv.filter(([au, av]) => au === u && av === v).length, 1);
            }
        }

        // getCell's input offset means re-deriving u/v from the snapped centers doesn't land back on
        // exact integers, so iterateCells' floor/ceil pads the requested (0,0)-(2,1) box by one cell
        // on each axis: a 4x3 box (12 cells), not the requested 3x2.
        assert.equal(us.size, 4);
        assert.equal(vs.size, 3);
        assert.equal(cells.length, 12);

        const [uA, vA] = EXPECTED_ORIGIN_UV[type];
        assert.ok(us.has(uA) && us.has(uA + 2));
        assert.ok(vs.has(vA) && vs.has(vA + 1));
    });

    test(`${name}: measurements are computed in u/v space, like a square grid`, () => {
        const [chebyshevGrid, manhattanGrid, alternatingGrid] = [
            new Grid(makeGridData(type, { measurement: 'CHEBYSHEV' }), makeGridScale()),
            new Grid(makeGridData(type, { measurement: 'MANHATTAN' }), makeGridScale()),
            new Grid(makeGridData(type, { measurement: 'ALTERNATING' }), makeGridScale()),
        ];
        const a = chebyshevGrid.uv_to_xy(0, 0);
        const b = chebyshevGrid.uv_to_xy(3, -2);
        const pointA = { x: a[0], y: a[1] };
        const pointB = { x: b[0], y: b[1] };

        assert.equal(chebyshevGrid.measure(pointA, pointB), 3);
        assert.equal(manhattanGrid.measure(pointA, pointB), 5);
        assert.equal(alternatingGrid.measure(pointA, pointB), 4);
    });

    test(`${name}: a point exactly on a cell boundary rounds towards positive, matching SquareGrid's round-half-up convention`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const eps = 1e-6;
        const onBoundary = grid.getCell({ x: 0, y: 0 });
        const justBelow = grid.getCell({ x: -eps, y: 0 });
        const justAbove = grid.getCell({ x: eps, y: 0 });
        assert.equal(onBoundary.center.equals(justAbove.center), true);
        assert.equal(onBoundary.center.equals(justBelow.center), false);
    });
}
