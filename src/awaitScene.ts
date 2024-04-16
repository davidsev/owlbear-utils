import OBR from '@owlbear-rodeo/sdk';
import { awaitReady } from './awaitReady';

/** Wait for a scene to be ready.  If a scene is already loaded then the promise resolves instantly. */
export async function awaitScene (): Promise<void> {

    // Make sure OBR is ready.
    await awaitReady();

    return new Promise<void>(async (resolve) => {
        // Once the scene is ready, we need to clean up the event listener and then resolve the promise.
        let removeEventListener: ReturnType<typeof OBR.scene.onReadyChange> | null = null;
        const callbackOnceReady = () => {
            if (removeEventListener)
                removeEventListener();
            resolve();
        };

        // Hook an event listener to wait for the scene to be ready.
        // We need to do this before checking isReady to avoid race conditions where it becomes ready between the check and registering the event.
        removeEventListener = OBR.scene.onReadyChange((ready: boolean) => {
            if (ready)
                callbackOnceReady();
        });

        // If it's already ready, then we can resolve immediately.
        if (await OBR.scene.isReady())
            callbackOnceReady();
    });
}
