"use client";
import { useTheme } from "next-themes";

// components
import { useAuth } from "@/components/auth-provider";

// utils
import { logout } from "@/lib/utils";

// ui
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";

// assets
import { Calple } from "@/lib/assets/calple";

// icons
import {
    LogOut,
    Paintbrush,
    Sun,
    Moon,
    Menu,
    User,
    Settings,
    Siren,
    Dices,
    CalendarCheck,
    Flower,
} from "lucide-react";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    return (
        <>
            <div className="fixed h-12 w-full border-b border-dashed flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container grid grid-cols-[1fr_auto] w-full px-4 md:px-8 py-2">
                    <div className="flex items-center gap-2">
                        <a href="/" className="mr-4 sm:mr-8">
                            <Calple />
                        </a>
                        <div className="flex flex-row gap-1 sm:gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/calendar";
                                }}
                            >
                                <CalendarCheck />
                                <span className="hidden md:flex text-xs">
                                    Calendar
                                </span>
                            </Button>
                            {/* <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/tracker";
                                }}
                            >
                                <BookHeart />
                                <span className="hidden md:flex text-xs">
                                    Tracker
                                </span>
                            </Button> */}
                            {/* <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/roulette";
                                }}
                            >
                                <Dices />
                                <span className="hidden md:flex text-xs">
                                    Roulette
                                </span>
                            </Button> */}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu.DropdownMenu>
                            <DropdownMenu.DropdownMenuTrigger asChild>
                                <Button
                                    className="h-8 w-8 rounded-full"
                                    variant="outline"
                                    size="icon"
                                >
                                    <Paintbrush />
                                </Button>
                            </DropdownMenu.DropdownMenuTrigger>
                            <DropdownMenu.DropdownMenuContent align="end">
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("pink")}
                                >
                                    <Flower className="mr-2 h-4 w-4" />
                                    Rose
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </DropdownMenu.DropdownMenuItem>
                            </DropdownMenu.DropdownMenuContent>
                        </DropdownMenu.DropdownMenu>

                        {authState.isAuthenticated ? (
                            <DropdownMenu.DropdownMenu>
                                <DropdownMenu.DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <Menu className="h-6" />
                                    </Button>
                                </DropdownMenu.DropdownMenuTrigger>
                                <DropdownMenu.DropdownMenuContent className="w-56">
                                    <DropdownMenu.DropdownMenuLabel>
                                        {authState.user?.name}
                                    </DropdownMenu.DropdownMenuLabel>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuGroup>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/profile")
                                            }
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem disabled>
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuItem disabled>
                                        <Siren className="h-4 w-4" />
                                        Support
                                    </DropdownMenu.DropdownMenuItem>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuItem
                                        onClick={logout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenu.DropdownMenuItem>
                                </DropdownMenu.DropdownMenuContent>
                            </DropdownMenu.DropdownMenu>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}
