import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiLogin, apiRegister, apiUpdateProfile, setAuthHeaders, clearAuthHeaders } from '../services/api';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface UpdateProfileInput {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    groupId: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    switchGroup: (newGroupId: string) => Promise<void>;
    updateProfile: (input: UpdateProfileInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────────
// Keys for SecureStore
// ─────────────────────────────────────────────────

const STORE_KEYS = {
    TOKEN: 'equity_token',
    USER_ID: 'equity_user_id',
    USER_NAME: 'equity_user_name',
    USER_EMAIL: 'equity_user_email',
    GROUP_ID: 'equity_group_id',
} as const;

// ─────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [groupId, setGroupId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from SecureStore on mount
    useEffect(() => {
        (async () => {
            try {
                const token = await SecureStore.getItemAsync(STORE_KEYS.TOKEN);
                const userId = await SecureStore.getItemAsync(STORE_KEYS.USER_ID);
                const userName = await SecureStore.getItemAsync(STORE_KEYS.USER_NAME);
                const userEmail = await SecureStore.getItemAsync(STORE_KEYS.USER_EMAIL);
                const storedGroupId = await SecureStore.getItemAsync(STORE_KEYS.GROUP_ID);

                if (token && userId && userName && userEmail) {
                    setUser({ id: userId, name: userName, email: userEmail });
                    setGroupId(storedGroupId);
                    setToken(token);
                    setAuthHeaders(token, storedGroupId);
                }
            } catch {
                // SecureStore not available (web?) — ignore
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const persistSession = useCallback(
        async (authUser: AuthUser, authGroupId: string | null, authToken: string) => {
            setUser(authUser);
            setGroupId(authGroupId);
            setToken(authToken);
            setAuthHeaders(authToken, authGroupId);

            await SecureStore.setItemAsync(STORE_KEYS.TOKEN, authToken);
            await SecureStore.setItemAsync(STORE_KEYS.USER_ID, authUser.id);
            await SecureStore.setItemAsync(STORE_KEYS.USER_NAME, authUser.name);
            await SecureStore.setItemAsync(STORE_KEYS.USER_EMAIL, authUser.email);
            if (authGroupId) {
                await SecureStore.setItemAsync(STORE_KEYS.GROUP_ID, authGroupId);
            } else {
                await SecureStore.deleteItemAsync(STORE_KEYS.GROUP_ID);
            }
        },
        [],
    );

    const login = useCallback(
        async (email: string, password: string) => {
            const result = await apiLogin(email, password);
            await persistSession(result.user, result.groupId, result.token);
        },
        [persistSession],
    );

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            const result = await apiRegister(name, email, password);
            await persistSession(result.user, result.groupId, result.token);
        },
        [persistSession],
    );

    const logout = useCallback(async () => {
        setUser(null);
        setGroupId(null);
        setToken(null);
        clearAuthHeaders();

        try {
            await SecureStore.deleteItemAsync(STORE_KEYS.TOKEN);
            await SecureStore.deleteItemAsync(STORE_KEYS.USER_ID);
            await SecureStore.deleteItemAsync(STORE_KEYS.USER_NAME);
            await SecureStore.deleteItemAsync(STORE_KEYS.USER_EMAIL);
            await SecureStore.deleteItemAsync(STORE_KEYS.GROUP_ID);
        } catch {
            // SecureStore not available (web)
        }
    }, []);

    const updateProfile = useCallback(
        async (input: UpdateProfileInput) => {
            const result = await apiUpdateProfile(input);
            const updatedUser = result.user;
            setUser(updatedUser);

            try {
                await SecureStore.setItemAsync(STORE_KEYS.USER_NAME, updatedUser.name);
                await SecureStore.setItemAsync(STORE_KEYS.USER_EMAIL, updatedUser.email);
            } catch {
                // SecureStore not available (web)
            }
        },
        [],
    );

    const switchGroup = useCallback(
        async (newGroupId: string) => {
            setGroupId(newGroupId);
            if (token) {
                setAuthHeaders(token, newGroupId);
            }
            try {
                await SecureStore.setItemAsync(STORE_KEYS.GROUP_ID, newGroupId);
            } catch {
                // SecureStore not available (web)
            }
        },
        [token],
    );

    return (
        <AuthContext.Provider value={{ user, groupId, isLoading, login, register, logout, switchGroup, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
