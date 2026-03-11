import { createPrismaClient } from './src/infrastructure/database/prisma/prismaClient';
import { PrismaGroupRepository } from './src/infrastructure/database/repositories/PrismaGroupRepository';
import { PrismaCatalogRepository } from './src/infrastructure/database/repositories/PrismaCatalogRepository';
import { CreateGroup } from './src/application/use-cases/CreateGroup';

async function test() {
    const prisma = createPrismaClient();
    const groupRepo = new PrismaGroupRepository(prisma);
    const catalogRepo = new PrismaCatalogRepository(prisma);
    const useCase = new CreateGroup(groupRepo, catalogRepo);
    try {
        const res = await useCase.execute({ name: 'Test Group', userId: 'user-alice', template: 'coloc' });
        console.log("Success:", res);
    } catch(e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
