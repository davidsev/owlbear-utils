import OBR from '@owlbear-rodeo/sdk';
import { Grid } from './Grid';

export { Point } from './Grid/Point';
export { Cell } from './Grid/Cell/Cell';
export { Square } from './Grid/Cell/Square';
export { VHex } from './Grid/Cell/VHex';
export { HHex } from './Grid/Cell/HHex';
export { SnapTo } from './Grid/SnapTo';

export const grid = Grid.getInstance();
export { Grid };

OBR.onReady(() => {
    grid.init();
});
