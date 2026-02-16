/**
 * Catalog domain port — for fetching, creating, and updating catalog items.
 */
export interface CatalogItem {
    id: string;
    name: string;
    defaultValue: number;
    icon: string;
    groupId: string;
}

export interface ICatalogRepository {
    findByGroupId(groupId: string): Promise<CatalogItem[]>;
    findById(catalogId: string): Promise<CatalogItem | null>;
    create(data: Omit<CatalogItem, 'id'>): Promise<CatalogItem>;
    update(catalogId: string, data: Partial<Pick<CatalogItem, 'name' | 'defaultValue' | 'icon'>>): Promise<CatalogItem>;
}
