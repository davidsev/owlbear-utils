import { Metadata } from '@owlbear-rodeo/sdk';
import { awaitReady } from '../awaitReady';
import { cleanMetadata } from './cleanMetadata';

export abstract class BaseMetadataMapper<T> {

    constructor (
        public readonly key: string,
        public readonly defaultValues: T,
    ) { }

    public clean (values: Metadata): T {
        return cleanMetadata(values, this.defaultValues);
    }

    protected abstract getRawMetadata (): Promise<Metadata>;

    protected abstract setRawMetadata (newMetadata: Metadata): Promise<void>;

    async get (): Promise<T> {
        await awaitReady();
        return this.clean(await this.getRawMetadata());
    }

    async set (newMetadata: Partial<T>): Promise<T> {
        await awaitReady();
        const currentMetadata = await this.get();
        const combinedMetadata = { ...currentMetadata, ...newMetadata };
        await this.setRawMetadata(combinedMetadata);
        return combinedMetadata;
    }
}
