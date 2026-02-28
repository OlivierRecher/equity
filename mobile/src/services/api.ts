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

/**
 * Typed fetch wrapper
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'user-bob',
            'x-group-id': 'group-coloc',
        },
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
