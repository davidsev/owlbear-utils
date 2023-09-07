import { Cell, grid } from '../index';
import { xy_to_axial_h, xy_to_axial_v } from '../HexFunctions';

export const Measure = {
    euclidean: function euclidean (a: Cell, b: Cell): number {
        const aGrid = a.center.div(grid.dpi);
        const bGrid = b.center.div(grid.dpi);
        return aGrid.distanceTo(bGrid);
    },

    chebyshevSquare: function chebyshevSquare (a: Cell, b: Cell): number {
        const aGrid = a.center.div(grid.dpi);
        const bGrid = b.center.div(grid.dpi);
        return Math.max(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
    },

    chebyshevVHex: function chebyshevHex (a: Cell, b: Cell): number {
        const [aq, ar] = xy_to_axial_v(a.center.x, a.center.y);
        const as = -aq - ar;
        const [bq, br] = xy_to_axial_v(b.center.x, b.center.y);
        const bs = -bq - br;
        return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
    },

    chebyshevHHex: function chebyshevHex (a: Cell, b: Cell): number {
        const [aq, ar] = xy_to_axial_h(a.center.x, a.center.y);
        const as = -aq - ar;
        const [bq, br] = xy_to_axial_h(b.center.x, b.center.y);
        const bs = -bq - br;
        return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
    },

    manhattanSquare: function manhattanSquare (a: Cell, b: Cell): number {
        const aGrid = a.center.div(grid.dpi);
        const bGrid = b.center.div(grid.dpi);
        return Math.abs(aGrid.x - bGrid.x) + Math.abs(aGrid.y - bGrid.y);
    },

    alternatingSquare: function alternatingSquare (a: Cell, b: Cell): number {
        const aGrid = a.center.div(grid.dpi);
        const bGrid = b.center.div(grid.dpi);
        const big = Math.max(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
        const small = Math.min(Math.abs(aGrid.x - bGrid.x), Math.abs(aGrid.y - bGrid.y));
        return big + Math.floor(small / 2);
    },
};
