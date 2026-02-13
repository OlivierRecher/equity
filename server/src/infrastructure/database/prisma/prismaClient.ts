import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

/**
 * Creates a configured PrismaClient instance for Prisma 7.
 * Uses the @prisma/adapter-pg driver adapter with a pg Pool.
 */
export function createPrismaClient(): PrismaClient {
    const connectionString = process.env['DATABASE_URL'];

    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}
