import { grid, Point } from '../index';
import { xy_to_axial_h, xy_to_axial_v } from '../HexFunctions';

export const Measure = {
    euclidean: function euclidean (a: Point, b: Point): number {
        const aGrid = a.div(grid.dpi);
        const bGrid = b.div(grid.dpi);
        return aGrid.distanceTo(bGrid);
    },

    chebyshevSquare: function chebyshevSquare (a: Point, b: Point): number {
        const aGrid = a.div(grid.dpi);
        const bGrid = b.div(grid.dpi);
        return Math.max(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
    },

    chebyshevVHex: function chebyshevHex (a: Point, b: Point): number {
        const [aq, ar] = xy_to_axial_v(a.x, a.y);
        const as = -aq - ar;
        const [bq, br] = xy_to_axial_v(b.x, b.y);
        const bs = -bq - br;
        return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
    },

    chebyshevHHex: function chebyshevHex (a: Point, b: Point): number {
        const [aq, ar] = xy_to_axial_h(a.x, a.y);
        const as = -aq - ar;
        const [bq, br] = xy_to_axial_h(b.x, b.y);
        const bs = -bq - br;
        return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
    },

    manhattanSquare: function manhattanSquare (a: Point, b: Point): number {
        const aGrid = a.div(grid.dpi);
        const bGrid = b.div(grid.dpi);
        return Math.abs(aGrid.x - bGrid.x) + Math.abs(aGrid.y - bGrid.y);
    },

    alternatingSquare: function alternatingSquare (a: Point, b: Point): number {
        const aGrid = a.div(grid.dpi);
        const bGrid = b.div(grid.dpi);
        const big = Math.max(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
        const small = Math.min(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
        return big + Math.floor(small / 2);
    },
};
