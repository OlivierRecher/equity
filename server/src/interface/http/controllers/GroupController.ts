import type { Request, Response, NextFunction } from 'express';
import type { GetGroupDashboard } from '../../../application/use-cases/GetGroupDashboard.js';
import type { CreateTask } from '../../../application/use-cases/CreateTask.js';
import type { UpdateCatalogItem } from '../../../application/use-cases/UpdateCatalogItem.js';
import type { CreateCatalogItem } from '../../../application/use-cases/CreateCatalogItem.js';
import type { CreateTaskInputDTO } from '../../../application/dtos/CreateTaskDTO.js';
import type { UpdateCatalogItemInputDTO } from '../../../application/dtos/UpdateCatalogItemDTO.js';
import type { CreateCatalogItemInputDTO } from '../../../application/dtos/CreateCatalogItemDTO.js';

/**
 * GroupController — Thin HTTP adapter.
 * Extracts params, delegates to use cases, returns JSON.
 */
export class GroupController {
    constructor(
        private readonly getGroupDashboard: GetGroupDashboard,
        private readonly createTask: CreateTask,
        private readonly updateCatalogItem: UpdateCatalogItem,
        private readonly createCatalogItem: CreateCatalogItem,
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
        req: Request<{ groupId: string }, unknown, Omit<CreateTaskInputDTO, 'groupId' | 'doerId'>>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId } = req.params;
            const doerId = req.user.id; // from SimpleAuthMiddleware
            const { catalogId, value, beneficiaryIds } = req.body;

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

    /**
     * POST /groups/:groupId/catalog
     */
    addCatalogItem = async (
        req: Request<{ groupId: string }, unknown, Omit<CreateCatalogItemInputDTO, 'groupId'>>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId } = req.params;
            const { name, defaultValue, icon } = req.body;

            const item = await this.createCatalogItem.execute({
                groupId,
                name,
                defaultValue,
                icon,
            });

            res.status(201).json(item);
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /groups/:groupId/catalog/:catalogId
     */
    patchCatalogItem = async (
        req: Request<{ groupId: string; catalogId: string }, unknown, Omit<UpdateCatalogItemInputDTO, 'catalogId'>>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { catalogId } = req.params;
            const { name, defaultValue, icon } = req.body;

            const updated = await this.updateCatalogItem.execute({
                catalogId,
                name,
                defaultValue,
                icon,
            });

            res.status(200).json(updated);
        } catch (error) {
            next(error);
        }
    };
}
