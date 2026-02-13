/**
 * Input DTO for creating a task
 */
export interface CreateTaskInputDTO {
    groupId: string;
    doerId: string;
    catalogId?: string;
    value: number;
    beneficiaryIds: string[];
}

/**
 * Output DTO for the created task
 */
export interface TaskCreatedDTO {
    id: string;
    value: number;
    doerId: string;
    beneficiaryIds: string[];
    groupId: string;
    createdAt: string;
}
