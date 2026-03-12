/**
 * Augment Express Request with user/group context
 * set by the JwtAuthMiddleware.
 */
declare namespace Express {
    interface Request {
        user: { id: string };
        group: { id: string };
    }
}
