import { Item, Metadata } from '@owlbear-rodeo/sdk';
import { cleanMetadata } from './cleanMetadata';

export class ItemMetadataMapper<T> {

    constructor (
        public readonly key: string,
        public readonly defaultValues: T,
    ) { }

    public clean (values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    get (item: Item): T {
        const myMetadata = (item.metadata[this.key] || {}) as Metadata;
        return this.clean(myMetadata);
    }

    set (item: Item, newMetadata: Partial<T>): T {
        const currentMetadata = this.get(item);
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        item.metadata[this.key] = { ...currentMetadata, ...newMetadata };
        return combinedMetadata;
    }
}
