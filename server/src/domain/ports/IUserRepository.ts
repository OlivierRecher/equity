import type { User } from '../entities/User.js';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByGroupId(groupId: string): Promise<User[]>;
    save(user: User): Promise<User>;
    update(id: string, data: { name?: string; email?: string; passwordHash?: string }): Promise<User>;
}
