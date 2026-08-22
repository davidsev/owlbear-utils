import type { Grid as BaseGrid, GridMeasurement, GridScale, GridType } from '@owlbear-rodeo/sdk';

export function makeGridData(type: GridType, opts: { dpi?: number; measurement?: GridMeasurement } = {}): BaseGrid {
    return {
        dpi: opts.dpi ?? 100,
        style: { lineType: 'SOLID', lineOpacity: 1, lineColor: 'LIGHT', lineWidth: 1 },
        type,
        measurement: opts.measurement ?? 'CHEBYSHEV',
        scale: '5ft',
    };
}

export function makeGridScale(): GridScale {
    return {
        raw: '5ft',
        parsed: { multiplier: 5, unit: 'ft', digits: 0 },
    };
}
