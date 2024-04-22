import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseCachedMetadata } from './Base';
import { SceneMetadataMapper } from '../Scene';

export class CachedSceneMetadata<T> extends BaseCachedMetadata<T> {

    protected setupEvent (callback: (metadata: Metadata) => void): void {
        OBR.scene.onMetadataChange((metadata: Metadata) => {
            callback(metadata[this.key] as Metadata);
        });
    }

    protected createMapper (key: string, defaultValues: T): SceneMetadataMapper<T> {
        return new SceneMetadataMapper(key, defaultValues);
    }

}
