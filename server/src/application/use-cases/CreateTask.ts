import { randomUUID } from 'node:crypto';
import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { Task } from '../../domain/entities/Task.js';
import { EntityNotFoundError } from '../../domain/errors/DomainError.js';
import type { CreateTaskInputDTO, TaskCreatedDTO } from '../dtos/CreateTaskDTO.js';

/**
 * Use Case: CreateTask
 *
 * 1. Validates that doer and beneficiaries belong to the group
 * 2. Creates the Task domain entity (runs domain validation)
 * 3. Persists via repository (creates TaskBeneficiary links)
 * 4. Returns a clean DTO
 */
export class CreateTask {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
    ) { }

    async execute(input: CreateTaskInputDTO): Promise<TaskCreatedDTO> {
        const { groupId, doerId, catalogId, value, beneficiaryIds } = input;

        // 1. Validate: fetch group members
        const groupUsers = await this.userRepository.findByGroupId(groupId);
        const groupUserIds = new Set(groupUsers.map((u) => u.id));

        // 2. Validate doer belongs to group
        if (!groupUserIds.has(doerId)) {
            throw new EntityNotFoundError('User', doerId);
        }

        // 3. Validate all beneficiaries belong to group
        for (const beneficiaryId of beneficiaryIds) {
            if (!groupUserIds.has(beneficiaryId)) {
                throw new EntityNotFoundError('User', beneficiaryId);
            }
        }

        // 4. Create domain entity (runs business validation: value >= 0, >= 1 beneficiary)
        const task = new Task({
            id: randomUUID(),
            value,
            userId: doerId,
            beneficiaryIds,
            groupId,
            catalogId,
        });

        // 5. Persist
        const savedTask = await this.taskRepository.save(task);

        // 6. Return DTO
        return {
            id: savedTask.id,
            value: savedTask.value,
            doerId: savedTask.userId,
            beneficiaryIds: [...savedTask.beneficiaryIds],
            groupId: savedTask.groupId,
            createdAt: savedTask.createdAt.toISOString(),
        };
    }
}
