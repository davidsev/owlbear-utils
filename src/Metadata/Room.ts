import OBR, { type Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

/** A `BaseMetadataMapper` backed by the room's metadata, namespaced under `key`. */
export class RoomMetadataMapper<T> extends BaseMetadataMapper<T> {
    protected async getRawMetadata(): Promise<Metadata> {
        const metadata = (await OBR.room.getMetadata()) || {};
        return (metadata[this.key] || {}) as Metadata;
    }

    protected async setRawMetadata(newMetadata: Metadata): Promise<void> {
        return OBR.room.setMetadata({ [this.key]: newMetadata });
    }
}
