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

    async findByEmail(email: string): Promise<User | null> {
        const prismaUser = await this.prisma.user.findUnique({
            where: { email },
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

    async save(user: User): Promise<User> {
        const prismaUser = await this.prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                passwordHash: user.passwordHash ?? '',
            },
        });

        return UserMapper.toDomain(prismaUser);
    }
}
