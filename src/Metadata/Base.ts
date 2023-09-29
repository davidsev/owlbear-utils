import { Metadata } from '@owlbear-rodeo/sdk';
import { awaitReady } from '../awaitReady';

export abstract class BaseMetadataMapper<T> {

    constructor (
        public readonly key: string,
        public readonly defaultValues: T,
    ) { }

    public clean (values: Metadata): T {
        // Start with the default values.
        const clean = { ...this.defaultValues };

        // If any of the values are valid, copy them over.
        for (const key in this.defaultValues)
            if (values[key] !== undefined && values[key] !== null && typeof (values[key]) === typeof (this.defaultValues[key]))
                (clean[key] as any) = values[key];

        return clean;
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
