import type { Metadata } from '@owlbear-rodeo/sdk';

export function cleanMetadata<T>(values: Metadata | null | undefined, defaultValues: T): T {
    // Start with the default values.
    const clean = { ...defaultValues };

    // If any of the values are valid, copy them over.
    if (values)
        for (const key in defaultValues)
            if (values[key] !== undefined && values[key] !== null) (clean as Record<string, unknown>)[key] = values[key];

    return clean;
}
