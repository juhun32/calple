"use client";

import { Button } from "@/components/ui/button";
import { LogOut, KeyRound, Paintbrush, Sun, Moon, Heart } from "lucide-react";
import { login, logout } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

import { useAuth } from "@/components/auth-provider";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    return (
        <div className="fixed w-full border-b border-dashed flex justify-center">
            <div className="container grid grid-cols-[1fr_auto] w-full">
                <div className="flex items-center gap-2 p-4">
                    <a href="/">[Calple]</a>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="h-8 w-8"
                                variant="outline"
                                size="icon"
                            >
                                <Paintbrush />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("pink")}>
                                <Heart className="mr-2 h-4 w-4" />
                                Pink
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {authState.isAuthenticated ? (
                        <Button
                            className="h-8"
                            variant="outline"
                            onClick={logout}
                        >
                            <LogOut className="h-6" />
                            <span>Logout</span>
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
