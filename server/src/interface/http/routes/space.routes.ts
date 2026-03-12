import { Router, type RequestHandler } from 'express';
import type { SpaceController } from '../controllers/SpaceController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';

/**
 * Space routes — all protected by JWT auth.
 * Routes with :groupId also require group membership.
 */
export function createSpaceRoutes(controller: SpaceController, requireGroupMembership: RequestHandler): Router {
    const router = Router();

    router.use(jwtAuthMiddleware);

    // Global space routes (no groupId — no membership check needed)
    router.get('/', controller.list);
    router.post('/', controller.create);
    router.post('/join', controller.join);

    // Group-specific routes (require membership)
    router.patch('/:groupId', requireGroupMembership, controller.rename);
    router.get('/:groupId/members', requireGroupMembership, controller.listMembers);
    router.delete('/:groupId/members/:userId', requireGroupMembership, controller.removeMember);
    router.delete('/:groupId', requireGroupMembership, controller.deleteSpace);
    router.get('/:groupId/invite-code', requireGroupMembership, controller.getInviteCode);

    return router;
}
