import type { Request, Response, NextFunction } from 'express';
import type { CreateGroup, CreateGroupInput } from '../../../application/use-cases/CreateGroup.js';
import type { GetUserGroups } from '../../../application/use-cases/GetUserGroups.js';
import type { JoinGroup } from '../../../application/use-cases/JoinGroup.js';
import type { UpdateGroupName } from '../../../application/use-cases/UpdateGroupName.js';
import type { GetGroupMembers } from '../../../application/use-cases/GetGroupMembers.js';
import type { RemoveGroupMember } from '../../../application/use-cases/RemoveGroupMember.js';
import type { DeleteGroup } from '../../../application/use-cases/DeleteGroup.js';

/**
 * SpaceController — Handles space (group) management.
 * All routes require JwtAuthMiddleware (req.user.id).
 */
export class SpaceController {
    constructor(
        private readonly createGroup: CreateGroup,
        private readonly getUserGroups: GetUserGroups,
        private readonly joinGroup: JoinGroup,
        private readonly updateGroupName: UpdateGroupName,
        private readonly getGroupMembers: GetGroupMembers,
        private readonly removeGroupMember: RemoveGroupMember,
        private readonly deleteGroupUseCase: DeleteGroup,
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

    /**
     * PATCH /spaces/:groupId
     */
    rename = async (
        req: Request<{ groupId: string }, unknown, { name: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            const { name } = req.body;
            const result = await this.updateGroupName.execute({ groupId, userId, name });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /spaces/:groupId/members
     */
    listMembers = async (
        req: Request<{ groupId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const members = await this.getGroupMembers.execute(req.params.groupId);
            res.status(200).json(members);
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /spaces/:groupId/members/:userId
     */
    removeMember = async (
        req: Request<{ groupId: string; userId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const currentUserId = req.user.id;
            const { groupId, userId } = req.params;
            await this.removeGroupMember.execute({ groupId, userId: currentUserId, targetUserId: userId });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * DELETE /spaces/:groupId
     */
    deleteSpace = async (
        req: Request<{ groupId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const userId = req.user.id;
            const { groupId } = req.params;
            await this.deleteGroupUseCase.execute({ groupId, userId });
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /spaces/:groupId/invite-code
     */
    getInviteCode = async (
        req: Request<{ groupId: string }>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const group = await this.getUserGroups.execute(req.user.id);
            const space = group.find((g) => g.id === req.params.groupId);
            if (!space) {
                res.status(404).json({ message: 'Group not found' });
                return;
            }
            res.status(200).json({ code: space.code });
        } catch (error) {
            next(error);
        }
    };
}
