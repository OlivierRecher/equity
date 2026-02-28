import type { Request, Response, NextFunction } from 'express';
import type { RegisterUser } from '../../../application/use-cases/RegisterUser.js';
import type { LoginUser } from '../../../application/use-cases/LoginUser.js';
import type { RegisterInputDTO, LoginInputDTO } from '../../../application/dtos/AuthDTO.js';

/**
 * AuthController — Handles registration and login.
 * No auth middleware required on these routes.
 */
export class AuthController {
    constructor(
        private readonly registerUser: RegisterUser,
        private readonly loginUser: LoginUser,
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
}
