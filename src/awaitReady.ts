import OBR from '@owlbear-rodeo/sdk';

/** Wait for the SDK to be ready. */
export async function awaitReady (): Promise<void> {
    if (OBR.isReady)
        return Promise.resolve();
    return new Promise((resolve) => {
        OBR.onReady(resolve);
    });
}
