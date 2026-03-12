import { Router } from 'express';
import type { AuthController } from '../controllers/AuthController.js';
import { jwtAuthMiddleware } from '../middlewares/JwtAuthMiddleware.js';
import { validate } from '../validation/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validation/schemas.js';

/**
 * Auth routes — register & login are public, profile update is protected.
 */
export function createAuthRoutes(controller: AuthController): Router {
    const router = Router();

    router.post('/register', validate(registerSchema), controller.register);
    router.post('/login', validate(loginSchema), controller.login);
    router.patch('/profile', jwtAuthMiddleware, validate(updateProfileSchema), controller.updateProfile);

    return router;
}
