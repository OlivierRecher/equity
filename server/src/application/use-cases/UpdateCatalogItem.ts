import type { ICatalogRepository } from '../../domain/ports/ICatalogRepository.js';
import { EntityNotFoundError } from '../../domain/errors/DomainError.js';
import type { UpdateCatalogItemInputDTO, CatalogItemUpdatedDTO } from '../dtos/UpdateCatalogItemDTO.js';

/**
 * Use Case: UpdateCatalogItem
 *
 * Updates name, defaultValue, and/or icon of a catalog item.
 * Only affects future tasks — no retroactive changes.
 */
export class UpdateCatalogItem {
    constructor(private readonly catalogRepository: ICatalogRepository) { }

    async execute(input: UpdateCatalogItemInputDTO): Promise<CatalogItemUpdatedDTO> {
        const { catalogId, name, defaultValue, icon } = input;

        // 1. Verify catalog item exists
        const existing = await this.catalogRepository.findById(catalogId);
        if (!existing) {
            throw new EntityNotFoundError('CatalogItem', catalogId);
        }

        // 2. Build update payload
        const updateData: Partial<{ name: string; defaultValue: number; icon: string }> = {};
        if (name !== undefined) updateData.name = name;
        if (defaultValue !== undefined) updateData.defaultValue = defaultValue;
        if (icon !== undefined) updateData.icon = icon;

        // 3. Persist
        const updated = await this.catalogRepository.update(catalogId, updateData);

        return {
            id: updated.id,
            name: updated.name,
            defaultValue: updated.defaultValue,
            icon: updated.icon,
        };
    }
}
