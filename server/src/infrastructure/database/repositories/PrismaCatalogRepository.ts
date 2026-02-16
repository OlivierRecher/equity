import type { PrismaClient } from '@prisma/client';
import type { ICatalogRepository, CatalogItem } from '../../../domain/ports/ICatalogRepository.js';

export class PrismaCatalogRepository implements ICatalogRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByGroupId(groupId: string): Promise<CatalogItem[]> {
        return this.prisma.catalog.findMany({
            where: { groupId },
            orderBy: { name: 'asc' },
        });
    }

    async findById(catalogId: string): Promise<CatalogItem | null> {
        return this.prisma.catalog.findUnique({
            where: { id: catalogId },
        });
    }

    async create(data: Omit<CatalogItem, 'id'>): Promise<CatalogItem> {
        return this.prisma.catalog.create({ data });
    }

    async update(
        catalogId: string,
        data: Partial<Pick<CatalogItem, 'name' | 'defaultValue' | 'icon'>>,
    ): Promise<CatalogItem> {
        return this.prisma.catalog.update({
            where: { id: catalogId },
            data,
        });
    }
}
