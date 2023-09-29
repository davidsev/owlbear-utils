import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

export class RoomMetadataMapper<T> extends BaseMetadataMapper<T> {

    protected async getRawMetadata (): Promise<Metadata> {
        const metadata = await OBR.room.getMetadata() || {};
        return (metadata[this.key] || {} as Metadata) as Metadata;
    }

    protected async setRawMetadata (newMetadata: Metadata): Promise<void> {
        return OBR.room.setMetadata({ [this.key]: newMetadata });
    }
}
