import type { Request, Response, NextFunction } from 'express';
import type { GetGroupDashboard } from '../../../application/use-cases/GetGroupDashboard.js';
import type { CreateTask } from '../../../application/use-cases/CreateTask.js';
import type { CreateTaskInputDTO } from '../../../application/dtos/CreateTaskDTO.js';

/**
 * GroupController — Thin HTTP adapter.
 * Extracts params, delegates to use cases, returns JSON.
 */
export class GroupController {
    constructor(
        private readonly getGroupDashboard: GetGroupDashboard,
        private readonly createTask: CreateTask,
    ) { }

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

    /**
     * POST /groups/:groupId/tasks
     */
    addTask = async (
        req: Request<{ groupId: string }, unknown, Omit<CreateTaskInputDTO, 'groupId'>>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId } = req.params;
            const { doerId, catalogId, value, beneficiaryIds } = req.body;

            const task = await this.createTask.execute({
                groupId,
                doerId,
                catalogId,
                value,
                beneficiaryIds,
            });

            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };
}
