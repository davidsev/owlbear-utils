import OBR, { Metadata, Player } from '@owlbear-rodeo/sdk';
import { BaseCachedMetadata } from './Base';
import { PlayerMetadataMapper } from '../Player';

export class CachedPlayerMetadata<T> extends BaseCachedMetadata<T> {

    protected setupEvent (callback: (metadata: Metadata) => void): void {
        OBR.player.onChange((player: Player) => {
            callback(player.metadata[this.key] as Metadata);
        });
    }

    protected createMapper (key: string, defaultValues: T): PlayerMetadataMapper<T> {
        return new PlayerMetadataMapper(key, defaultValues);
    }

}
