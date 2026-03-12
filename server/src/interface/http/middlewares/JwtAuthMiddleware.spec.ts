import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { jwtAuthMiddleware } from './JwtAuthMiddleware.js';
import { signToken } from '../../../infrastructure/auth/jwt.js';

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

describe('JwtAuthMiddleware', () => {
    const validToken = signToken({ userId: 'user-bob', email: 'bob@test.com' });

    it('should return 401 when no Authorization header is provided', () => {
        const { req, res, next } = createMocks();

        jwtAuthMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Unauthorized',
            message: 'Missing or invalid Authorization header',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is not Bearer', () => {
        const { req, res, next } = createMocks({ authorization: 'Basic abc123' });

        jwtAuthMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
        const { req, res, next } = createMocks({ authorization: 'Bearer invalid-token' });

        jwtAuthMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() and attach user when valid token is provided', () => {
        const { req, res, next } = createMocks({
            authorization: `Bearer ${validToken}`,
        });

        jwtAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
        expect(req.user).toEqual({ id: 'user-bob' });
    });

    it('should attach group when x-group-id header is also provided', () => {
        const { req, res, next } = createMocks({
            authorization: `Bearer ${validToken}`,
            'x-group-id': 'group-coloc',
        });

        jwtAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toEqual({ id: 'user-bob' });
        expect(req.group).toEqual({ id: 'group-coloc' });
    });

    it('should not attach group when x-group-id is absent', () => {
        const { req, res, next } = createMocks({
            authorization: `Bearer ${validToken}`,
        });

        jwtAuthMiddleware(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.group).toBeUndefined();
    });
});
