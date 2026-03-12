import { z } from 'zod';

// ─────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────

export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Le nom est requis').max(100, '100 caractères max'),
    email: z.string().trim().toLowerCase().email('Adresse email invalide'),
    password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Adresse email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
});

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().toLowerCase().email('Adresse email invalide').optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .optional(),
});

// ─────────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────────

export const createTaskSchema = z.object({
    catalogId: z.string().uuid('catalogId invalide').optional(),
    value: z.number().int('La valeur doit être un entier').min(0, 'La valeur doit être positive'),
    beneficiaryIds: z.array(z.string().uuid('beneficiaryId invalide')).min(1, 'Au moins un bénéficiaire requis'),
    doerIds: z.array(z.string().uuid('doerId invalide')).min(1).optional(),
});

export const updateTaskSchema = z.object({
    catalogId: z.string().uuid('catalogId invalide').optional(),
    value: z.number().int('La valeur doit être un entier').min(0, 'La valeur doit être positive'),
    beneficiaryIds: z.array(z.string().uuid('beneficiaryId invalide')).min(1, 'Au moins un bénéficiaire requis'),
    doerIds: z.array(z.string().uuid('doerId invalide')).min(1).optional(),
});

// ─────────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────────

export const createCatalogItemSchema = z.object({
    name: z.string().trim().min(1, 'Le nom est requis').max(100, '100 caractères max'),
    defaultValue: z.number().int().min(0, 'La valeur doit être positive'),
    icon: z.string().min(1, "L'icône est requise").max(10, 'Icône trop longue'),
});

export const updateCatalogItemSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    defaultValue: z.number().int().min(0).optional(),
    icon: z.string().min(1).max(10).optional(),
});

// ─────────────────────────────────────────────────
// Spaces
// ─────────────────────────────────────────────────

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, 'Le nom est requis').max(100, '100 caractères max'),
    template: z.enum(['coloc', 'family', 'custom']).optional(),
});

export const joinGroupSchema = z.object({
    code: z.string().trim().min(1, 'Le code est requis').max(10, 'Code trop long'),
});

export const renameGroupSchema = z.object({
    name: z.string().trim().min(1, 'Le nom est requis').max(100, '100 caractères max'),
});
