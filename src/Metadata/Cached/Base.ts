import OBR, { type Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from '../Base';

/** Wraps a `BaseMetadataMapper` with an in-memory cache kept fresh via an OBR change-event subscription, so `.data`/`.get()` are synchronous once `awaitReady()` resolves. */
export abstract class BaseCachedMetadata<T> {
    private metadata: T;
    private readonly mapper: BaseMetadataMapper<T>;
    private readonly readyPromise: Promise<void>;

    /** Builds a mapper via `createMapper(key, defaultValues)` and caches it. */
    constructor(key: string, defaultValues: T);
    /** Caches an existing mapper instance. */
    constructor(mapper: BaseMetadataMapper<T>);
    constructor(keyOrMetadataMapper: string | BaseMetadataMapper<T>, defaultValuesOrNothing?: T) {
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

    /** The key this metadata is stored under. */
    public get key(): string {
        return this.mapper.key;
    }

    /** The default values used to fill in fields that are missing, `undefined` or `null`. */
    public get defaultValues(): T {
        return this.mapper.defaultValues;
    }

    /** Subscribes to the OBR event that fires when this metadata location changes, so the cache can be refreshed. */
    protected abstract setupEvent(callback: (metadata: Metadata) => void): void;

    /** Builds the mapper for this metadata location, used when constructed with `(key, defaultValues)` rather than a pre-built mapper. */
    protected abstract createMapper(key: string, defaultValues: T): BaseMetadataMapper<T>;

    /** Resolves once the first fetch of the metadata has completed, after which `.data`/`.get()` are up to date. */
    public async awaitReady(): Promise<void> {
        return this.readyPromise;
    }

    /** The current cached metadata, synchronously. */
    public get data(): T {
        return this.metadata;
    }

    /** Reads a single field from the current cached metadata. */
    public get<K extends keyof T>(key: K): T[K] {
        return this.metadata[key];
    }

    /** Merges a partial object into the metadata. */
    public async set(data: Partial<T>): Promise<T>;
    /** Sets a single field of the metadata. */
    public async set<K extends keyof T>(key: K, value: T[K]): Promise<T>;
    public async set(keyOrData: keyof T | Partial<T>, value?: T[keyof T]): Promise<T> {
        if (typeof keyOrData === 'string') {
            keyOrData = { [keyOrData]: value } as T;
        }
        this.metadata = { ...this.metadata, ...(keyOrData as T) };
        return this.mapper.set(keyOrData as T);
    }
}
