import { Grid as BaseGrid, GridScale } from '@owlbear-rodeo/sdk';

export const fakeGridScale1: GridScale = {
    raw: '5ft',
    parsed: {
        multiplier: 5,
        unit: 'ft',
        digits: 0,
    },
};

export const fakeGridScale2: GridScale = {
    raw: '1mi',
    parsed: {
        multiplier: 1,
        unit: 'mi',
        digits: 0,
    },
};

export const fakeGridDataSquareChess: BaseGrid = {
    dpi: 1,
    style: {
        lineType: 'SOLID',
        lineOpacity: 1,
        lineColor: 'DARK',
    },
    type: 'SQUARE',
    measurement: 'CHEBYSHEV',
    scale: '5ft',
};

export const fakeGridDataHexEuclid: BaseGrid = {
    dpi: 2,
    style: {
        lineType: 'DASHED',
        lineOpacity: 0.5,
        lineColor: 'LIGHT',
    },
    type: 'HEX_HORIZONTAL',
    measurement: 'EUCLIDEAN',
    scale: '1mi',
};

const OBR = {
    onReady: jest.fn(),
    scene: {
        grid: {
            onChange: jest.fn(),
            getScale: jest.fn(),
        },
    },
};

export default OBR;
