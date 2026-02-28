import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { simpleAuthMiddleware } from './SimpleAuthMiddleware.js';

/**
 * Factory for a minimal mock trio: (req, res, next)
 */
function createMocks(headers: Record<string, string> = {}) {
    const req = {
        headers,
    } as unknown as Request;

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    return { req, res, next };
}

describe('SimpleAuthMiddleware', () => {
    it('should return 401 when no headers are provided', () => {
        const { req, res, next } = createMocks();

        simpleAuthMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Unauthorized',
            message: 'Missing x-user-id header',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when only x-user-id is provided (x-group-id is optional)', () => {
        const { req, res, next } = createMocks({ 'x-user-id': 'user-bob' });

        simpleAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toEqual({ id: 'user-bob' });
        expect(req.group).toBeUndefined();
    });

    it('should return 401 when only x-group-id is provided', () => {
        const { req, res, next } = createMocks({ 'x-group-id': 'group-coloc' });

        simpleAuthMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and attach user/group when both headers are provided', () => {
        const { req, res, next } = createMocks({
            'x-user-id': 'user-bob',
            'x-group-id': 'group-coloc',
        });

        simpleAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
        expect(req.user).toEqual({ id: 'user-bob' });
        expect(req.group).toEqual({ id: 'group-coloc' });
    });

    it('should handle array header values (Express edge case)', () => {
        const req = {
            headers: {
                'x-user-id': ['user-alice', 'user-bob'],
                'x-group-id': ['group-coloc'],
            },
        } as unknown as Request;

        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        } as unknown as Response;

        const next = vi.fn() as NextFunction;

        simpleAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toEqual({ id: 'user-alice' });
        expect(req.group).toEqual({ id: 'group-coloc' });
    });
});
