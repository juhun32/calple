"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function TokenHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Save token to localStorage
            localStorage.setItem("auth_token", token);

            // Clean up URL without reloading page
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }, [searchParams]);

    return null; // This component doesn't render anything
}
