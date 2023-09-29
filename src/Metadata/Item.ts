import { Item, Metadata } from '@owlbear-rodeo/sdk';
import { cleanMetadata } from './Base';

export class ItemMetadataMapper<T> {

    constructor (
        public readonly defaultValues: T,
    ) { }

    public clean (values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    get (item: Item): T {
        return this.clean(item.metadata);
    }

    set (item: Item, newMetadata: Partial<T>): T {
        const currentMetadata = this.get(item);
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        item.metadata = combinedMetadata;
        return combinedMetadata;
    }
}

