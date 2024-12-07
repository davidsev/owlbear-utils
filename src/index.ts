import OBR from '@owlbear-rodeo/sdk';
import { Grid } from './Grid';

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
export { Grid };
export { ToolMetadataMapper } from './Metadata/Tool';
export { RoomMetadataMapper } from './Metadata/Room';
export { ItemMetadataMapper } from './Metadata/Item';
export { SceneMetadataMapper } from './Metadata/Scene';
export { PlayerMetadataMapper } from './Metadata/Player';
export { CachedPlayerMetadata } from './Metadata/Cached/Player';
export { CachedRoomMetadata } from './Metadata/Cached/Room';
export { CachedSceneMetadata } from './Metadata/Cached/Scene';
export { awaitReady } from './awaitReady';

export const grid = Grid.getInstance();

OBR.onReady(() => {
    grid.init();
});
