import type { Task as PrismaTask, TaskBeneficiary as PrismaTaskBeneficiary } from '@prisma/client';
import { Task } from '../../../domain/entities/Task.js';

/**
 * Type that represents a Prisma Task with its beneficiaries joined.
 * This is the shape returned by `prisma.task.findMany({ include: { beneficiaries: true } })`.
 */
export type PrismaTaskWithBeneficiaries = PrismaTask & {
    beneficiaries: PrismaTaskBeneficiary[];
};

export class TaskMapper {
    /**
     * Converts a Prisma Task (with beneficiaries) to a Domain Task entity.
     */
    static toDomain(prismaTask: PrismaTaskWithBeneficiaries): Task {
        return new Task({
            id: prismaTask.id,
            value: prismaTask.value,
            userId: prismaTask.userId,
            beneficiaryIds: prismaTask.beneficiaries.map((b) => b.userId),
            groupId: prismaTask.groupId,
            catalogId: prismaTask.catalogId ?? undefined,
            createdAt: prismaTask.createdAt,
        });
    }

    /**
     * Converts a Domain Task entity to Prisma create input.
     */
    static toPrismaCreate(task: Task) {
        return {
            id: task.id,
            value: task.value,
            userId: task.userId,
            groupId: task.groupId,
            catalogId: task.catalogId ?? null,
            createdAt: task.createdAt,
            beneficiaries: {
                create: task.beneficiaryIds.map((userId) => ({
                    userId,
                })),
            },
        };
    }
}
