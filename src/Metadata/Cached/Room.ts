import { RoomMetadataMapper } from '../Room';
import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseCachedMetadata } from './Base';

export class CachedRoomMetadata<T> extends BaseCachedMetadata<T> {

    protected setupEvent (callback: (metadata: Metadata) => void): void {
        OBR.room.onMetadataChange((metadata: Metadata) => {
            callback(metadata[this.key] as Metadata);
        });
    }

    protected createMapper (key: string, defaultValues: T): RoomMetadataMapper<T> {
        return new RoomMetadataMapper(key, defaultValues);
    }

}
