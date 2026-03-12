import { QueryClient } from '@tanstack/react-query';
import type {
    GroupDashboardDTO,
    CreateTaskInput,
    TaskCreatedDTO,
    UpdateCatalogItemInput,
    CatalogItemUpdatedDTO,
    CreateCatalogItemInput,
    CatalogItemCreatedDTO,
    SpaceDTO,
    CreateSpaceInput,
    CreateSpaceOutput,
    JoinSpaceInput,
    JoinSpaceOutput,
    GroupMemberDTO,
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

let _token: string | null = null;
let _groupId: string | null = null;

export function setAuthHeaders(token: string, groupId: string | null) {
    _token = token;
    _groupId = groupId;
}

export function clearAuthHeaders() {
    _token = null;
    _groupId = null;
}

// ─────────────────────────────────────────────────
// Typed fetch wrapper
// ─────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (_token) headers['Authorization'] = `Bearer ${_token}`;
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

    if (response.status === 204) {
        return undefined as unknown as T;
    }

    return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────

interface AuthResponse {
    user: { id: string; name: string; email: string };
    groupId: string | null;
    token: string;
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

interface UpdateProfileInput {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

interface UpdateProfileResponse {
    user: { id: string; name: string; email: string };
}

export function apiUpdateProfile(input: UpdateProfileInput): Promise<UpdateProfileResponse> {
    return apiFetch<UpdateProfileResponse>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(input),
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

// ─────────────────────────────────────────────────
// Space API
// ─────────────────────────────────────────────────

/** Fetch user's spaces */
export function fetchUserSpaces(): Promise<SpaceDTO[]> {
    return apiFetch<SpaceDTO[]>('/spaces');
}

/** Create a new space */
export function createSpace(input: CreateSpaceInput): Promise<CreateSpaceOutput> {
    return apiFetch<CreateSpaceOutput>('/spaces', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

/** Join a space by invite code */
export function joinSpace(input: JoinSpaceInput): Promise<JoinSpaceOutput> {
    return apiFetch<JoinSpaceOutput>('/spaces/join', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

// ─────────────────────────────────────────────────
// Task API
// ─────────────────────────────────────────────────

/** Delete a task */
export function deleteTask(groupId: string, taskId: string): Promise<void> {
    return apiFetch<void>(`/groups/${groupId}/tasks/${taskId}`, {
        method: 'DELETE',
    });
}

/** Update a task */
export function updateTask(
    groupId: string,
    taskId: string,
    input: CreateTaskInput,
): Promise<void> {
    return apiFetch<void>(`/groups/${groupId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });
}

// ─────────────────────────────────────────────────
// Group Settings API
// ─────────────────────────────────────────────────

/** Update group name */
export function updateGroupName(
    groupId: string,
    name: string,
): Promise<{ id: string; name: string; code: string }> {
    return apiFetch(`/spaces/${groupId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
}

/** Fetch group members */
export function fetchGroupMembers(
    groupId: string,
): Promise<GroupMemberDTO[]> {
    return apiFetch<GroupMemberDTO[]>(`/spaces/${groupId}/members`);
}

/** Remove a member from the group */
export function removeGroupMember(
    groupId: string,
    userId: string,
): Promise<void> {
    return apiFetch<void>(`/spaces/${groupId}/members/${userId}`, {
        method: 'DELETE',
    });
}

/** Delete a group entirely */
export function deleteGroup(groupId: string): Promise<void> {
    return apiFetch<void>(`/spaces/${groupId}`, {
        method: 'DELETE',
    });
}

/** Soft delete a catalog item */
export function softDeleteCatalogItem(
    groupId: string,
    catalogId: string,
): Promise<void> {
    return apiFetch<void>(`/groups/${groupId}/catalog/${catalogId}`, {
        method: 'DELETE',
    });
}

