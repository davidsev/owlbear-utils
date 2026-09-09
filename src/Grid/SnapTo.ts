/**
 * Bitflag targets for `Grid.snapTo()`, which takes any combination of them ORed together.
 * `Grid.getNearestSnapType()` returns one of these rather than taking them, and only ever returns
 * `CENTER` or `CORNER`.
 */
export enum SnapTo {
    /** Snap to the nearest corner of the cell. */
    CORNER = 1 << 0,
    /** Snap to the cell's center. */
    CENTER = 1 << 1,
    /** Snap to the nearest point on a cell edge. */
    EDGE = 1 << 2,
    /** Snap to the nearest edge midpoint. */
    EDGE_MIDPOINT = 1 << 3,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.CENTER` instead. */
    CORNER_AND_CENTER = SnapTo.CORNER | SnapTo.CENTER,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.EDGE` instead. */
    CORNER_AND_EDGE = SnapTo.CORNER | SnapTo.EDGE,
    /** @deprecated Use `SnapTo.CENTER | SnapTo.EDGE` instead. */
    CENTER_AND_EDGE = SnapTo.CENTER | SnapTo.EDGE,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.CENTER | SnapTo.EDGE` instead. */
    CORNER_AND_CENTER_AND_EDGE = SnapTo.CORNER | SnapTo.CENTER | SnapTo.EDGE,
    /** Every bit set, ie. snap to whichever of corner/center/edge/edge midpoint is closest. */
    ALL = -1,
}
