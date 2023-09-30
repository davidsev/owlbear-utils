import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

export class SceneMetadataMapper<T> extends BaseMetadataMapper<T> {

    protected async getRawMetadata (): Promise<Metadata> {
        const metadata = await OBR.scene.getMetadata() || {};
        return (metadata[this.key] || {}) as Metadata;
    }

    protected async setRawMetadata (newMetadata: Metadata): Promise<void> {
        return OBR.scene.setMetadata({ [this.key]: newMetadata });
    }
}
