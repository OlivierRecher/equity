/**
 * Dashboard API types — mirrors backend DTOs
 */

export interface UserBalanceDTO {
    userId: string;
    userName: string;
    pointsGenerated: number;
    pointsConsumed: number;
    balance: number;
}

export interface SuggestedDoerDTO {
    userId: string;
    userName: string;
}

export interface TaskHistoryItemDTO {
    id: string;
    taskName: string;
    doerName: string;
    value: number;
    date: string;
}

export interface CatalogItemDTO {
    id: string;
    name: string;
    defaultValue: number;
    icon: string;
}

export interface GroupDashboardDTO {
    groupId: string;
    balances: UserBalanceDTO[];
    suggestedNextDoer: SuggestedDoerDTO | null;
    history: TaskHistoryItemDTO[];
    catalog: CatalogItemDTO[];
}

/**
 * CreateTask input — sent to POST /groups/:groupId/tasks
 */
export interface CreateTaskInput {
    doerId: string;
    catalogId?: string;
    value: number;
    beneficiaryIds: string[];
}

export interface TaskCreatedDTO {
    id: string;
    value: number;
    doerId: string;
    beneficiaryIds: string[];
    groupId: string;
    createdAt: string;
}

/**
 * UpdateCatalogItem input — sent to PATCH /groups/:groupId/catalog/:catalogId
 */
export interface UpdateCatalogItemInput {
    name?: string;
    defaultValue?: number;
}

export interface CatalogItemUpdatedDTO {
    id: string;
    name: string;
    defaultValue: number;
    icon: string;
}
