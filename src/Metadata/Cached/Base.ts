import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from '../Base';

export abstract class BaseCachedMetadata<T> {

    private metadata: T;
    private readonly mapper: BaseMetadataMapper<T>;
    private readonly readyPromise: Promise<void>;

    constructor (key: string, defaultValues: T);
    constructor (mapper: BaseMetadataMapper<T>);
    constructor (keyOrMetadataMapper: string | BaseMetadataMapper<T>, defaultValuesOrNothing?: T) {
        if (keyOrMetadataMapper instanceof BaseMetadataMapper) {
            this.mapper = keyOrMetadataMapper;
        } else if (typeof defaultValuesOrNothing !== 'undefined') {
            this.mapper = this.createMapper(keyOrMetadataMapper, defaultValuesOrNothing);
        } else {
            throw new Error('Invalid arguments');
        }

        // Watch for changes
        OBR.onReady(() => {
            this.setupEvent((metadata) => {
                this.metadata = this.mapper.cleanRawMetadata(metadata);
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

    public get key (): string {
        return this.mapper.key;
    }

    public get defaultValues (): T {
        return this.mapper.defaultValues;
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
        this.metadata = { ...this.metadata, ...keyOrData as T };
        return this.mapper.set(keyOrData as T);
    }
}
