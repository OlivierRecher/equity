import type { Request, Response, NextFunction } from 'express';
import type { IGroupRepository } from '../../../domain/ports/IGroupRepository.js';

/**
 * Factory: returns a middleware that verifies the authenticated user
 * is a member of the group identified by `req.params.groupId`.
 *
 * Must be placed AFTER jwtAuthMiddleware (needs req.user).
 */
export function createRequireGroupMembership(groupRepository: IGroupRepository) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.user?.id;
        const groupId = req.params['groupId'] as string | undefined;

        if (!userId || !groupId) {
            res.status(401).json({ error: 'Unauthorized', message: 'Missing user or group context' });
            return;
        }

        const isMember = await groupRepository.isMember(groupId, userId);
        if (!isMember) {
            res.status(403).json({ error: 'Forbidden', message: 'You are not a member of this group' });
            return;
        }

        next();
    };
}
