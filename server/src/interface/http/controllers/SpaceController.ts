import type { Request, Response, NextFunction } from 'express';
import type { CreateGroup, CreateGroupInput } from '../../../application/use-cases/CreateGroup.js';
import type { GetUserGroups } from '../../../application/use-cases/GetUserGroups.js';
import type { JoinGroup } from '../../../application/use-cases/JoinGroup.js';

/**
 * SpaceController — Handles space (group) management.
 * All routes require SimpleAuthMiddleware (req.user.id).
 */
export class SpaceController {
    constructor(
        private readonly createGroup: CreateGroup,
        private readonly getUserGroups: GetUserGroups,
        private readonly joinGroup: JoinGroup,
    ) { }

    /**
     * POST /spaces
     */
    create = async (
        req: Request<unknown, unknown, Omit<CreateGroupInput, 'userId'>>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user.id;
            const { name, template } = req.body;
            const result = await this.createGroup.execute({ name, template, userId });
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /spaces
     */
    list = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user.id;
            const groups = await this.getUserGroups.execute(userId);
            res.status(200).json(groups);
        } catch (error) {
            next(error);
        }
    };

    /**
     * POST /spaces/join
     */
    join = async (
        req: Request<unknown, unknown, { code: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user.id;
            const { code } = req.body;
            const result = await this.joinGroup.execute({ code, userId });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
