export interface GroupDTO {
    id: string;
    name: string;
    code: string;
}

export interface UserGroupDTO {
    id: string;
    name: string;
    code: string;
    role: string;
    memberCount: number;
}

/**
 * Repository port for Group-related queries.
 */
export interface IGroupRepository {
    /** Returns the first groupId a user belongs to, or null. */
    findFirstGroupIdByUserId(userId: string): Promise<string | null>;

    /** Find a group by its ID. */
    findById(id: string): Promise<GroupDTO | null>;

    /** Find a group by its invite code. */
    findByCode(code: string): Promise<GroupDTO | null>;

    /** Create a new group and return it. */
    create(data: { name: string; code: string }): Promise<GroupDTO>;

    /** Add a user as a member of a group. */
    addMember(groupId: string, userId: string, role: string): Promise<void>;

    /** Check if a user is already a member of a group. */
    isMember(groupId: string, userId: string): Promise<boolean>;

    /** Get all groups a user belongs to, with role and member count. */
    findAllByUserId(userId: string): Promise<UserGroupDTO[]>;
}
