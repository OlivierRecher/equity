import type { ITaskRepository } from '../../domain/ports/ITaskRepository.js';
import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import { BalanceCalculator } from '../../domain/services/BalanceCalculator.js';
import type { GroupDashboardDTO, UserBalanceDTO } from '../dtos/GetGroupDashboardDTO.js';

/**
 * Use Case: GetGroupDashboard
 *
 * Orchestrates fetching users and tasks for a group, computing balances
 * via the domain BalanceCalculator, and returning a clean DTO.
 *
 * Dependencies: only domain ports and domain services — NO Prisma imports.
 */
export class GetGroupDashboard {
    private readonly balanceCalculator: BalanceCalculator;

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly taskRepository: ITaskRepository,
    ) {
        this.balanceCalculator = new BalanceCalculator();
    }

    async execute(groupId: string): Promise<GroupDashboardDTO> {
        // 1. Fetch users and tasks via repository ports
        const [users, tasks] = await Promise.all([
            this.userRepository.findByGroupId(groupId),
            this.taskRepository.findByGroupId(groupId),
        ]);

        // 2. Compute balances using domain service
        const balancesMap = this.balanceCalculator.calculateBalances(users, tasks);

        // 3. Get suggested next doer
        const suggestedUser = this.balanceCalculator.getSuggestedNextDoer(users, tasks);

        // 4. Map to output DTO
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

        // Sort by balance ascending (most negative first = owes the most)
        balances.sort((a, b) => a.balance - b.balance);

        return {
            groupId,
            balances,
            suggestedNextDoer: suggestedUser
                ? { userId: suggestedUser.id, userName: suggestedUser.name }
                : null,
        };
    }
}
