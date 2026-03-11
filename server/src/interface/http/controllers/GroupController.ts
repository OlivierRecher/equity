import type { Request, Response, NextFunction } from 'express';
import type { GetGroupDashboard } from '../../../application/use-cases/GetGroupDashboard.js';
import type { CreateTask } from '../../../application/use-cases/CreateTask.js';
import type { UpdateCatalogItem } from '../../../application/use-cases/UpdateCatalogItem.js';
import type { CreateCatalogItem } from '../../../application/use-cases/CreateCatalogItem.js';
import type { DeleteTask } from '../../../application/use-cases/DeleteTask.js';
import type { UpdateTask } from '../../../application/use-cases/UpdateTask.js';
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
        private readonly deleteTaskUseCase: DeleteTask,
        private readonly updateTaskUseCase: UpdateTask,
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
            const currentUserId = req.user.id; // from SimpleAuthMiddleware
            const { catalogId, value, beneficiaryIds, doerIds } = req.body;

            const task = await this.createTask.execute({
                groupId,
                doerIds: doerIds?.length ? doerIds : [currentUserId],
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

    /**
     * DELETE /groups/:groupId/tasks/:taskId
     */
    deleteTask = async (
        req: Request<{ groupId: string; taskId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId, taskId } = req.params;
            const userId = req.user.id;

            await this.deleteTaskUseCase.execute({ taskId, groupId, userId });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /groups/:groupId/tasks/:taskId
     */
    updateTask = async (
        req: Request<{ groupId: string; taskId: string }, unknown, { catalogId?: string; value: number; beneficiaryIds: string[]; doerIds?: string[] }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { groupId, taskId } = req.params;
            const userId = req.user.id;
            const { catalogId, value, beneficiaryIds, doerIds } = req.body;

            await this.updateTaskUseCase.execute({
                taskId,
                groupId,
                userId,
                catalogId,
                value,
                beneficiaryIds,
                doerIds,
            });

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };
}
