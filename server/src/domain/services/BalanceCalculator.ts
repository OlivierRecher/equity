import type { User } from '../entities/User.js';
import type { Task } from '../entities/Task.js';

export interface UserBalance {
    readonly userId: string;
    readonly pointsGenerated: number;
    readonly pointsConsumed: number;
    readonly balance: number;
}

/**
 * BalanceCalculator — Pure domain service for computing user balances.
 *
 * Algorithm (from AGENT.md §3.C):
 *   Balance(U) = Total_Points_Generated(U) - Total_Points_Consumed(U)
 *
 *   Points Generated = Σ task.value (for each task where U is the doer)
 *   Points Consumed  = Σ (task.value / nb_beneficiaries) (for each task where U is a beneficiary)
 *
 * Complexity: O(users + tasks × avg_beneficiaries), effectively O(n).
 * No external dependencies.
 */
export class BalanceCalculator {
    /**
     * Calculates the balance for each user based on the tasks performed.
     *
     * @param users - All users in the group
     * @param tasks - All tasks in the group (with frozen snapshot values)
     * @returns Map of userId → balance (positive = has contributed more, negative = owes effort)
     */
    calculateBalances(users: readonly User[], tasks: readonly Task[]): Map<string, UserBalance> {
        // Initialize balances for all users
        const balances = new Map<string, UserBalance>();

        for (const user of users) {
            balances.set(user.id, {
                userId: user.id,
                pointsGenerated: 0,
                pointsConsumed: 0,
                balance: 0,
            });
        }

        // Single pass over tasks: accumulate generated and consumed points
        for (const task of tasks) {
            const costPerBeneficiary = task.value / task.beneficiaryIds.length;

            // Points generated for the doer
            const doerBalance = balances.get(task.userId);
            if (doerBalance) {
                balances.set(task.userId, {
                    ...doerBalance,
                    pointsGenerated: doerBalance.pointsGenerated + task.value,
                    balance: doerBalance.balance + task.value,
                });
            }

            // Points consumed for each beneficiary
            for (const beneficiaryId of task.beneficiaryIds) {
                const beneficiaryBalance = balances.get(beneficiaryId);
                if (beneficiaryBalance) {
                    balances.set(beneficiaryId, {
                        ...beneficiaryBalance,
                        pointsConsumed: beneficiaryBalance.pointsConsumed + costPerBeneficiary,
                        balance: beneficiaryBalance.balance - costPerBeneficiary,
                    });
                }
            }
        }

        return balances;
    }

    /**
     * Returns the user with the lowest balance (most negative = owes the most effort).
     * Useful for suggesting who should do the next task.
     */
    getSuggestedNextDoer(users: readonly User[], tasks: readonly Task[]): User | null {
        if (users.length === 0) return null;

        const balances = this.calculateBalances(users, tasks);
        let lowestUser: User | null = null;
        let lowestBalance = Infinity;

        for (const user of users) {
            const userBalance = balances.get(user.id);
            if (userBalance && userBalance.balance < lowestBalance) {
                lowestBalance = userBalance.balance;
                lowestUser = user;
            }
        }

        return lowestUser;
    }
}
