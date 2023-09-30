import OBR, { Item } from '@owlbear-rodeo/sdk';

export type ItemSpecifier = Item | Item[] | string | string[];

function getItemIds (items: ItemSpecifier): string[] {
    if (typeof items === 'string')
        return [items];

    if (!Array.isArray(items))
        return [items.id];

    return items.map((item) => (typeof item === 'string') ? item : item.id);
}

export async function setItemAttachmentVisibility (items: ItemSpecifier, visible: boolean): Promise<void> {

    const attachments = await OBR.scene.items.getItemAttachments(getItemIds(items));
    if (!attachments.length)
        return;

    await OBR.scene.items.updateItems(attachments, (items) => {
        for (const item of items) {
            if (!item.disableAttachmentBehavior?.includes('VISIBLE'))
                item.visible = visible;
        }
    });
}

export async function showItemAttachments (items: ItemSpecifier): Promise<void> {
    return setItemAttachmentVisibility(items, true);
}

export async function hideItemAttachments (items: ItemSpecifier): Promise<void> {
    return setItemAttachmentVisibility(items, false);
}

