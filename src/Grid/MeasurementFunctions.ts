import { grid, Point } from '../index';
import { xy_to_axial_h, xy_to_axial_v } from './HexFunctions';
import { xy_to_uv_dimetric, xy_to_uv_isometric } from './IsometricFunctions';

export const Measure = {
    euclidean: function euclidean (points: Point[]): number {
        const gridPoints = points.map(p => p.div(grid.dpi));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            distance += gridPoints[i].distanceTo(gridPoints[i - 1]);
        }
        return distance;
    },

    chebyshevSquare: function chebyshevSquare (points: Point[]): number {
        const gridPoints = points.map(p => p.div(grid.dpi));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        }
        return distance;
    },

    chebyshevVHex: function chebyshevHex (points: Point[]): number {
        const gridPoints = points.map(p => {
            const [q, r] = xy_to_axial_v(p.x, p.y);
            return { q, r, s: -q - r };
        });
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
        }
        return distance;
    },

    chebyshevHHex: function chebyshevHex (points: Point[]): number {
        const gridPoints = points.map(p => {
            const [q, r] = xy_to_axial_h(p.x, p.y);
            return { q, r, s: -q - r };
        });
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));
        }
        return distance;
    },

    chebyshevIsometric: function chebyshevIsometric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_isometric(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return distance;
    },

    chebyshevDimetric: function chebyshevDimetric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_dimetric(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return distance;
    },

    manhattanSquare: function manhattanSquare (points: Point[]): number {
        const gridPoints = points.map(p => p.div(grid.dpi));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        }
        return distance;
    },

    manhattanIsometric: function manhattanIsometric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_isometric(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        }
        return distance;
    },

    manhattanDimetric: function manhattanDimetric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_dimetric(p.x, p.y));
        let distance = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            distance += Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        }
        return distance;
    },

    alternatingSquare: function alternatingSquare (points: Point[]): number {
        const gridPoints = points.map(p => p.div(grid.dpi));
        let big = 0;
        let small = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            big += Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
            small += Math.min(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
        }
        return big + Math.floor(small / 2);
    },

    alternatingIsometric: function alternatingIsometric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_isometric(p.x, p.y));
        let big = 0;
        let small = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            big += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
            small += Math.min(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return big + Math.floor(small / 2);
    },

    alternatingDimetric: function alternatingDimetric (points: Point[]): number {
        const gridPoints = points.map(p => xy_to_uv_dimetric(p.x, p.y));
        let big = 0;
        let small = 0;
        for (let i = 1; i < gridPoints.length; i++) {
            const a = gridPoints[i];
            const b = gridPoints[i - 1];
            big += Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
            small += Math.min(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
        }
        return big + Math.floor(small / 2);
    },
};
