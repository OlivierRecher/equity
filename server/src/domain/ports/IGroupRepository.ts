/**
 * Repository port for Group-related queries.
 */
export interface IGroupRepository {
    /** Returns the first groupId a user belongs to, or null. */
    findFirstGroupIdByUserId(userId: string): Promise<string | null>;
}
