import { Item, Metadata } from '@owlbear-rodeo/sdk';
import { cleanMetadata } from './cleanMetadata';

export class ItemMetadataMapper<T> {

    constructor (
        public readonly key: string,
        public readonly defaultValues: T,
    ) { }

    public setDefaultValues (values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    /** @deprecated renamed to setDefaultValues instead */
    public clean (values: Metadata): T {
        return this.setDefaultValues(values);
    }

    get (item: Item): T {
        const myMetadata = (item.metadata[this.key] || {}) as Metadata;
        return this.setDefaultValues(myMetadata);
    }

    set (item: Item, newMetadata: Partial<T>): T {
        const currentMetadata = this.get(item);
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        item.metadata[this.key] = { ...currentMetadata, ...newMetadata };
        return combinedMetadata;
    }
}
