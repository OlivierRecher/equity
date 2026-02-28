import 'dotenv/config';
import { hashSync } from 'bcryptjs';
import { createPrismaClient } from '../src/infrastructure/database/prisma/prismaClient';

const prisma = createPrismaClient();

// Pre-computed hash for test password "password123"
const testPasswordHash = hashSync('password123', 10);

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data (in correct order for FK constraints)
    await prisma.taskBeneficiary.deleteMany();
    await prisma.task.deleteMany();
    await prisma.catalog.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();

    // ─────────────────────────────────────────────
    // 1. Create Users
    // ─────────────────────────────────────────────

    const alice = await prisma.user.create({
        data: {
            id: 'user-alice',
            email: 'alice@equity.app',
            name: 'Alice',
            passwordHash: testPasswordHash,
        },
    });

    const bob = await prisma.user.create({
        data: {
            id: 'user-bob',
            email: 'bob@equity.app',
            name: 'Bob',
            passwordHash: testPasswordHash,
        },
    });

    const charlie = await prisma.user.create({
        data: {
            id: 'user-charlie',
            email: 'charlie@equity.app',
            name: 'Charlie',
            passwordHash: testPasswordHash,
        },
    });

    console.log(`  ✅ Created 3 users: ${alice.name}, ${bob.name}, ${charlie.name}`);

    // ─────────────────────────────────────────────
    // 2. Create Group
    // ─────────────────────────────────────────────

    const group = await prisma.group.create({
        data: {
            id: 'group-coloc',
            name: 'Coloc Test',
            code: 'COLOC42',
        },
    });

    console.log(`  ✅ Created group: ${group.name} (code: ${group.code})`);

    // ─────────────────────────────────────────────
    // 3. Add Members to Group
    // ─────────────────────────────────────────────

    await prisma.groupMember.createMany({
        data: [
            { userId: alice.id, groupId: group.id, role: 'ADMIN' },
            { userId: bob.id, groupId: group.id, role: 'MEMBER' },
            { userId: charlie.id, groupId: group.id, role: 'MEMBER' },
        ],
    });

    console.log('  ✅ Added 3 members to group');

    // ─────────────────────────────────────────────
    // 4. Create Catalog Items
    // ─────────────────────────────────────────────

    const dishwashing = await prisma.catalog.create({
        data: {
            id: 'catalog-dishes',
            name: 'Vaisselle',
            defaultValue: 10,
            icon: '🍽️',
            groupId: group.id,
        },
    });

    const trash = await prisma.catalog.create({
        data: {
            id: 'catalog-trash',
            name: 'Poubelles',
            defaultValue: 5,
            icon: '🗑️',
            groupId: group.id,
        },
    });

    const cooking = await prisma.catalog.create({
        data: {
            id: 'catalog-cooking',
            name: 'Cuisine',
            defaultValue: 20,
            icon: '🍳',
            groupId: group.id,
        },
    });

    console.log('  ✅ Created 3 catalog items');

    // ─────────────────────────────────────────────
    // 5. Create Tasks (with Beneficiaries)
    // ─────────────────────────────────────────────

    // Task 1: Alice does dishes (10 pts) → everyone benefits
    await prisma.task.create({
        data: {
            id: 'task-1',
            value: 10,
            userId: alice.id,
            groupId: group.id,
            catalogId: dishwashing.id,
            beneficiaries: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                    { userId: charlie.id },
                ],
            },
        },
    });

    // Task 2: Bob takes out trash (5 pts) → only Alice & Bob benefit (Charlie absent)
    await prisma.task.create({
        data: {
            id: 'task-2',
            value: 5,
            userId: bob.id,
            groupId: group.id,
            catalogId: trash.id,
            beneficiaries: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                ],
            },
        },
    });

    // Task 3: Alice cooks (20 pts) → everyone benefits
    await prisma.task.create({
        data: {
            id: 'task-3',
            value: 20,
            userId: alice.id,
            groupId: group.id,
            catalogId: cooking.id,
            beneficiaries: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                    { userId: charlie.id },
                ],
            },
        },
    });

    // Task 4: Charlie does dishes (10 pts) → only Bob & Charlie (Alice absent)
    await prisma.task.create({
        data: {
            id: 'task-4',
            value: 10,
            userId: charlie.id,
            groupId: group.id,
            catalogId: dishwashing.id,
            beneficiaries: {
                create: [
                    { userId: bob.id },
                    { userId: charlie.id },
                ],
            },
        },
    });

    console.log('  ✅ Created 4 tasks with beneficiaries');

    // ─────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────

    console.log('\n📊 Expected balances:');
    console.log('  Alice:   generated=30, consumed=10/3 + 5/2 + 20/3 = 12.83 → balance=+17.17');
    console.log('  Bob:     generated=5,  consumed=10/3 + 5/2 + 20/3 + 10/2 = 17.83 → balance=-12.83');
    console.log('  Charlie: generated=10, consumed=10/3 + 20/3 + 10/2 = 15.00 → balance=-5.00');
    console.log('  (Σ ≈ 0 ✓)');
    console.log(`\n🎯 Test URL: GET http://localhost:3000/groups/${group.id}/dashboard`);
    console.log('\n✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
