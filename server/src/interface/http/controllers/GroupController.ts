import type { Request, Response, NextFunction } from 'express';
import type { GetGroupDashboard } from '../../../application/use-cases/GetGroupDashboard.js';

/**
 * GroupController — Thin HTTP adapter.
 * Extracts params, delegates to use case, returns JSON.
 */
export class GroupController {
    constructor(private readonly getGroupDashboard: GetGroupDashboard) { }

    /**
     * GET /groups/:groupId/dashboard
     */
    getDashboard = async (
        req: Request<{ groupId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId } = req.params;

            const dashboard = await this.getGroupDashboard.execute(groupId);
            res.status(200).json(dashboard);
        } catch (error) {
            next(error);
        }
    };
}
