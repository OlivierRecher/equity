import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../infrastructure/auth/jwt.js';

/**
 * JWT Auth Middleware.
 *
 * Reads `Authorization: Bearer <token>` header (required).
 * Reads `x-group-id` header (optional — varies per request when user switches space).
 * Attaches `req.user` and optionally `req.group` for downstream use.
 */
export function jwtAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const decoded = verifyToken(token);
        req.user = { id: decoded.userId };
    } catch {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
        return;
    }

    const groupId = req.headers['x-group-id'];
    if (groupId) {
        req.group = { id: Array.isArray(groupId) ? groupId[0]! : groupId };
    }

    next();
}
