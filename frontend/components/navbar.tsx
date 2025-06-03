"use client";
import { useTheme } from "next-themes";

// components
import { useAuth } from "@/components/auth-provider";

// utils
import { login, logout } from "@/lib/utils";

// ui
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// assets
import { Calple } from "@/lib/assets/calple";

// icons
import {
    LogOut,
    Paintbrush,
    Sun,
    Moon,
    Heart,
    Menu,
    User,
    Settings,
    Siren,
    Dices,
    BookHeart,
    Calendar,
    CalendarCheck,
} from "lucide-react";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    return (
        <>
            <div className="fixed w-full border-b border-dashed flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container grid grid-cols-[1fr_auto] w-full px-4 md:px-8 py-2">
                    <div className="flex items-center gap-2">
                        <a href="/" className="mr-8">
                            <Calple />
                        </a>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full px-3"
                                onClick={() => {
                                    window.location.href = "/dates";
                                }}
                            >
                                <CalendarCheck />
                                <span className="text-xs">Calendar</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full px-3"
                                onClick={() => {
                                    window.location.href = "/tracker";
                                }}
                            >
                                <BookHeart />
                                <span className="text-xs">Tracker</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full px-3"
                                onClick={() => {
                                    window.location.href = "/roulette";
                                }}
                            >
                                <Dices />
                                <span className="text-xs">Roulette</span>
                            </Button>
                        </div>
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
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => setTheme("pink")}
                                >
                                    <Heart className="mr-2 h-4 w-4" />
                                    Pink
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {authState.isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8"
                                    >
                                        <Menu className="h-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>
                                        {authState.user?.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/profile")
                                            }
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Siren className="h-4 w-4" />
                                        Support
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
