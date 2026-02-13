import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../../../domain/ports/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { UserMapper } from '../mappers/UserMapper.js';

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { id },
        });

        return prismaUser ? UserMapper.toDomain(prismaUser) : null;
    }

    async findByGroupId(groupId: string): Promise<User[]> {
        const prismaUsers = await this.prisma.user.findMany({
            where: {
                memberships: {
                    some: { groupId },
                },
            },
        });

        return prismaUsers.map(UserMapper.toDomain);
    }
}
