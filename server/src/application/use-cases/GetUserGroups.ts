import type { IGroupRepository, UserGroupDTO } from '../../domain/ports/IGroupRepository.js';

/**
 * Use Case: GetUserGroups
 *
 * Returns all groups the authenticated user belongs to.
 */
export class GetUserGroups {
    constructor(private readonly groupRepository: IGroupRepository) { }

    async execute(userId: string): Promise<UserGroupDTO[]> {
        return this.groupRepository.findAllByUserId(userId);
    }
}
