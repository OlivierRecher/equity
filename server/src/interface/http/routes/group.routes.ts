import { Router } from 'express';
import type { GroupController } from '../controllers/GroupController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';

export function createGroupRoutes(controller: GroupController): Router {
    const router = Router();

    // All group routes require JWT auth + optional x-group-id
    router.use(jwtAuthMiddleware);

    router.get('/:groupId/dashboard', controller.getDashboard);
    router.post('/:groupId/tasks', controller.addTask);
    router.delete('/:groupId/tasks/:taskId', controller.deleteTask);
    router.patch('/:groupId/tasks/:taskId', controller.updateTask);
    router.post('/:groupId/catalog', controller.addCatalogItem);
    router.patch('/:groupId/catalog/:catalogId', controller.patchCatalogItem);

    return router;
}
