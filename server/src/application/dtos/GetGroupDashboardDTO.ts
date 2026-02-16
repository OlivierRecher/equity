export interface UserBalanceDTO {
    readonly userId: string;
    readonly userName: string;
    readonly pointsGenerated: number;
    readonly pointsConsumed: number;
    readonly balance: number;
}

export interface SuggestedDoerDTO {
    readonly userId: string;
    readonly userName: string;
}

export interface TaskHistoryItemDTO {
    readonly id: string;
    readonly taskName: string;
    readonly doerName: string;
    readonly value: number;
    readonly date: string;
}

export interface CatalogItemDTO {
    readonly id: string;
    readonly name: string;
    readonly defaultValue: number;
    readonly icon: string;
}

export interface GroupDashboardDTO {
    readonly groupId: string;
    readonly balances: UserBalanceDTO[];
    readonly suggestedNextDoer: SuggestedDoerDTO | null;
    readonly history: TaskHistoryItemDTO[];
    readonly catalog: CatalogItemDTO[];
}
