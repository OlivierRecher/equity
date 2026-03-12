import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Express middleware factory that validates req.body against a Zod schema.
 *
 * Usage in routes:
 *   router.post('/register', validate(registerSchema), controller.register);
 *
 * On success: replaces req.body with the parsed (trimmed, lowercased, etc.) data
 * and calls next().
 *
 * On failure: returns 400 with structured error messages.
 */
export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((e) => ({
                field: e.path.map(String).join('.'),
                message: e.message,
            }));

            res.status(400).json({
                error: 'ValidationError',
                message: errors[0]?.message ?? 'Données invalides',
                details: errors,
            });
            return;
        }

        // Replace body with parsed & transformed data (trimmed strings, etc.)
        req.body = result.data;
        next();
    };
}
