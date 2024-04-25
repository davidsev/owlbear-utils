import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from '../Base';

export abstract class BaseCachedMetadata<T> {

    private metadata: T;
    private readonly mapper: BaseMetadataMapper<T>;
    private readonly readyPromise: Promise<void>;

    constructor (
        public readonly key: string,
        public readonly defaultValues: T,
    ) {

        this.mapper = this.createMapper(key, defaultValues);

        // Watch for changes
        OBR.onReady(() => {
            this.setupEvent((metadata) => {
                this.metadata = this.mapper.clean(metadata);
            });
        });

        // Set the metadata to the default values as a placeholder while we fetch the real values.
        this.metadata = this.mapper.defaultValues;
        this.readyPromise = new Promise<void>((resolve) => {
            this.mapper.get().then((metadata) => {
                this.metadata = metadata;
                resolve();
            });
        });
    }

    protected abstract setupEvent (callback: (metadata: Metadata) => void): void;

    protected abstract createMapper (key: string, defaultValues: T): BaseMetadataMapper<T>

    public async awaitReady (): Promise<void> {
        return this.readyPromise;
    }

    public get data (): T {
        return this.metadata;
    }

    public get<K extends keyof T> (key: K): T[K] {
        return this.metadata[key];
    }

    public async set (data: Partial<T>): Promise<T>;
    public async set<K extends keyof T> (key: K, value: T[K]): Promise<T>;
    public async set (keyOrData: keyof T | Partial<T>, value?: any): Promise<T> {
        if (typeof keyOrData === 'string') {
            keyOrData = { [keyOrData]: value } as T;
        }
        return this.mapper.set(keyOrData as T).then((metadata) => {
            this.metadata = metadata;
            return metadata;
        });
    }
}
