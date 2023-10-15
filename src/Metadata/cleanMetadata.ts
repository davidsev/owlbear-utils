import { Metadata } from '@owlbear-rodeo/sdk';

export function cleanMetadata<T> (values: Metadata, defaultValues: T): T {
    // Start with the default values.
    const clean = { ...defaultValues };

    // If any of the values are valid, copy them over.
    for (const key in defaultValues)
        if (values[key] !== undefined && values[key] !== null)
            (clean[key] as any) = values[key];

    return clean;
}
