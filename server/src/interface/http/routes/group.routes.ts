import { Router, type RequestHandler } from 'express';
import type { GroupController } from '../controllers/GroupController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';
import { validate } from '../validation/validate.js';
import { createTaskSchema, updateTaskSchema, createCatalogItemSchema, updateCatalogItemSchema } from '../validation/schemas.js';

export function createGroupRoutes(controller: GroupController, requireGroupMembership: RequestHandler): Router {
    const router = Router();

    // All group routes require JWT auth
    router.use(jwtAuthMiddleware);

    // All /:groupId routes require group membership
    router.get('/:groupId/dashboard', requireGroupMembership, controller.getDashboard);
    router.post('/:groupId/tasks', requireGroupMembership, validate(createTaskSchema), controller.addTask);
    router.delete('/:groupId/tasks/:taskId', requireGroupMembership, controller.deleteTask);
    router.patch('/:groupId/tasks/:taskId', requireGroupMembership, validate(updateTaskSchema), controller.updateTask);
    router.post('/:groupId/catalog', requireGroupMembership, validate(createCatalogItemSchema), controller.addCatalogItem);
    router.patch('/:groupId/catalog/:catalogId', requireGroupMembership, validate(updateCatalogItemSchema), controller.patchCatalogItem);
    router.delete('/:groupId/catalog/:catalogId', requireGroupMembership, controller.deleteCatalogItem);

    return router;
}
