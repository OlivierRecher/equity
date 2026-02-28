import express from 'express';
import cors from 'cors';

// Infrastructure
import { createPrismaClient } from '../../infrastructure/database/prisma/prismaClient.js';
import { PrismaTaskRepository } from '../../infrastructure/database/repositories/PrismaTaskRepository.js';
import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository.js';
import { PrismaCatalogRepository } from '../../infrastructure/database/repositories/PrismaCatalogRepository.js';
import { PrismaGroupRepository } from '../../infrastructure/database/repositories/PrismaGroupRepository.js';

// Application
import { GetGroupDashboard } from '../../application/use-cases/GetGroupDashboard.js';
import { CreateTask } from '../../application/use-cases/CreateTask.js';
import { UpdateCatalogItem } from '../../application/use-cases/UpdateCatalogItem.js';
import { CreateCatalogItem } from '../../application/use-cases/CreateCatalogItem.js';
import { RegisterUser } from '../../application/use-cases/RegisterUser.js';
import { LoginUser } from '../../application/use-cases/LoginUser.js';

// Interface
import { GroupController } from './controllers/GroupController.js';
import { AuthController } from './controllers/AuthController.js';
import { createGroupRoutes } from './routes/group.routes.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { errorHandler } from './middlewares/ErrorHandler.js';

// ─────────────────────────────────────────────────
// Composition Root (Dependency Injection)
// ─────────────────────────────────────────────────

const prisma = createPrismaClient();

// 1. Repositories (Infrastructure → implements Domain ports)
const taskRepository = new PrismaTaskRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const catalogRepository = new PrismaCatalogRepository(prisma);
const groupRepository = new PrismaGroupRepository(prisma);

// 2. Use Cases (Application → depends on Domain ports)
const getGroupDashboard = new GetGroupDashboard(userRepository, taskRepository, catalogRepository);
const createTask = new CreateTask(userRepository, taskRepository);
const updateCatalogItem = new UpdateCatalogItem(catalogRepository);
const createCatalogItem = new CreateCatalogItem(catalogRepository);
const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository, groupRepository);

// 3. Controllers (Interface → depends on Use Cases)
const groupController = new GroupController(getGroupDashboard, createTask, updateCatalogItem, createCatalogItem);
const authController = new AuthController(registerUser, loginUser);

// ─────────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────────

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (auth is NOT behind SimpleAuthMiddleware)
app.use('/auth', createAuthRoutes(authController));
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
    console.log(`🔑 Auth: POST http://localhost:${PORT}/auth/register | /auth/login`);
});

export default app;
