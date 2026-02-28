import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';
import { DomainError, EntityNotFoundError } from '../../domain/errors/DomainError.js';

export interface JoinGroupInput {
    code: string;
    userId: string;
}

export interface JoinGroupOutput {
    groupId: string;
    groupName: string;
}

/**
 * Use Case: JoinGroup
 *
 * 1. Find group by invite code
 * 2. Check user is not already a member
 * 3. Add user as MEMBER
 */
export class JoinGroup {
    constructor(private readonly groupRepository: IGroupRepository) { }

    async execute(input: JoinGroupInput): Promise<JoinGroupOutput> {
        const { code, userId } = input;

        // 1. Find group
        const group = await this.groupRepository.findByCode(code.toUpperCase());
        if (!group) {
            throw new EntityNotFoundError('Space', code);
        }

        // 2. Check duplicate membership
        const alreadyMember = await this.groupRepository.isMember(group.id, userId);
        if (alreadyMember) {
            throw new DomainError('Tu fais déjà partie de cet espace');
        }

        // 3. Add as MEMBER
        await this.groupRepository.addMember(group.id, userId, 'MEMBER');

        return { groupId: group.id, groupName: group.name };
    }
}
