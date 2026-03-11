import type { Request, Response, NextFunction } from 'express';
import { DomainError, EntityNotFoundError } from '../../../domain/errors/DomainError.js';

/**
 * Global error handler middleware.
 * Catches all errors and converts them to standardized HTTP responses.
 *
 * Mapping:
 *   EntityNotFoundError → 404 Not Found
 *   DomainError         → 400 Bad Request
 *   Unknown error       → 500 Internal Server Error
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    // EntityNotFoundError → 404
    if (err instanceof EntityNotFoundError) {
        res.status(404).json({
            error: err.name,
            message: err.message,
        });
        return;
    }

    // DomainError → 400
    if (err instanceof DomainError) {
        res.status(400).json({
            error: err.name,
            message: err.message,
        });
        return;
    }

    // Prisma Foreign Key Constraint Failed (often happens if local DB was wiped but app kept old tokens)
    if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2003') {
        res.status(400).json({
            error: 'ForeignKeyConstraintFailed',
            message: 'Donnée invalide ou introuvable. Si vous venez de réinitialiser la base de données, déconnectez-vous et reconnectez-vous.',
        });
        return;
    }

    // Unknown error → 500
    console.error('[CRITICAL] Unhandled error:', err);
    res.status(500).json({
        error: 'InternalServerError',
        message: 'An unexpected error occurred',
    });
}
