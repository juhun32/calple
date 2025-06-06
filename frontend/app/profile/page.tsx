"use client";

import { useAuth } from "@/components/auth-provider";
import { useState } from "react";

// components
import { ConnectionManager } from "@/components/connection/ConnectionHandler";

// types
import { Connection } from "@/lib/types/connection";

export default function Profile() {
    const { authState } = useAuth();
    const [connection, setConnection] = useState<Connection | null>(null);

    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <div className="w-full p-8 text-2xl">
                <div className="container mx-auto p-8 flex gap-2">
                    {authState.user?.email}
                    <div>
                        <ConnectionManager />
                    </div>
                </div>
            </div>
        </div>
    );
}
