"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuthStatusWithToken } from "@/lib/auth";

type User = {
    [key: string]: any;
};

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
};

type AuthContextType = {
    authState: AuthState;
    setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    authState: { isAuthenticated: false, user: null },
    setAuthState: () => {},
    logout: async () => {},
});

export function AuthProvider({
    children,
    initialState,
}: {
    children: React.ReactNode;
    initialState: AuthState;
}) {
    const [authState, setAuthState] = useState<AuthState>(initialState);

    useEffect(() => {
        const checkAuthWithToken = async () => {
            const status = await getAuthStatusWithToken();
            setAuthState(status);
        };

        checkAuthWithToken();
    }, []);

    // check refresh token every hour
    useEffect(() => {
        const interval = setInterval(async () => {
            const token = localStorage.getItem("auth_token");

            if (token && authState.isAuthenticated) {
                try {
                    await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                } catch (error) {
                    console.error("Token refresh failed:", error);
                }
            }
        }, 60 * 60 * 1000);

        return () => clearInterval(interval);
    }, [authState.isAuthenticated]);

    const logout = async () => {
        const token = localStorage.getItem("auth_token");
        localStorage.removeItem("auth_token");

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/oauth/logout`,
                {
                    headers: token
                        ? {
                              Authorization: `Bearer ${token}`,
                          }
                        : {},
                }
            );
        } catch (error) {
            console.error("Error during logout:", error);
        }

        setAuthState({ isAuthenticated: false, user: null });
    };

    return (
        <AuthContext.Provider value={{ authState, setAuthState, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
