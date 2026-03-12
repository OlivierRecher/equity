import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

export class RemoveGroupMember {
    constructor(private readonly groupRepository: IGroupRepository) {}

    async execute(input: { groupId: string; userId: string; targetUserId: string }): Promise<void> {
        const { groupId, userId, targetUserId } = input;

        const role = await this.groupRepository.getMemberRole(groupId, userId);
        if (role !== 'ADMIN') {
            throw new Error('Only admins can remove members');
        }

        if (userId === targetUserId) {
            throw new Error('You cannot remove yourself from the group');
        }

        await this.groupRepository.removeMember(groupId, targetUserId);
    }
}
