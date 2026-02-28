import type { PrismaClient } from '@prisma/client';
import type { IGroupRepository } from '../../../domain/ports/IGroupRepository.js';

export class PrismaGroupRepository implements IGroupRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findFirstGroupIdByUserId(userId: string): Promise<string | null> {
        const membership = await this.prisma.groupMember.findFirst({
            where: { userId },
            select: { groupId: true },
            orderBy: { joinedAt: 'asc' },
        });

        return membership?.groupId ?? null;
    }
}
