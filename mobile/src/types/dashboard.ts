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
