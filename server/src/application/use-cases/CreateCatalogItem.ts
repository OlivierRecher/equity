import type { ICatalogRepository } from '../../domain/ports/ICatalogRepository.js';
import type { CreateCatalogItemInputDTO, CatalogItemCreatedDTO } from '../dtos/CreateCatalogItemDTO.js';

/**
 * Use Case: CreateCatalogItem
 *
 * Creates a new task type in the group's catalog.
 */
export class CreateCatalogItem {
    constructor(private readonly catalogRepository: ICatalogRepository) { }

    async execute(input: CreateCatalogItemInputDTO): Promise<CatalogItemCreatedDTO> {
        const { groupId, name, defaultValue, icon } = input;

        const created = await this.catalogRepository.create({
            groupId,
            name,
            defaultValue,
            icon,
        });

        return {
            id: created.id,
            name: created.name,
            defaultValue: created.defaultValue,
            icon: created.icon,
        };
    }
}
