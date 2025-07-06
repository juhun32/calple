"use client";

import { useAuth } from "@/components/auth-provider";

// components
import { ConnectionManager } from "@/components/connection/ConnectionHandler";

export default function Profile() {
    const { authState } = useAuth();

    return (
        <div className="flex flex-col h-screen pt-20 pb-16 items-center">
            <div className="container mx-auto px-8 flex gap-4 items-center">
                {authState.user?.email}
                <ConnectionManager />
            </div>
            {/* <div className="container mx-auto px-8 flex flex-col gap-2 mt-8">
                <p className="text-lg font-semibold">{authState.user?.name}</p>
            </div> */}
        </div>
    );
}
