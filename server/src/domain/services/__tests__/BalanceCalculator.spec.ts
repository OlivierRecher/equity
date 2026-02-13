import { describe, it, expect, beforeEach } from 'vitest';
import { BalanceCalculator } from '../BalanceCalculator';
import { User } from '../../entities/User';
import { Task } from '../../entities/Task';

describe('BalanceCalculator', () => {
    let calculator: BalanceCalculator;

    // Helper: quickly create a User
    const createUser = (id: string, name?: string): User =>
        new User({ id, name: name ?? `User ${id}`, email: `${id}@test.com` });

    // Helper: quickly create a Task
    const createTask = (
        id: string,
        value: number,
        userId: string,
        beneficiaryIds: string[],
    ): Task =>
        new Task({ id, value, userId, beneficiaryIds, groupId: 'group-1' });

    beforeEach(() => {
        calculator = new BalanceCalculator();
    });

    // ─────────────────────────────────────────────────
    // INVARIANT CRITIQUE : Σ balances === 0
    // ─────────────────────────────────────────────────

    const assertSumIsZero = (balances: Map<string, { balance: number }>) => {
        let sum = 0;
        for (const b of balances.values()) {
            sum += b.balance;
        }
        // Use toBeCloseTo to handle floating-point precision
        expect(sum).toBeCloseTo(0, 10);
    };

    // ─────────────────────────────────────────────────
    // 1. Tâche simple
    // ─────────────────────────────────────────────────

    describe('Simple task calculation', () => {
        it('should correctly compute balances for a single task with 2 beneficiaries', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const users = [alice, bob];

            // Alice does the dishes (10 pts), both benefit
            const tasks = [createTask('t1', 10, 'alice', ['alice', 'bob'])];

            const balances = calculator.calculateBalances(users, tasks);

            // Alice: generated=10, consumed=5 → balance=+5
            const aliceBalance = balances.get('alice')!;
            expect(aliceBalance.pointsGenerated).toBe(10);
            expect(aliceBalance.pointsConsumed).toBe(5);
            expect(aliceBalance.balance).toBe(5);

            // Bob: generated=0, consumed=5 → balance=-5
            const bobBalance = balances.get('bob')!;
            expect(bobBalance.pointsGenerated).toBe(0);
            expect(bobBalance.pointsConsumed).toBe(5);
            expect(bobBalance.balance).toBe(-5);

            assertSumIsZero(balances);
        });

        it('should correctly compute balances for a task with 3 beneficiaries', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            // Bob cooks (30 pts), all 3 benefit → cost = 30/3 = 10 each
            const tasks = [createTask('t1', 30, 'bob', ['alice', 'bob', 'charlie'])];

            const balances = calculator.calculateBalances(users, tasks);

            // Alice: 0 - 10 = -10
            expect(balances.get('alice')!.balance).toBe(-10);
            // Bob: 30 - 10 = +20
            expect(balances.get('bob')!.balance).toBe(20);
            // Charlie: 0 - 10 = -10
            expect(balances.get('charlie')!.balance).toBe(-10);

            assertSumIsZero(balances);
        });
    });

    // ─────────────────────────────────────────────────
    // 2. Gestion des absences
    // ─────────────────────────────────────────────────

    describe('Absence handling', () => {
        it('an absent user (not in beneficiaryIds) should pay nothing', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            // Alice does task (20 pts), but Charlie is absent → only Alice & Bob benefit
            const tasks = [createTask('t1', 20, 'alice', ['alice', 'bob'])];

            const balances = calculator.calculateBalances(users, tasks);

            // Alice: 20 - 10 = +10
            expect(balances.get('alice')!.balance).toBe(10);
            // Bob: 0 - 10 = -10
            expect(balances.get('bob')!.balance).toBe(-10);
            // Charlie: absent → 0
            expect(balances.get('charlie')!.balance).toBe(0);
            expect(balances.get('charlie')!.pointsConsumed).toBe(0);

            assertSumIsZero(balances);
        });

        it('cost should be divided only among present members', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            // Task: 30 pts, 2 present → cost = 15 each, NOT 10 each
            const tasks = [createTask('t1', 30, 'alice', ['alice', 'bob'])];

            const balances = calculator.calculateBalances(users, tasks);

            expect(balances.get('alice')!.pointsConsumed).toBe(15);
            expect(balances.get('bob')!.pointsConsumed).toBe(15);
            expect(balances.get('charlie')!.pointsConsumed).toBe(0);

            assertSumIsZero(balances);
        });
    });

    // ─────────────────────────────────────────────────
    // 3. Invariant : Σ soldes === 0
    // ─────────────────────────────────────────────────

    describe('Invariant: sum of all balances must equal 0', () => {
        it('should hold for zero tasks', () => {
            const users = [createUser('alice'), createUser('bob')];
            const balances = calculator.calculateBalances(users, []);
            assertSumIsZero(balances);
        });

        it('should hold for a complex multi-task scenario', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            const tasks = [
                createTask('t1', 10, 'alice', ['alice', 'bob', 'charlie']),
                createTask('t2', 20, 'bob', ['alice', 'bob']),
                createTask('t3', 15, 'charlie', ['bob', 'charlie']),
                createTask('t4', 25, 'alice', ['alice', 'bob', 'charlie']),
                createTask('t5', 5, 'bob', ['charlie']),
            ];

            const balances = calculator.calculateBalances(users, tasks);
            assertSumIsZero(balances);
        });

        it('should hold when a doer is not among beneficiaries', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            // Alice does the task but only Bob and Charlie benefit
            const tasks = [createTask('t1', 20, 'alice', ['bob', 'charlie'])];

            const balances = calculator.calculateBalances(users, tasks);

            // Alice: +20 generated, 0 consumed → +20
            expect(balances.get('alice')!.balance).toBe(20);
            // Bob: 0 generated, 10 consumed → -10
            expect(balances.get('bob')!.balance).toBe(-10);
            // Charlie: 0 generated, 10 consumed → -10
            expect(balances.get('charlie')!.balance).toBe(-10);

            assertSumIsZero(balances);
        });

        it('should hold with fractional divisions (odd splits)', () => {
            const users = [createUser('a'), createUser('b'), createUser('c')];

            // 10 / 3 = 3.333... per beneficiary → must still sum to 0
            const tasks = [createTask('t1', 10, 'a', ['a', 'b', 'c'])];

            const balances = calculator.calculateBalances(users, tasks);
            assertSumIsZero(balances);
        });
    });

    // ─────────────────────────────────────────────────
    // 4. Edge cases
    // ─────────────────────────────────────────────────

    describe('Edge cases', () => {
        it('should return empty map when no users and no tasks', () => {
            const balances = calculator.calculateBalances([], []);
            expect(balances.size).toBe(0);
        });

        it('should return zero balance for a single user with no tasks', () => {
            const users = [createUser('alice')];
            const balances = calculator.calculateBalances(users, []);

            expect(balances.get('alice')!.balance).toBe(0);
            expect(balances.get('alice')!.pointsGenerated).toBe(0);
            expect(balances.get('alice')!.pointsConsumed).toBe(0);
        });

        it('should return zero balance when a single user does a task for themselves', () => {
            const users = [createUser('alice')];
            const tasks = [createTask('t1', 50, 'alice', ['alice'])];

            const balances = calculator.calculateBalances(users, tasks);

            // Alice does and benefits alone: 50 - 50 = 0
            expect(balances.get('alice')!.balance).toBe(0);
            expect(balances.get('alice')!.pointsGenerated).toBe(50);
            expect(balances.get('alice')!.pointsConsumed).toBe(50);
        });

        it('should handle a task with value 0', () => {
            const users = [createUser('alice'), createUser('bob')];
            const tasks = [createTask('t1', 0, 'alice', ['alice', 'bob'])];

            const balances = calculator.calculateBalances(users, tasks);

            expect(balances.get('alice')!.balance).toBe(0);
            expect(balances.get('bob')!.balance).toBe(0);

            assertSumIsZero(balances);
        });
    });

    // ─────────────────────────────────────────────────
    // 5. Scénario réaliste : colocation
    // ─────────────────────────────────────────────────

    describe('Realistic scenario: shared flat', () => {
        it('should compute correct balances over a week of tasks', () => {
            const alice = createUser('alice', 'Alice');
            const bob = createUser('bob', 'Bob');
            const charlie = createUser('charlie', 'Charlie');
            const users = [alice, bob, charlie];

            const tasks = [
                // Monday: Alice does dishes (10), everyone benefits
                createTask('t1', 10, 'alice', ['alice', 'bob', 'charlie']),
                // Tuesday: Bob cooks (20), everyone benefits
                createTask('t2', 20, 'bob', ['alice', 'bob', 'charlie']),
                // Wednesday: Charlie vacuums (15), Alice is absent
                createTask('t3', 15, 'charlie', ['bob', 'charlie']),
                // Thursday: Alice cooks (20), Charlie is absent
                createTask('t4', 20, 'alice', ['alice', 'bob']),
                // Friday: Bob takes out trash (5), just for himself & Alice
                createTask('t5', 5, 'bob', ['alice', 'bob']),
            ];

            const balances = calculator.calculateBalances(users, tasks);

            // Manual calculation:
            // Alice generated: 10 + 20 = 30
            // Alice consumed: 10/3 + 20/3 + 20/2 + 5/2 = 3.333 + 6.667 + 10 + 2.5 = 22.5
            // Alice balance: 30 - 22.5 = 7.5
            expect(balances.get('alice')!.pointsGenerated).toBe(30);
            expect(balances.get('alice')!.pointsConsumed).toBeCloseTo(22.5, 10);
            expect(balances.get('alice')!.balance).toBeCloseTo(7.5, 10);

            // Bob generated: 20 + 5 = 25
            // Bob consumed: 10/3 + 20/3 + 15/2 + 20/2 + 5/2 = 3.333 + 6.667 + 7.5 + 10 + 2.5 = 30
            expect(balances.get('bob')!.pointsGenerated).toBe(25);
            expect(balances.get('bob')!.pointsConsumed).toBeCloseTo(30, 10);
            expect(balances.get('bob')!.balance).toBeCloseTo(-5, 10);

            // Charlie generated: 15
            // Charlie consumed: 10/3 + 20/3 + 15/2 = 3.333 + 6.667 + 7.5 = 17.5
            expect(balances.get('charlie')!.pointsGenerated).toBe(15);
            expect(balances.get('charlie')!.pointsConsumed).toBeCloseTo(17.5, 10);
            expect(balances.get('charlie')!.balance).toBeCloseTo(-2.5, 10);

            assertSumIsZero(balances);
        });
    });

    // ─────────────────────────────────────────────────
    // 6. Suggestion du prochain doer
    // ─────────────────────────────────────────────────

    describe('getSuggestedNextDoer', () => {
        it('should suggest the user with the lowest balance', () => {
            const alice = createUser('alice');
            const bob = createUser('bob');
            const charlie = createUser('charlie');
            const users = [alice, bob, charlie];

            // Alice does everything → Bob and Charlie owe
            const tasks = [
                createTask('t1', 30, 'alice', ['alice', 'bob', 'charlie']),
            ];

            const suggested = calculator.getSuggestedNextDoer(users, tasks);

            // Bob and Charlie both at -10, either is valid (first found)
            expect(suggested).not.toBeNull();
            expect(['bob', 'charlie']).toContain(suggested!.id);
        });

        it('should return null for empty users', () => {
            const suggested = calculator.getSuggestedNextDoer([], []);
            expect(suggested).toBeNull();
        });
    });
});
