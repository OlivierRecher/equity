import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { ICatalogRepository } from '../../domain/ports/ICatalogRepository.js';
import type { IGroupRepository } from '../../domain/ports/IGroupRepository.js';
import { BalanceCalculator } from '../../domain/services/BalanceCalculator.js';
import type {
    GroupDashboardDTO,
    GroupMemberDTO,
    UserBalanceDTO,
    TaskHistoryItemDTO,
    CatalogItemDTO,
} from '../dtos/GetGroupDashboardDTO.js';

/**
 * Use Case: GetGroupDashboard
 *
 * Orchestrates fetching users, tasks, and catalog for a group,
 * computes balances, and returns a complete dashboard DTO
 * including history and catalog.
 */
export class GetGroupDashboard {
    private readonly balanceCalculator: BalanceCalculator;

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
        private readonly catalogRepository: ICatalogRepository,
        private readonly groupRepository: IGroupRepository,
    ) {
        this.balanceCalculator = new BalanceCalculator();
    }

    async execute(groupId: string, userId?: string): Promise<GroupDashboardDTO> {
        // 1. Fetch all data in parallel
        const [users, tasks, catalogItems, allCatalogItems, group, role, membersWithRoles] = await Promise.all([
            this.userRepository.findByGroupId(groupId),
            this.taskRepository.findByGroupId(groupId),
            this.catalogRepository.findByGroupId(groupId),
            this.catalogRepository.findAllByGroupId(groupId),
            this.groupRepository.findById(groupId),
            userId ? this.groupRepository.getMemberRole(groupId, userId) : Promise.resolve(null),
            this.groupRepository.getMembers(groupId),
        ]);

        // 2. Compute balances using domain service
        const balancesMap = this.balanceCalculator.calculateBalances(users, tasks);

        // 3. Get suggested next doer
        const suggestedUser = this.balanceCalculator.getSuggestedNextDoer(users, tasks);

        // 4. Build user lookup for history (use all catalog items including deleted for name resolution)
        const userMap = new Map(users.map((u) => [u.id, u.name]));
        const catalogMap = new Map(allCatalogItems.map((c) => [c.id, c.name]));

        // 5. Map balances to DTO
        const balances: UserBalanceDTO[] = users.map((user) => {
            const userBalance = balancesMap.get(user.id);
            return {
                userId: user.id,
                userName: user.name,
                pointsGenerated: userBalance?.pointsGenerated ?? 0,
                pointsConsumed: userBalance?.pointsConsumed ?? 0,
                balance: userBalance?.balance ?? 0,
            };
        });

        // Sort by balance ascending (most negative first)
        balances.sort((a, b) => a.balance - b.balance);

        // 6. Build history (last 20 tasks, most recent first)
        const sortedTasks = [...tasks].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );

        const history: TaskHistoryItemDTO[] = sortedTasks.slice(0, 20).map((task) => ({
            id: task.id,
            taskName: task.catalogId
                ? catalogMap.get(task.catalogId) ?? 'Tâche'
                : 'Tâche',
            doerIds: [...task.doerIds],
            doerNames: task.doerIds.map(id => userMap.get(id) ?? 'Inconnu'),
            value: task.value,
            date: task.createdAt.toISOString(),
            catalogId: task.catalogId,
            beneficiaryIds: [...task.beneficiaryIds],
        }));

        // 7. Build catalog DTO
        const catalog: CatalogItemDTO[] = catalogItems.map((item) => ({
            id: item.id,
            name: item.name,
            defaultValue: item.defaultValue,
            icon: item.icon,
        }));

        const members: GroupMemberDTO[] = membersWithRoles;

        return {
            groupId,
            groupName: group?.name ?? 'Mon espace',
            groupCode: group?.code ?? '',
            role: role ?? undefined,
            members,
            balances,
            suggestedNextDoer: suggestedUser
                ? { userId: suggestedUser.id, userName: suggestedUser.name }
                : null,
            history,
            catalog,
        };
    }
}
