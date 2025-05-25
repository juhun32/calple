"use client";

import { ConnectionManager } from "@/components/user/ConnectionManager";
import { useAuth } from "@/components/auth-provider";

export default function Profile() {
    const { authState } = useAuth();

    return (
        <div className="w-full p-8 text-2xl">
            <div className="container mx-auto p-8 flex gap-2">
                {authState.user?.email}
                <div>
                    <ConnectionManager />
                </div>
            </div>
        </div>
    );
}
