import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

export interface UpdateTaskInputDTO {
    taskId: string;
    groupId: string;
    userId: string;
    catalogId?: string;
    value: number;
    beneficiaryIds: string[];
    doerIds?: string[];
}

/**
 * Use Case: UpdateTask
 *
 * Updates a task's value, catalogId, and beneficiaryIds.
 * Permission: only the doer or a group ADMIN can edit.
 * Implementation: delete old task + create new one (atomically replaces beneficiaries).
 */
export class UpdateTask {
    constructor(
        private readonly taskRepository: ITaskRepository,
        private readonly groupRepository: IGroupRepository,
    ) {}

    async execute(input: UpdateTaskInputDTO): Promise<void> {
        const { taskId, groupId, userId, catalogId, value, beneficiaryIds, doerIds } = input;

        // 1. Find the task
        const task = await this.taskRepository.findById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        // 2. Verify the task belongs to this group
        if (task.groupId !== groupId) {
            throw new Error('Task does not belong to this group');
        }

        // 3. Check permissions: doer OR admin
        const isDoer = task.doerIds.includes(userId);
        if (!isDoer) {
            const role = await this.groupRepository.getMemberRole(groupId, userId);
            if (role !== 'ADMIN') {
                throw new Error('You can only edit your own tasks unless you are an admin');
            }
        }

        // 4. Validate beneficiaries
        if (beneficiaryIds.length === 0) {
            throw new Error('Task must have at least one beneficiary');
        }

        if (value < 0) {
            throw new Error('Task value must be non-negative');
        }

        // 5. Delete old task (cascade deletes beneficiaries)
        await this.taskRepository.delete(taskId);

        // 6. Create updated task (preserving original doers if not updated and creation date)
        const { Task } = await import('../../domain/entities/Task.js');
        const updatedTask = new Task({
            id: taskId,
            value,
            doerIds: doerIds ?? task.doerIds,
            groupId,
            catalogId,
            beneficiaryIds,
            createdAt: task.createdAt,
        });

        await this.taskRepository.save(updatedTask);
    }
}
