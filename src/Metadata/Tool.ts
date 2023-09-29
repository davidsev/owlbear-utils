import OBR, { Metadata } from '@owlbear-rodeo/sdk';
import { BaseMetadataMapper } from './Base';

export class ToolMetadataMapper<T> extends BaseMetadataMapper<T> {

    protected async getRawMetadata (): Promise<Metadata> {
        return await OBR.tool.getMetadata(this.key) || ({} as Metadata);
    }

    protected async setRawMetadata (newMetadata: Metadata): Promise<void> {
        return OBR.tool.setMetadata(this.key, newMetadata);
    }
}
