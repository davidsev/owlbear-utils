export enum SnapTo {
    CORNER = 1 << 0,
    CENTER = 1 << 1,
    EDGE = 1 << 2,
    EDGE_MIDPOINT = 1 << 3,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.CENTER` instead. */
    CORNER_AND_CENTER = SnapTo.CORNER | SnapTo.CENTER,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.EDGE` instead. */
    CORNER_AND_EDGE = SnapTo.CORNER | SnapTo.EDGE,
    /** @deprecated Use `SnapTo.CENTER | SnapTo.EDGE` instead. */
    CENTER_AND_EDGE = SnapTo.CENTER | SnapTo.EDGE,
    /** @deprecated Use `SnapTo.CORNER | SnapTo.CENTER | SnapTo.EDGE` instead. */
    CORNER_AND_CENTER_AND_EDGE = SnapTo.CORNER | SnapTo.CENTER | SnapTo.EDGE,
    ALL = -1,
}
