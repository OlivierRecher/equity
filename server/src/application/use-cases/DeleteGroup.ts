import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

export class DeleteGroup {
    constructor(private readonly groupRepository: IGroupRepository) {}

    async execute(input: { groupId: string; userId: string }): Promise<void> {
        const { groupId, userId } = input;

        const role = await this.groupRepository.getMemberRole(groupId, userId);
        if (role !== 'ADMIN') {
            throw new Error('Only admins can delete the group');
        }

        await this.groupRepository.delete(groupId);
    }
}
