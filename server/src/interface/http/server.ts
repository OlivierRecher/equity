import express from 'express';

// Infrastructure
import { createPrismaClient } from '../../infrastructure/database/prisma/prismaClient.js';
import { PrismaTaskRepository } from '../../infrastructure/database/repositories/PrismaTaskRepository.js';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository.js';

// Application
import { GetGroupDashboard } from '../../application/use-cases/GetGroupDashboard.js';

// Interface
import { GroupController } from './controllers/GroupController.js';
import { createGroupRoutes } from './routes/group.routes.js';
import { errorHandler } from './middlewares/ErrorHandler.js';

// ─────────────────────────────────────────────────
// Composition Root (Dependency Injection)
// ─────────────────────────────────────────────────

const prisma = createPrismaClient();

// 1. Repositories (Infrastructure → implements Domain ports)
const taskRepository = new PrismaTaskRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

// 2. Use Cases (Application → depends on Domain ports)
const getGroupDashboard = new GetGroupDashboard(userRepository, taskRepository);

// 3. Controllers (Interface → depends on Use Cases)
const groupController = new GroupController(getGroupDashboard);

// ─────────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────────

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/groups', createGroupRoutes(groupController));

// Global error handler (must be registered AFTER routes)
app.use(errorHandler);

// ─────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────

const PORT = process.env['PORT'] ?? 3000;

app.listen(PORT, () => {
    console.log(`🚀 EQUITY API running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: GET http://localhost:${PORT}/groups/:groupId/dashboard`);
});

export default app;
