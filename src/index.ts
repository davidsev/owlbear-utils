import OBR from '@owlbear-rodeo/sdk';
import { LiveGrid } from './Grid/LiveGrid';

export { Point } from './Grid/Point';
export { LineSegment } from './Grid/LineSegment';
export { Cell } from './Grid/Cell/Cell';
export { Square } from './Grid/Cell/Square';
export { BaseHex } from './Grid/Cell/BaseHex';
export { VHex } from './Grid/Cell/VHex';
export { HHex } from './Grid/Cell/HHex';
export { BaseAxonometric } from './Grid/Cell/BaseAxonometric';
export { Isometric } from './Grid/Cell/Isometric';
export { Dimetric } from './Grid/Cell/Dimetric';
export { SnapTo } from './Grid/SnapTo';
export { Grid } from './Grid/Grid';
export { SquareGrid } from './Grid/SquareGrid';
export { BaseHexGrid } from './Grid/BaseHexGrid';
export { VHexGrid } from './Grid/VHexGrid';
export { HHexGrid } from './Grid/HHexGrid';
export { BaseAxonometricGrid } from './Grid/BaseAxonometricGrid';
export { IsometricGrid } from './Grid/IsometricGrid';
export { DimetricGrid } from './Grid/DimetricGrid';
export type { AnyGrid } from './Grid/AnyGrid';
export { buildGrid, assertSupportedGridType } from './Grid/buildGrid';
export { LiveGrid } from './Grid/LiveGrid';
export { ToolMetadataMapper } from './Metadata/Tool';
export { RoomMetadataMapper } from './Metadata/Room';
export { ItemMetadataMapper } from './Metadata/Item';
export { SceneMetadataMapper } from './Metadata/Scene';
export { PlayerMetadataMapper } from './Metadata/Player';
export { CachedPlayerMetadata } from './Metadata/Cached/Player';
export { CachedRoomMetadata } from './Metadata/Cached/Room';
export { CachedSceneMetadata } from './Metadata/Cached/Scene';
export { awaitReady } from './awaitReady';
export { awaitScene } from './awaitScene';

export const grid = new LiveGrid();

OBR.onReady(() => {
    grid.init();
});
