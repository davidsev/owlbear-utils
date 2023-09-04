import OBR from '@owlbear-rodeo/sdk';
import { Grid } from './Grid';

export { Point } from './Point';

export const grid = Grid.getInstance();
export { Grid };

OBR.onReady(() => {
    grid.init();
});
