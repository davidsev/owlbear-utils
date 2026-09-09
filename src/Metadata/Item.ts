import type { Item, Metadata } from '@owlbear-rodeo/sdk';
import { cleanMetadata } from './cleanMetadata';

/**
 * Maps an in-memory `Item`'s metadata to a strongly typed object under `key`, synchronously.
 * Unlike `BaseMetadataMapper`, this operates directly on a local `Item` rather than fetching from the SDK.
 */
export class ItemMetadataMapper<T> {
    constructor(
        /** The key in the item's metadata object to store our data under. */
        public readonly key: string,
        /** The default values for this metadata. */
        public readonly defaultValues: T,
    ) {}

    /**
     * Returns a new object holding exactly the keys of `defaultValues`, taking each one from `values` when it's
     * present and neither `undefined` nor `null`, and from `defaultValues` otherwise.  There's no type checking,
     * keys not in `defaultValues` are dropped, and nested objects are taken wholesale rather than merged.
     */
    public setDefaultValues(values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    /** Reads this item's metadata as a strongly typed object. */
    get(item: Item): T {
        const myMetadata = (item.metadata[this.key] || {}) as Metadata;
        return this.setDefaultValues(myMetadata);
    }

    /** Merges a partial object into this item's metadata, mutating `item` in place. */
    set(item: Item, newMetadata: Partial<T>): T {
        const currentMetadata = this.get(item);
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        item.metadata[this.key] = { ...currentMetadata, ...newMetadata };
        return combinedMetadata;
    }
}
