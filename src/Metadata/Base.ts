import { Metadata } from '@owlbear-rodeo/sdk';
import { awaitReady } from '../awaitReady';

export function cleanMetadata<T> (values: Metadata, defaultValues: T): T {
    // Start with the default values.
    const clean = { ...defaultValues };

    // If any of the values are valid, copy them over.
    for (const key in defaultValues)
        if (values[key] !== undefined && values[key] !== null && typeof (values[key]) === typeof (defaultValues[key]))
            (clean[key] as any) = values[key];

    return clean;
}

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
