import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiLogin, apiRegister, setAuthHeaders, clearAuthHeaders } from '../services/api';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: AuthUser | null;
    groupId: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────────
// Keys for SecureStore
// ─────────────────────────────────────────────────

const STORE_KEYS = {
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
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from SecureStore on mount
    useEffect(() => {
        (async () => {
            try {
                const userId = await SecureStore.getItemAsync(STORE_KEYS.USER_ID);
                const userName = await SecureStore.getItemAsync(STORE_KEYS.USER_NAME);
                const userEmail = await SecureStore.getItemAsync(STORE_KEYS.USER_EMAIL);
                const storedGroupId = await SecureStore.getItemAsync(STORE_KEYS.GROUP_ID);

                if (userId && userName && userEmail) {
                    setUser({ id: userId, name: userName, email: userEmail });
                    setGroupId(storedGroupId);
                    setAuthHeaders(userId, storedGroupId);
                }
            } catch {
                // SecureStore not available (web?) — ignore
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const persistSession = useCallback(
        async (authUser: AuthUser, authGroupId: string | null) => {
            setUser(authUser);
            setGroupId(authGroupId);
            setAuthHeaders(authUser.id, authGroupId);

            await SecureStore.setItemAsync(STORE_KEYS.USER_ID, authUser.id);
            await SecureStore.setItemAsync(STORE_KEYS.USER_NAME, authUser.name);
            await SecureStore.setItemAsync(STORE_KEYS.USER_EMAIL, authUser.email);
            if (authGroupId) {
                await SecureStore.setItemAsync(STORE_KEYS.GROUP_ID, authGroupId);
            }
        },
        [],
    );

    const login = useCallback(
        async (email: string, password: string) => {
            const result = await apiLogin(email, password);
            await persistSession(result.user, result.groupId);
        },
        [persistSession],
    );

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            const result = await apiRegister(name, email, password);
            await persistSession(result.user, result.groupId);
        },
        [persistSession],
    );

    const logout = useCallback(async () => {
        setUser(null);
        setGroupId(null);
        clearAuthHeaders();

        await SecureStore.deleteItemAsync(STORE_KEYS.USER_ID);
        await SecureStore.deleteItemAsync(STORE_KEYS.USER_NAME);
        await SecureStore.deleteItemAsync(STORE_KEYS.USER_EMAIL);
        await SecureStore.deleteItemAsync(STORE_KEYS.GROUP_ID);
    }, []);

    return (
        <AuthContext.Provider value={{ user, groupId, isLoading, login, register, logout }}>
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
