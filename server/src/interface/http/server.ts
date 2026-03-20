import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
import { CreateGroup } from '../../application/use-cases/CreateGroup.js';
import { GetUserGroups } from '../../application/use-cases/GetUserGroups.js';
import { JoinGroup } from '../../application/use-cases/JoinGroup.js';
import { DeleteTask } from '../../application/use-cases/DeleteTask.js';
import { UpdateTask } from '../../application/use-cases/UpdateTask.js';
import { UpdateGroupName } from '../../application/use-cases/UpdateGroupName.js';
import { GetGroupMembers } from '../../application/use-cases/GetGroupMembers.js';
import { RemoveGroupMember } from '../../application/use-cases/RemoveGroupMember.js';
import { DeleteGroup } from '../../application/use-cases/DeleteGroup.js';
import { SoftDeleteCatalogItem } from '../../application/use-cases/SoftDeleteCatalogItem.js';
import { UpdateUserProfile } from '../../application/use-cases/UpdateUserProfile.js';

// Interface
import { GroupController } from './controllers/GroupController.js';
import { AuthController } from './controllers/AuthController.js';
import { SpaceController } from './controllers/SpaceController.js';
import { createGroupRoutes } from './routes/group.routes.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createSpaceRoutes } from './routes/space.routes.js';
import { errorHandler } from './middlewares/ErrorHandler.js';
import { createRequireGroupMembership } from './middlewares/requireGroupMembership.js';

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
const getGroupDashboard = new GetGroupDashboard(userRepository, taskRepository, catalogRepository, groupRepository);
const createTask = new CreateTask(userRepository, taskRepository);
const updateCatalogItem = new UpdateCatalogItem(catalogRepository);
const createCatalogItem = new CreateCatalogItem(catalogRepository);
const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository, groupRepository);
const createGroup = new CreateGroup(groupRepository, catalogRepository);
const getUserGroups = new GetUserGroups(groupRepository);
const joinGroup = new JoinGroup(groupRepository);
const deleteTask = new DeleteTask(taskRepository, groupRepository);
const updateTask = new UpdateTask(taskRepository, groupRepository);
const updateGroupName = new UpdateGroupName(groupRepository);
const getGroupMembers = new GetGroupMembers(groupRepository);
const removeGroupMember = new RemoveGroupMember(groupRepository);
const deleteGroup = new DeleteGroup(groupRepository);
const softDeleteCatalogItem = new SoftDeleteCatalogItem(catalogRepository, groupRepository);
const updateUserProfile = new UpdateUserProfile(userRepository);

// 3. Controllers (Interface → depends on Use Cases)
const groupController = new GroupController(getGroupDashboard, createTask, updateCatalogItem, createCatalogItem, deleteTask, updateTask, softDeleteCatalogItem);
const authController = new AuthController(registerUser, loginUser, updateUserProfile);
const spaceController = new SpaceController(createGroup, getUserGroups, joinGroup, updateGroupName, getGroupMembers, removeGroupMember, deleteGroup);

// Membership middleware (needs groupRepository)
const requireGroupMembership = createRequireGroupMembership(groupRepository);

// ─────────────────────────────────────────────────
// Express App
// ─────────────────────────────────────────────────

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict origins in production
const corsOriginEnv = process.env['CORS_ORIGIN'];
const allowedOrigins = corsOriginEnv ?? ['http://localhost:8081', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-group-id', 'x-user-id'],
}));

// Body size limit
app.use(express.json({ limit: '1mb' }));

// Rate limiting on auth endpoints (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'TooManyRequests', message: 'Too many attempts, please try again later' },
});

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'TooManyRequests', message: 'Too many requests, please try again later' },
});

// Health check
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (auth is NOT behind JwtAuthMiddleware)
app.use('/auth', authLimiter, createAuthRoutes(authController));
app.use('/spaces', apiLimiter, createSpaceRoutes(spaceController, requireGroupMembership));
app.use('/groups', apiLimiter, createGroupRoutes(groupController, requireGroupMembership));

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
    console.log(`🏠 Spaces: GET|POST http://localhost:${PORT}/spaces | POST /spaces/join`);
});

export default app;
