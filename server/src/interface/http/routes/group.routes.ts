import { Router } from 'express';
import type { GroupController } from '../controllers/GroupController.js';

export function createGroupRoutes(controller: GroupController): Router {
    const router = Router();

    router.get('/:groupId/dashboard', controller.getDashboard);
    router.post('/:groupId/tasks', controller.addTask);

    return router;
}
