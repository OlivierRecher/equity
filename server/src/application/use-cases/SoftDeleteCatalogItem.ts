import type { ICatalogRepository } from '../../domain/ports/ICatalogRepository.js';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

export class SoftDeleteCatalogItem {
    constructor(
        private readonly catalogRepository: ICatalogRepository,
        private readonly groupRepository: IGroupRepository,
    ) {}

    async execute(input: { groupId: string; catalogId: string; userId: string }): Promise<void> {
        const { groupId, catalogId, userId } = input;

        const role = await this.groupRepository.getMemberRole(groupId, userId);
        if (role !== 'ADMIN') {
            throw new Error('Only admins can delete catalog items');
        }

        const item = await this.catalogRepository.findById(catalogId);
        if (!item) {
            throw new Error('Catalog item not found');
        }

        if (item.groupId !== groupId) {
            throw new Error('Catalog item does not belong to this group');
        }

        await this.catalogRepository.softDelete(catalogId);
    }
}
