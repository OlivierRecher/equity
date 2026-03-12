import { Router } from 'express';
import type { AuthController } from '../controllers/AuthController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';

/**
 * Auth routes — register & login are public, profile update is protected.
 */
export function createAuthRoutes(controller: AuthController): Router {
    const router = Router();

    router.post('/register', controller.register);
    router.post('/login', controller.login);
    router.patch('/profile', jwtAuthMiddleware, controller.updateProfile);

    return router;
}
