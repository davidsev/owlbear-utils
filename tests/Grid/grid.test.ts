import { Grid } from '../../src/Grid';
import OBR, {
    fakeGridDataHexEuclid,
    fakeGridDataSquareChess,
    fakeGridScale1,
    fakeGridScale2,
} from '../../__mocks__/@owlbear-rodeo/sdk';

describe('testing grid', () => {
    test('access before init', () => {
        const g = new Grid();
        expect(() => g.dpi).toThrowError('Grid data not loaded yet');
        expect(() => g.style).toThrowError('Grid data not loaded yet');
        expect(() => g.type).toThrowError('Grid data not loaded yet');
    });

    test('init and change', async () => {

        // Call init, and get the onChange callback.
        const g = new Grid();
        const initPromise = g.init();
        const onChangeCallback = OBR.scene.grid.onChange.mock.calls[0][0];

        // Mock the getScale call, and then send fake data to the onChange callback.
        OBR.scene.grid.getScale.mockResolvedValue(fakeGridScale1);
        onChangeCallback(fakeGridDataSquareChess);

        // Make sure the promise has resolved.
        await initPromise;

        // Make sure the data is correct.
        expect(g.dpi).toBe(1);
        expect(g.style.lineType).toEqual('SOLID');
        expect(g.gridScale.parsed.multiplier).toBe(5);

        // Call the change callback again.
        OBR.scene.grid.getScale.mockResolvedValue(fakeGridScale2);
        await onChangeCallback(fakeGridDataHexEuclid);

        // Make sure the data is correct.
        expect(g.dpi).toBe(2);
        expect(g.style.lineType).toEqual('DASHED');
        expect(g.gridScale.parsed.multiplier).toBe(1);
    });

});
