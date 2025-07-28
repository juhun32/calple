"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

// components
import { useAuth } from "@/components/auth-provider";

// utils
import { calculateDDay, login, logout } from "@/lib/utils";

// ui
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

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
    Flower,
    Download,
    Home,
    Calendar,
    SquareCheckBig,
    Droplets,
    MessageSquarePlus,
    MapPinnedIcon,
} from "lucide-react";

// api
import { getUserMetadata } from "@/lib/api/profile";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    const [startedDating, setStartedDating] = useState<Date | null>(null);

    useEffect(() => {
        async function fetchMetadata() {
            const metadata = await getUserMetadata();
            if (metadata && metadata.startedDating) {
                setStartedDating(new Date(metadata.startedDating));
            } else {
                setStartedDating(null);
            }
        }
        fetchMetadata();
    }, []);

    const startedDatingDday = startedDating
        ? calculateDDay(startedDating)
        : null;

    return (
        <>
            <div className="fixed z-50 h-14 w-full border-b flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-sans">
                <div className="container flex justify-between sm:grid sm:grid-cols-[1fr_auto] w-full px-4 md:px-8 py-2">
                    <div className="flex items-center">
                        <a
                            href="/"
                            className="hidden sm:flex absolute left-1/2 -translate-x-1/2 sm:relative sm:left-0 sm:-translate-x-0 mr-4 sm:mr-8"
                        >
                            <Calple />
                        </a>

                        <div className="flex flex-row gap-1 sm:gap-2 items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex rounded-full px-3 w-8 h-8 hover:cursor-pointer [&_svg:not([class*='size-'])]:size-3.5"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                <Home strokeWidth={2} />
                            </Button>

                            <div className="hidden md:flex h-4">
                                <Separator orientation="vertical" />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-6 sm:w-fit hover:cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/checkin";
                                }}
                            >
                                {/* <SquareCheckBig strokeWidth={1.7} /> */}
                                <span className="hidden md:flex text-sm">
                                    Check-In
                                </span>
                            </Button>

                            <div className="hidden md:flex h-4">
                                <Separator orientation="vertical" />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 h-6 w-fit hover:cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/calendar";
                                }}
                            >
                                {/* <Calendar strokeWidth={1.7} /> */}
                                <span className="hidden md:flex text-sm">
                                    Calendar
                                </span>
                            </Button>

                            <div className="hidden md:flex h-4">
                                <Separator orientation="vertical" />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-6 sm:w-fit hover:cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/tracker";
                                }}
                            >
                                {/* <Droplets strokeWidth={1.7} /> */}
                                <span className="hidden md:flex text-sm">
                                    Cycle
                                </span>
                            </Button>

                            <div className="hidden md:flex h-4">
                                <Separator orientation="vertical" />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-6 sm:w-fit hover:cursor-pointer"
                                onClick={() => {
                                    window.location.href = "/map";
                                }}
                            >
                                {/* <MapPinned strokeWidth={1.7} /> */}
                                <span className="hidden md:flex text-sm">
                                    Map
                                </span>
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="flex sm:hidden rounded-full has-[>svg]:px-2 w-8 h-8 w-fit h-6"
                                onClick={() => {
                                    window.location.href = "/calendar";
                                }}
                                disabled
                            >
                                <Download strokeWidth={1.7} />
                                <span className="flex text-sm">IPhone</span>
                            </Button>
                        </div>
                    </div>
                    <a
                        href="/"
                        className="flex sm:hidden h-full items-center justify-center"
                    >
                        <Calple />
                    </a>

                    <div className="flex items-center gap-2">
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            className="hidden sm:flex rounded-full px-3 w-8 h-8 w-fit"
                            onClick={() => {
                                window.location.href = "/calendar";
                            }}
                            disabled
                        >
                            <Download />
                            <span className="flex text-sm">IPhone</span>
                        </Button> */}

                        <div className="hidden sm:flex items-center gap-2 font-serif">
                            {startedDatingDday && (
                                <a
                                    href="/profile"
                                    className="border rounded-full w-fit px-3 h-6 flex items-center justify-center text-sm bg-card dark:bg-card inset-shadow-sm"
                                >
                                    {startedDatingDday}
                                </a>
                            )}
                        </div>

                        <div className="hidden sm:flex h-4 mx-2">
                            <Separator orientation="vertical" />
                        </div>

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
                            <DropdownMenu.DropdownMenuContent
                                align="end"
                                className="font-sans"
                            >
                                <DropdownMenu.DropdownMenuLabel>
                                    Rose
                                </DropdownMenu.DropdownMenuLabel>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("pink")}
                                >
                                    <Flower className="mr-2 h-4 w-4 text-rose-400" />
                                    Light
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("pinkdark")}
                                >
                                    <Flower className="mr-2 h-4 w-4 text-purple-800/70" />
                                    Dark
                                </DropdownMenu.DropdownMenuItem>

                                <DropdownMenu.DropdownMenuSeparator />

                                <DropdownMenu.DropdownMenuLabel>
                                    Default
                                </DropdownMenu.DropdownMenuLabel>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                                    Light
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="mr-2 h-4 w-4 text-sky-700/70" />
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
                                        <Menu className="h-4" />
                                    </Button>
                                </DropdownMenu.DropdownMenuTrigger>
                                <DropdownMenu.DropdownMenuContent className="w-56 font-sans">
                                    <DropdownMenu.DropdownMenuLabel>
                                        {authState.user?.name}
                                    </DropdownMenu.DropdownMenuLabel>
                                    <DropdownMenu.DropdownMenuItem className="flex sm:hidden items-center gap-2">
                                        {startedDatingDday ? (
                                            <a
                                                href="/profile"
                                                className="border rounded-full w-fit px-3 h-6 flex items-center justify-center text-sm"
                                            >
                                                {startedDatingDday}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Anniversary not set
                                            </span>
                                        )}
                                    </DropdownMenu.DropdownMenuItem>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuGroup>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href = "/")
                                            }
                                        >
                                            <Home className="h-4 w-4" />
                                            Home
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/checkin")
                                            }
                                        >
                                            <SquareCheckBig className="h-4 w-4" />
                                            Check-In
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/calendar")
                                            }
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Calendar
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/tracker")
                                            }
                                        >
                                            <Droplets className="h-4 w-4" />
                                            Cycle
                                        </DropdownMenu.DropdownMenuItem>

                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href = "/map")
                                            }
                                        >
                                            <MapPinnedIcon className="h-4 w-4" />
                                            Map
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
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

                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/feedback")
                                            }
                                        >
                                            <MessageSquarePlus className="h-4 w-4" />
                                            Feedback
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuItem
                                        onClick={logout}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenu.DropdownMenuItem>
                                </DropdownMenu.DropdownMenuContent>
                            </DropdownMenu.DropdownMenu>
                        ) : (
                            <DropdownMenu.DropdownMenu>
                                <DropdownMenu.DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 rounded-full"
                                    >
                                        <Menu className="h-4" />
                                    </Button>
                                </DropdownMenu.DropdownMenuTrigger>
                                <DropdownMenu.DropdownMenuContent className="w-56">
                                    <DropdownMenu.DropdownMenuGroup>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/profile")
                                            }
                                            disabled
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem disabled>
                                            <MessageSquarePlus className="h-4 w-4" />
                                            Feedback
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuItem
                                        onClick={login}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Login</span>
                                    </DropdownMenu.DropdownMenuItem>
                                </DropdownMenu.DropdownMenuContent>
                            </DropdownMenu.DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
