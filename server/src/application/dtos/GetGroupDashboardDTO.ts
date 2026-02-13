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

export interface GroupDashboardDTO {
    readonly groupId: string;
    readonly balances: UserBalanceDTO[];
    readonly suggestedNextDoer: SuggestedDoerDTO | null;
}
