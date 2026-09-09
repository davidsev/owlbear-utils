import OBR, { type Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

/** A `BaseMetadataMapper` backed by an OBR tool's metadata. Unlike the other mappers, `key` here is the OBR tool id, and fields sit at the root of that tool's metadata rather than under a sub-key. */
export class ToolMetadataMapper<T> extends BaseMetadataMapper<T> {
    protected async getRawMetadata(): Promise<Metadata> {
        return (await OBR.tool.getMetadata(this.key)) || ({} as Metadata);
    }

    protected async setRawMetadata(newMetadata: Metadata): Promise<void> {
        return OBR.tool.setMetadata(this.key, newMetadata);
    }
}
