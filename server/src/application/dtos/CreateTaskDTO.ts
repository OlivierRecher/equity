/**
 * Input DTO for creating a task
 */
export interface CreateTaskInputDTO {
    groupId: string;
    doerIds?: string[]; // Optional: defaults to the current user in controller
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
    doerIds: string[];
    beneficiaryIds: string[];
    groupId: string;
    createdAt: string;
}
