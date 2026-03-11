export interface TaskProps {
    readonly id: string;
    readonly value: number;
    readonly doerIds: readonly string[];
    readonly beneficiaryIds: readonly string[];
    readonly groupId: string;
    readonly catalogId?: string;
    readonly createdAt?: Date;
}

export class Task {
    readonly id: string;
    /** Points value of the task (snapshot, frozen at creation) */
    readonly value: number;
    /** The users who performed the task (doers) */
    readonly doerIds: readonly string[];
    /** Users who benefit from this task (present members only) */
    readonly beneficiaryIds: readonly string[];
    readonly groupId: string;
    readonly catalogId?: string;
    readonly createdAt: Date;

    constructor(props: TaskProps) {
        if (props.value < 0) {
            throw new Error('Task value must be non-negative');
        }
        if (props.doerIds.length === 0) {
            throw new Error('Task must have at least one doer');
        }
        if (props.beneficiaryIds.length === 0) {
            throw new Error('Task must have at least one beneficiary');
        }

        this.id = props.id;
        this.value = props.value;
        this.doerIds = props.doerIds;
        this.beneficiaryIds = props.beneficiaryIds;
        this.groupId = props.groupId;
        this.catalogId = props.catalogId;
        this.createdAt = props.createdAt ?? new Date();
    }

    /** Number of beneficiaries who share the cost */
    get beneficiaryCount(): number {
        return this.beneficiaryIds.length;
    }

    /** Cost per beneficiary = value / number of beneficiaries */
    get costPerBeneficiary(): number {
        return this.value / this.beneficiaryCount;
    }
}
