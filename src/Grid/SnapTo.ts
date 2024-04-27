export enum SnapTo {
    CORNER = 1 << 0,
    CENTER = 1 << 1,
    EDGE = 1 << 2,
    CORNER_AND_CENTER = SnapTo.CORNER | SnapTo.CENTER,
    CORNER_AND_EDGE = SnapTo.CORNER | SnapTo.EDGE,
    CENTER_AND_EDGE = SnapTo.CENTER | SnapTo.EDGE,
    CORNER_AND_CENTER_AND_EDGE = SnapTo.CORNER | SnapTo.CENTER | SnapTo.EDGE,
    ALL = -1,
}
