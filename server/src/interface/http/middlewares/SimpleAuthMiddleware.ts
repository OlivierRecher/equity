import type { Request, Response, NextFunction } from 'express';

/**
 * Simple context middleware (MVP).
 *
 * Reads `x-user-id` (required) and `x-group-id` (optional) from request headers.
 * If `x-user-id` is missing → 401 Unauthorized.
 * Attaches `req.user` and optionally `req.group` for downstream use.
 */
export function simpleAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing x-user-id header',
        });
        return;
    }

    // Attach context to the request object
    req.user = { id: Array.isArray(userId) ? userId[0]! : userId };

    const groupId = req.headers['x-group-id'];
    if (groupId) {
        req.group = { id: Array.isArray(groupId) ? groupId[0]! : groupId };
    }

    next();
}
