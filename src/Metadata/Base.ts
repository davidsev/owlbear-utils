import { Metadata } from '@owlbear-rodeo/sdk';
import { awaitReady } from '../awaitReady';
import { cleanMetadata } from './cleanMetadata';

export abstract class BaseMetadataMapper<T> {

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

    public cleanRawMetadata (rawMetadata: Metadata): T {
        return this.setDefaultValues(this.transformLoadingValues(rawMetadata));
    }

    protected abstract getRawMetadata (): Promise<Metadata>;

    protected abstract setRawMetadata (newMetadata: Metadata): Promise<void>;

    protected transformLoadingValues (values: Metadata): Metadata {
        return values;
    }

    protected transformSavingValues (values: Metadata): Metadata {
        return values;
    }

    async get (): Promise<T> {
        await awaitReady();
        return this.cleanRawMetadata(await this.getRawMetadata());
    }

    async set (newMetadata: Partial<T>): Promise<T> {
        await awaitReady();
        const currentMetadata = await this.get();
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        await this.setRawMetadata(this.transformSavingValues(combinedMetadata));
        return combinedMetadata;
    }
}
