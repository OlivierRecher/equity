import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';

export interface GroupMemberDTO {
    userId: string;
    userName: string;
    role: string;
}

export class GetGroupMembers {
    constructor(private readonly groupRepository: IGroupRepository) {}

    async execute(groupId: string): Promise<GroupMemberDTO[]> {
        return this.groupRepository.getMembers(groupId);
    }
}
