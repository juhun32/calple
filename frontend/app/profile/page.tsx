"use client";

import { useAuth } from "@/components/auth-provider";

// components
import { ConnectionManager } from "@/components/connection/ConnectionHandler";

export default function Profile() {
    const { authState } = useAuth();

    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <div className="container mx-auto p-8 flex gap-4 items-center">
                {authState.user?.email}
                <ConnectionManager />
            </div>
        </div>
    );
}
