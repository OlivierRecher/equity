import { Router } from 'express';
import type { GroupController } from '../controllers/GroupController.js';
import { simpleAuthMiddleware } from '../middlewares/SimpleAuthMiddleware.js';

export function createGroupRoutes(controller: GroupController): Router {
    const router = Router();

    // All group routes require auth context (x-user-id, x-group-id)
    router.use(simpleAuthMiddleware);

    router.get('/:groupId/dashboard', controller.getDashboard);
    router.post('/:groupId/tasks', controller.addTask);
    router.post('/:groupId/catalog', controller.addCatalogItem);
    router.patch('/:groupId/catalog/:catalogId', controller.patchCatalogItem);

    return router;
}
