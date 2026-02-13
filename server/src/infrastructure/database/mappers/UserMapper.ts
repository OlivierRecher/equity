import type { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/User.js';

export class UserMapper {
    /**
     * Converts a Prisma User to a Domain User entity.
     */
    static toDomain(prismaUser: PrismaUser): User {
        return new User({
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
        });
    }
}
