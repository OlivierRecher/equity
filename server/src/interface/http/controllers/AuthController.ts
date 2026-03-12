import type { Request, Response, NextFunction } from 'express';
import type { RegisterUser } from '../../../application/use-cases/RegisterUser.js';
import type { LoginUser } from '../../../application/use-cases/LoginUser.js';
import type { UpdateUserProfile } from '../../../application/use-cases/UpdateUserProfile.js';
import type { RegisterInputDTO, LoginInputDTO, UpdateProfileInputDTO } from '../../../application/dtos/AuthDTO.js';

/**
 * AuthController — Handles registration, login, and profile updates.
 */
export class AuthController {
    constructor(
        private readonly registerUser: RegisterUser,
        private readonly loginUser: LoginUser,
        private readonly updateUserProfile: UpdateUserProfile,
    ) { }

    /**
     * POST /auth/register
     */
    register = async (
        req: Request<unknown, unknown, RegisterInputDTO>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { name, email, password } = req.body;
            const result = await this.registerUser.execute({ name, email, password });
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /auth/login
     */
    login = async (
        req: Request<unknown, unknown, LoginInputDTO>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { email, password } = req.body;
            const result = await this.loginUser.execute({ email, password });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /auth/profile (JWT protected)
     */
    updateProfile = async (
        req: Request<unknown, unknown, UpdateProfileInputDTO>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user!.id;
            const result = await this.updateUserProfile.execute(userId, req.body);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
