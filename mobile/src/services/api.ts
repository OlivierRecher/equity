import { QueryClient } from '@tanstack/react-query';
import type { GroupDashboardDTO, CreateTaskInput, TaskCreatedDTO } from '../types/dashboard';

/**
 * API base URL — uses EXPO_PUBLIC_API_URL env var.
 * Falls back to localhost:3000 for iOS Simulator.
 * For physical devices / Android emulator, set this to your machine's local IP.
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
        headers: { 'Content-Type': 'application/json' },
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

/**
 * Fetch group dashboard data
 */
export function fetchGroupDashboard(
    groupId: string,
): Promise<GroupDashboardDTO> {
    return apiFetch<GroupDashboardDTO>(`/groups/${groupId}/dashboard`);
}

/**
 * Create a new task in a group
 */
export function createTask(
    groupId: string,
    input: CreateTaskInput,
): Promise<TaskCreatedDTO> {
    return apiFetch<TaskCreatedDTO>(`/groups/${groupId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
