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

    router.patch('/:groupId', controller.rename);
    router.get('/:groupId/members', controller.listMembers);
    router.delete('/:groupId/members/:userId', controller.removeMember);
    router.delete('/:groupId', controller.deleteSpace);
    router.get('/:groupId/invite-code', controller.getInviteCode);

    return router;
}
