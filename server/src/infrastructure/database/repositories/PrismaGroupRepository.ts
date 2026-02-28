import type { PrismaClient } from '@prisma/client';
import type { IGroupRepository, GroupDTO, UserGroupDTO } from '../../../domain/ports/IGroupRepository.js';

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

    async findById(id: string): Promise<GroupDTO | null> {
        const group = await this.prisma.group.findUnique({
            where: { id },
            select: { id: true, name: true, code: true },
        });

        return group ?? null;
    }

    async findByCode(code: string): Promise<GroupDTO | null> {
        const group = await this.prisma.group.findUnique({
            where: { code },
            select: { id: true, name: true, code: true },
        });

        return group ?? null;
    }

    async create(data: { name: string; code: string }): Promise<GroupDTO> {
        const group = await this.prisma.group.create({
            data: { name: data.name, code: data.code },
            select: { id: true, name: true, code: true },
        });

        return group;
    }

    async addMember(groupId: string, userId: string, role: string): Promise<void> {
        await this.prisma.groupMember.create({
            data: { groupId, userId, role },
        });
    }

    async isMember(groupId: string, userId: string): Promise<boolean> {
        const membership = await this.prisma.groupMember.findUnique({
            where: { userId_groupId: { userId, groupId } },
        });

        return membership !== null;
    }

    async findAllByUserId(userId: string): Promise<UserGroupDTO[]> {
        const memberships = await this.prisma.groupMember.findMany({
            where: { userId },
            orderBy: { joinedAt: 'asc' },
            select: {
                role: true,
                group: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        _count: { select: { memberships: true } },
                    },
                },
            },
        });

        return memberships.map((m) => ({
            id: m.group.id,
            name: m.group.name,
            code: m.group.code,
            role: m.role,
            memberCount: m.group._count.memberships,
        }));
    }
}
