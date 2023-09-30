import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

export class PlayerMetadataMapper<T> extends BaseMetadataMapper<T> {

    protected async getRawMetadata (): Promise<Metadata> {
        const metadata = await OBR.player.getMetadata() || {};
        return (metadata[this.key] || {}) as Metadata;
    }

    protected async setRawMetadata (newMetadata: Metadata): Promise<void> {
        return OBR.player.setMetadata({ [this.key]: newMetadata });
    }
}
