/**
 * Input DTO for updating a catalog item
 */
export interface UpdateCatalogItemInputDTO {
    catalogId: string;
    name?: string;
    defaultValue?: number;
    icon?: string;
}

/**
 * Output DTO for the updated catalog item
 */
export interface CatalogItemUpdatedDTO {
    id: string;
    name: string;
    defaultValue: number;
    icon: string;
}
