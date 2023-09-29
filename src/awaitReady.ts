import OBR from '@owlbear-rodeo/sdk';

export async function awaitReady (): Promise<void> {
    if (OBR.isReady)
        return Promise.resolve();
    return new Promise((resolve) => {
        OBR.onReady(resolve);
    });
}
