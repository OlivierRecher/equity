import { Router } from 'express';
import type { SpaceController } from '../controllers/SpaceController.js';
import { simpleAuthMiddleware } from '../middlewares/SimpleAuthMiddleware.js';

/**
 * Space routes — all protected by SimpleAuthMiddleware.
 */
export function createSpaceRoutes(controller: SpaceController): Router {
    const router = Router();

    router.use(simpleAuthMiddleware);

    router.get('/', controller.list);
    router.post('/', controller.create);
    router.post('/join', controller.join);

    return router;
}
