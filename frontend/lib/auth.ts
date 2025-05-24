"use client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getAuthStatusWithToken() {
    const token = localStorage.getItem("auth_token");

    if (!token) {
        return { isAuthenticated: false, user: null };
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return { isAuthenticated: false, user: null };
        }

        const data = await response.json();
        return {
            isAuthenticated: data.authenticated,
            user: data.user,
        };
    } catch (error) {
        console.error("Auth check failed:", error);
        return { isAuthenticated: false, user: null };
    }
}
