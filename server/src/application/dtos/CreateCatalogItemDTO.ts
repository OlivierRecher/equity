/**
 * Input DTO for creating a catalog item
 */
export interface CreateCatalogItemInputDTO {
    groupId: string;
    name: string;
    defaultValue: number;
    icon: string;
}

/**
 * Output DTO for the created catalog item
 */
export interface CatalogItemCreatedDTO {
    id: string;
    name: string;
    defaultValue: number;
    icon: string;
}
