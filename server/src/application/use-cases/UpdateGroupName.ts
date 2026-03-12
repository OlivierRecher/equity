import type { IGroupRepository, GroupDTO } from '../../domain/ports/IGroupRepository.js';

export class UpdateGroupName {
    constructor(private readonly groupRepository: IGroupRepository) {}

    async execute(input: { groupId: string; userId: string; name: string }): Promise<GroupDTO> {
        const { groupId, userId, name } = input;

        const role = await this.groupRepository.getMemberRole(groupId, userId);
        if (role !== 'ADMIN') {
            throw new Error('Only admins can rename the group');
        }

        return this.groupRepository.updateName(groupId, name);
    }
}
