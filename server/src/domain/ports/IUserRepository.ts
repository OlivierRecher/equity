import type { User } from '../entities/User.js';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByGroupId(groupId: string): Promise<User[]>;
}
