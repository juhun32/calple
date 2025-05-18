"use client";

import { Button } from "@/components/ui/button";
import {
    LogOut,
    KeyRound,
    Paintbrush,
    Sun,
    Moon,
    Heart,
    Menu,
} from "lucide-react";
import { login, logout } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

import { useAuth } from "@/components/auth-provider";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    return (
        <div className="fixed w-full border-b border-dashed flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container grid grid-cols-[1fr_auto] w-full px-4 md:px-8 border-x border-dashed py-2">
                <div className="flex items-center gap-2">
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-8 w-8">
                                    <Menu className="h-6" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>
                                    {authState.user?.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuItem>
                                            Invite users
                                        </DropdownMenuItem>
                                    </DropdownMenuSub>
                                    <DropdownMenuItem>
                                        Settings
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>GitHub</DropdownMenuItem>
                                <DropdownMenuItem>Support</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <a
                                        className="flex items-center gap-2"
                                        onClick={logout}
                                    >
                                        <LogOut className="h-6" />
                                        <span>Logout</span>
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
