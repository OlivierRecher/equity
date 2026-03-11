import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

/**
 * Use Case: DeleteTask
 *
 * Deletes a task if the requesting user is:
 *   - The task's doer (author), OR
 *   - An ADMIN of the group.
 *
 * TaskBeneficiary rows are deleted automatically via Prisma onDelete: Cascade.
 * Balances will be recalculated on the next dashboard fetch.
 */
export class DeleteTask {
    constructor(
        private readonly taskRepository: ITaskRepository,
        private readonly groupRepository: IGroupRepository,
    ) {}

    async execute(input: { taskId: string; groupId: string; userId: string }): Promise<void> {
        const { taskId, groupId, userId } = input;

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
        const isDoer = task.userId === userId;

        if (!isDoer) {
            const role = await this.groupRepository.getMemberRole(groupId, userId);
            if (role !== 'ADMIN') {
                throw new Error('You can only delete your own tasks unless you are an admin');
            }
        }

        // 4. Delete (TaskBeneficiary cascade handled by Prisma)
        await this.taskRepository.delete(taskId);
    }
}
