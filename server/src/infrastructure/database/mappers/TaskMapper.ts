import type { Task as PrismaTask, TaskBeneficiary as PrismaTaskBeneficiary, TaskDoer as PrismaTaskDoer } from '@prisma/client';
import { Task } from '../../../domain/entities/Task.js';

/**
 * Type that represents a Prisma Task with its beneficiaries and doers joined.
 */
export type PrismaTaskWithRelations = PrismaTask & {
    beneficiaries: PrismaTaskBeneficiary[];
    doers: PrismaTaskDoer[];
};

export class TaskMapper {
    /**
     * Converts a Prisma Task (with relations) to a Domain Task entity.
     */
    static toDomain(prismaTask: PrismaTaskWithRelations): Task {
        return new Task({
            id: prismaTask.id,
            value: prismaTask.value,
            doerIds: prismaTask.doers.map((d) => d.userId),
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
            groupId: task.groupId,
            catalogId: task.catalogId ?? null,
            createdAt: task.createdAt,
            doers: {
                create: task.doerIds.map((userId) => ({
                    userId,
                })),
            },
            beneficiaries: {
                create: task.beneficiaryIds.map((userId) => ({
                    userId,
                })),
            },
        };
    }
}
