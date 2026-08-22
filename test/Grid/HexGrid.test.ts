import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VHexGrid } from '../../src/Grid/VHexGrid';
import { HHexGrid } from '../../src/Grid/HHexGrid';
import { VHex } from '../../src/Grid/Cell/VHex';
import { HHex } from '../../src/Grid/Cell/HHex';
import { makeGridData, makeGridScale } from '../helpers/gridData';
import { xy } from '../helpers/point';

const orientations = [
    { name: 'VHexGrid', type: 'HEX_VERTICAL', Grid: VHexGrid, Cell: VHex },
    { name: 'HHexGrid', type: 'HEX_HORIZONTAL', Grid: HHexGrid, Cell: HHex },
] as const;

const CORNER_OFFSETS: Record<string, (dpi: number, hexRadius: number) => { x: number; y: number }[]> = {
    HEX_VERTICAL: (dpi, r) => [
        { x: 0, y: -r },
        { x: dpi / 2, y: -r / 2 },
        { x: dpi / 2, y: r / 2 },
        { x: 0, y: r },
        { x: -dpi / 2, y: r / 2 },
        { x: -dpi / 2, y: -r / 2 },
    ],
    HEX_HORIZONTAL: (dpi, r) => [
        { x: -r, y: 0 },
        { x: -r / 2, y: dpi / 2 },
        { x: r / 2, y: dpi / 2 },
        { x: r, y: 0 },
        { x: r / 2, y: -dpi / 2 },
        { x: -r / 2, y: -dpi / 2 },
    ],
};

for (const { name, type, Grid, Cell } of orientations) {
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

    test(`${name}: fromAxial round-trips through xy_to_axial`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = Cell.fromAxial(2, -1, grid as never);
        const [q, r] = grid.xy_to_axial(cell.center.x, cell.center.y);
        assert.equal(Math.round(q), 2);
        assert.equal(Math.round(r), -1);
    });

    test(`${name}: neighbors are adjacent to the origin cell and land on real cell centers`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const neighbors = cell.neighbors(false);
        assert.equal(neighbors.length, 6);
        for (const neighbor of neighbors) {
            assert.equal(cell.isAdjacent(neighbor), true);
            assert.equal(grid.getCell(neighbor.center).center.equals(neighbor.center), true);
        }
    });

    test(`${name}: corners match the orientation's hex geometry`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const cell = grid.getCell({ x: 0, y: 0 });
        const expected = CORNER_OFFSETS[type](grid.dpi, grid.hexRadius).map((o) => ({
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

    test(`${name}: iterateCellsBoundingPoints covers every (q, r) pair in the bounding box exactly once`, () => {
        const grid = new Grid(makeGridData(type), makeGridScale());
        const a = Cell.fromAxial(0, 0, grid as never);
        const b = Cell.fromAxial(2, 1, grid as never);
        const cells = grid.iterateCellsBoundingPoints([a, b] as never);

        for (const cell of cells) {
            assert.equal(grid.getCell(cell.center).center.equals(cell.center), true);
        }

        const axial = cells.map((c) => grid.xy_to_axial(c.center.x, c.center.y).map(Math.round));
        const qs = new Set(axial.map(([q]) => q));
        const rs = new Set(axial.map(([, r]) => r));

        for (const q of qs) {
            for (const r of rs) {
                assert.equal(axial.filter(([aq, ar]) => aq === q && ar === r).length, 1);
            }
        }

        // fromAxial's centers carry the same "OBR origin isn't a cell center" offset getCell corrects
        // for, so re-deriving q/r from those centers doesn't land back on exact integers: (0, 0) reads
        // back as roughly (0.17, -0.33) here.  iterateCells floors/ceils that, padding the box by one
        // cell on each axis, so the (0,0)-(2,1) request comes back as a 4x3 box, not the requested 3x2.
        assert.equal(qs.size, 4);
        assert.equal(rs.size, 3);
        assert.equal(cells.length, 12);
        assert.ok(qs.has(0) && qs.has(2));
        assert.ok(rs.has(0) && rs.has(1));
    });

    test(`${name}: measureChebyshev is the axial distance between cells`, () => {
        const grid = new Grid(makeGridData(type, { measurement: 'CHEBYSHEV' }), makeGridScale());
        const a = Cell.fromAxial(0, 0, grid as never);
        const b = Cell.fromAxial(2, -1, grid as never);
        assert.ok(Math.abs(grid.measure(a, b) - 2) < 1e-9);
    });

    test(`${name}: MANHATTAN and ALTERNATING measurements are not supported`, () => {
        const manhattan = new Grid(makeGridData(type, { measurement: 'MANHATTAN' }), makeGridScale());
        const alternating = new Grid(makeGridData(type, { measurement: 'ALTERNATING' }), makeGridScale());
        assert.throws(() => manhattan.measure({ x: 0, y: 0 }, { x: 100, y: 100 }), /don't support MANHATTAN/);
        assert.throws(() => alternating.measure({ x: 0, y: 0 }, { x: 100, y: 100 }), /don't support ALTERNATING/);
    });
}
