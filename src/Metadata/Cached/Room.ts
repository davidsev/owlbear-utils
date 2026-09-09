import { RoomMetadataMapper } from '../Room';
import OBR, { type Metadata } from '@owlbear-rodeo/sdk';
import { BaseCachedMetadata } from './Base';

/** A `BaseCachedMetadata` backed by the room's metadata. */
export class CachedRoomMetadata<T> extends BaseCachedMetadata<T> {
    protected setupEvent(callback: (metadata: Metadata) => void): void {
        OBR.room.onMetadataChange((metadata: Metadata) => {
            callback(metadata[this.key] as Metadata);
        });
    }

    protected createMapper(key: string, defaultValues: T): RoomMetadataMapper<T> {
        return new RoomMetadataMapper(key, defaultValues);
    }
}
