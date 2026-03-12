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
    readonly doerIds: string[];
    readonly doerNames: string[];
    readonly value: number;
    readonly date: string;
    readonly catalogId?: string;
    readonly beneficiaryIds: string[];
}

export interface CatalogItemDTO {
    readonly id: string;
    readonly name: string;
    readonly defaultValue: number;
    readonly icon: string;
}

export interface GroupMemberDTO {
    readonly userId: string;
    readonly userName: string;
    readonly role: string;
}

export interface GroupDashboardDTO {
    readonly groupId: string;
    readonly groupName: string;
    readonly groupCode: string;
    readonly role?: string;
    readonly members: GroupMemberDTO[];
    readonly balances: UserBalanceDTO[];
    readonly suggestedNextDoer: SuggestedDoerDTO | null;
    readonly history: TaskHistoryItemDTO[];
    readonly catalog: CatalogItemDTO[];
}
