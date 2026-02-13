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

export interface GroupDashboardDTO {
    groupId: string;
    balances: UserBalanceDTO[];
    suggestedNextDoer: SuggestedDoerDTO | null;
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
