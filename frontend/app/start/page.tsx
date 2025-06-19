"use client";

import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

export default function Start() {
    return (
        <div className="flex flex-col h-screen justify-center items-center">
            <div className="container mx-auto p-8 gap-4 flex flex-col items-center">
                <h1 className="text-2xl font-bold">Welcome to Calple!</h1>
                <p>
                    Get started with calendar app. You can plan and share your
                    schedule with your partner.
                </p>
                <Button
                    className="rounded-full w-40"
                    onClick={() => {
                        window.location.href = "/calendar";
                    }}
                    variant="secondary"
                >
                    <Calendar className="h-4 w-4" />
                    Go to Calendar
                </Button>

                <p>Connect and share your calple with your partner.</p>
                <Button
                    className="rounded-full w-40"
                    onClick={() => {
                        window.location.href = "/profile";
                    }}
                    variant="secondary"
                >
                    <User className="h-4 w-4" />
                    Go to Profile
                </Button>
            </div>
        </div>
    );
}
