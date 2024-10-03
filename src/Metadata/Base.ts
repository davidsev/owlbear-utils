import { Metadata } from '@owlbear-rodeo/sdk';
import { awaitReady } from '../awaitReady';
import { cleanMetadata } from './cleanMetadata';

/** Map metadata to a strongly typed object. */
export abstract class BaseMetadataMapper<T> {

    constructor (
        /** The key in the metadata object to store our data under. */
        public readonly key: string,
        /** The default values for this metadata. */
        public readonly defaultValues: T,
    ) { }

    /** Return a copy of the provided object with any missing or wrongly-typed values filled from the defaults. */
    public setDefaultValues (values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    /** @deprecated renamed to setDefaultValues instead */
    public clean (values: Metadata): T {
        return this.setDefaultValues(values);
    }

    /** Take the raw metadata (as saved) and clean it up for use. */
    public cleanRawMetadata (rawMetadata: Metadata): T {
        return this.setDefaultValues(this.transformLoadingValues(rawMetadata));
    }

    /** @internal Load the raw metadata from storage. */
    protected abstract getRawMetadata (): Promise<Metadata>;

    /** @internal Save the raw metadata to storage. */
    protected abstract setRawMetadata (newMetadata: Metadata): Promise<void>;

    /** Transform the metadata from storage format to something useful.  EG decompress key names or migrate old data. */
    protected transformLoadingValues (values: Metadata): Metadata {
        return values;
    }

    /** Transform the metadata from something useful to storage format.  EG compress key names. */
    protected transformSavingValues (values: Metadata): Metadata {
        return values;
    }

    /** Get the metadata as a strongly typed object. */
    async get (): Promise<T> {
        await awaitReady();
        return this.cleanRawMetadata(await this.getRawMetadata());
    }

    /** Set the metadata from a (partial) strongly typed object. */
    async set (newMetadata: Partial<T>): Promise<T> {
        await awaitReady();
        const currentMetadata = await this.get();
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        await this.setRawMetadata(this.transformSavingValues(combinedMetadata));
        return combinedMetadata;
    }
}
