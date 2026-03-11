import type { PrismaClient } from '@prisma/client';
import type { ITaskRepository } from '../../../domain/ports/ITaskRepository.js';
import type { Task } from '../../../domain/entities/Task.js';
import { TaskMapper } from '../mappers/TaskMapper.js';

export class PrismaTaskRepository implements ITaskRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByGroupId(groupId: string): Promise<Task[]> {
        const prismaTasks = await this.prisma.task.findMany({
            where: { groupId },
            include: { beneficiaries: true, doers: true },
            orderBy: { createdAt: 'desc' },
        });

        return prismaTasks.map(TaskMapper.toDomain);
    }

    async findById(taskId: string): Promise<Task | null> {
        const prismaTask = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: { beneficiaries: true, doers: true },
        });

        return prismaTask ? TaskMapper.toDomain(prismaTask) : null;
    }

    async save(task: Task): Promise<Task> {
        const data = TaskMapper.toPrismaCreate(task);

        const savedTask = await this.prisma.task.create({
            data,
            include: { beneficiaries: true, doers: true },
        });

        return TaskMapper.toDomain(savedTask);
    }

    async delete(taskId: string): Promise<void> {
        await this.prisma.task.delete({
            where: { id: taskId },
        });
    }
}
