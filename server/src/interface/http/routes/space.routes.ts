import { Router } from 'express';
import type { SpaceController } from '../controllers/SpaceController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';

/**
 * Space routes — all protected by JWT auth.
 */
export function createSpaceRoutes(controller: SpaceController): Router {
    const router = Router();

    router.use(jwtAuthMiddleware);

    router.get('/', controller.list);
    router.post('/', controller.create);
    router.post('/join', controller.join);

    return router;
}
