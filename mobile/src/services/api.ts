import { QueryClient } from '@tanstack/react-query';
import type {
    GroupDashboardDTO,
    CreateTaskInput,
    TaskCreatedDTO,
    UpdateCatalogItemInput,
    CatalogItemUpdatedDTO,
    CreateCatalogItemInput,
    CatalogItemCreatedDTO,
} from '../types/dashboard';

/**
 * API base URL — uses EXPO_PUBLIC_API_URL env var.
 */
const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Shared QueryClient instance
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: 2,
        },
    },
});

// ─────────────────────────────────────────────────
// Dynamic auth headers (set by AuthContext)
// ─────────────────────────────────────────────────

let _userId: string | null = null;
let _groupId: string | null = null;

export function setAuthHeaders(userId: string, groupId: string | null) {
    _userId = userId;
    _groupId = groupId;
}

export function clearAuthHeaders() {
    _userId = null;
    _groupId = null;
}

// ─────────────────────────────────────────────────
// Typed fetch wrapper
// ─────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (_userId) headers['x-user-id'] = _userId;
    if (_groupId) headers['x-group-id'] = _groupId;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers,
        ...options,
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
            (body as { message?: string }).message ??
            `API error ${response.status}`
        );
    }

    return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────

interface AuthResponse {
    user: { id: string; name: string; email: string };
    groupId: string | null;
}

export function apiLogin(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export function apiRegister(
    name: string,
    email: string,
    password: string,
): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

// ─────────────────────────────────────────────────
// Dashboard API
// ─────────────────────────────────────────────────

/** Fetch group dashboard data */
export function fetchGroupDashboard(
    groupId: string,
): Promise<GroupDashboardDTO> {
    return apiFetch<GroupDashboardDTO>(`/groups/${groupId}/dashboard`);
}

/** Create a new task */
export function createTask(
    groupId: string,
    input: CreateTaskInput,
): Promise<TaskCreatedDTO> {
    return apiFetch<TaskCreatedDTO>(`/groups/${groupId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

/** Update a catalog item */
export function updateCatalogItem(
    groupId: string,
    catalogId: string,
    input: UpdateCatalogItemInput,
): Promise<CatalogItemUpdatedDTO> {
    return apiFetch<CatalogItemUpdatedDTO>(
        `/groups/${groupId}/catalog/${catalogId}`,
        {
            method: 'PATCH',
            body: JSON.stringify(input),
        },
    );
}

/** Create a new catalog item */
export function createCatalogItem(
    groupId: string,
    input: CreateCatalogItemInput,
): Promise<CatalogItemCreatedDTO> {
    return apiFetch<CatalogItemCreatedDTO>(
        `/groups/${groupId}/catalog`,
        {
            method: 'POST',
            body: JSON.stringify(input),
        },
    );
}
