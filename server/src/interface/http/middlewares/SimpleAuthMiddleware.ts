import type { Request, Response, NextFunction } from 'express';

/**
 * Simple context middleware (MVP).
 *
 * Reads `x-user-id` and `x-group-id` from request headers.
 * If either is missing → 401 Unauthorized.
 * Otherwise attaches `req.user` and `req.group` for downstream use.
 */
export function simpleAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const userId = req.headers['x-user-id'];
    const groupId = req.headers['x-group-id'];

    if (!userId || !groupId) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing x-user-id or x-group-id header',
        });
        return;
    }

    // Attach context to the request object
    req.user = { id: Array.isArray(userId) ? userId[0]! : userId };
    req.group = { id: Array.isArray(groupId) ? groupId[0]! : groupId };

    next();
}
