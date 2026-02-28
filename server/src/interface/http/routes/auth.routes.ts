import { Router } from 'express';
import type { AuthController } from '../controllers/AuthController.js';

/**
 * Auth routes — NOT protected by SimpleAuthMiddleware.
 */
export function createAuthRoutes(controller: AuthController): Router {
    const router = Router();

    router.post('/register', controller.register);
    router.post('/login', controller.login);

    return router;
}
