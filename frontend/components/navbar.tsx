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
import logo from "@/lib/assets/logo.png";

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
            <div className="fixed z-50 h-14 w-full flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-sans">
                <div className="container flex items-center justify-between w-full px-4 md:px-8 py-2 gap-2">
                    <div className="flex items-center">
                        <a
                            href="/"
                            className="hidden sm:flex absolute left-1/2 -translate-x-1/2 sm:relative sm:left-0 sm:-translate-x-0 mr-4 sm:mr-8"
                        >
                            <img src={logo.src} alt="Calple" className="h-7" />
                        </a>

                        <div className="hidden sm:flex items-center gap-2">
                            {startedDatingDday && (
                                <a
                                    href="/profile"
                                    className="bg-muted rounded w-fit px-3 h-6 flex items-center justify-center text-sm inset-shadow-sm h-8"
                                >
                                    {startedDatingDday}
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex flex flex-row gap-1 items-center bg-muted rounded px-2 h-8 absolute left-1/2 -translate-x-1/2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 hover:cursor-pointer [&_svg:not([class*='size-'])]:size-4 h-6 w-6"
                            onClick={() => {
                                window.location.href = "/";
                            }}
                        >
                            <Home strokeWidth={2} />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 w-8 h-6 sm:w-fit hover:cursor-pointer uppercase"
                            onClick={() => {
                                window.location.href = "/checkin";
                            }}
                        >
                            {/* <SquareCheckBig strokeWidth={1.7} /> */}
                            <span className="flex uppercase font-normal h-6 items-center">
                                Check-In
                            </span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 h-6 w-fit hover:cursor-pointer"
                            onClick={() => {
                                window.location.href = "/calendar";
                            }}
                        >
                            {/* <Calendar strokeWidth={1.7} /> */}
                            <span className="flex uppercase font-normal h-6 items-center">
                                Calendar
                            </span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 w-8 h-6 sm:w-fit hover:cursor-pointer"
                            onClick={() => {
                                window.location.href = "/tracker";
                            }}
                        >
                            {/* <Droplets strokeWidth={1.7} /> */}
                            <span className="flex uppercase font-normal h-6 items-center">
                                Cycle
                            </span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 w-8 h-6 sm:w-fit hover:cursor-pointer"
                            onClick={() => {
                                window.location.href = "/map";
                            }}
                        >
                            {/* <MapPinned strokeWidth={1.7} /> */}
                            <span className="flex uppercase font-normal h-6 items-center">
                                Map
                            </span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="flex sm:hidden has-[>svg]:px-2 w-8 h-8 w-fit h-6"
                            onClick={() => {
                                window.location.href = "/calendar";
                            }}
                            disabled
                        >
                            <Download strokeWidth={1.7} />
                            <span className="flex text-sm">IPhone</span>
                        </Button>
                    </div>

                    <a
                        href="/"
                        className="flex sm:hidden h-full items-center justify-center absolute left-1/2 -translate-x-1/2"
                    >
                        <img src={logo.src} alt="Calple" className="h-7" />
                    </a>

                    {authState.user?.name}

                    <div className="flex items-center gap-2 bg-muted rounded h-8 px-2">
                        <DropdownMenu.DropdownMenu>
                            <DropdownMenu.DropdownMenuTrigger asChild>
                                <Button
                                    className="h-6 w-6"
                                    variant="ghost"
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
                                    <Button variant="ghost" className="h-6 w-6">
                                        <Menu className="h-4" />
                                    </Button>
                                </DropdownMenu.DropdownMenuTrigger>
                                <DropdownMenu.DropdownMenuContent className="w-56 font-sans">
                                    <DropdownMenu.DropdownMenuLabel>
                                        Directory
                                    </DropdownMenu.DropdownMenuLabel>
                                    <DropdownMenu.DropdownMenuGroup>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href = "/")
                                            }
                                            className="uppercase"
                                        >
                                            <Home className="h-4 w-4" />
                                            Home
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/checkin")
                                            }
                                            className="uppercase"
                                        >
                                            <SquareCheckBig className="h-4 w-4" />
                                            Check-In
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/calendar")
                                            }
                                            className="uppercase"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            Calendar
                                        </DropdownMenu.DropdownMenuItem>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/tracker")
                                            }
                                            className="uppercase"
                                        >
                                            <Droplets className="h-4 w-4" />
                                            Cycle
                                        </DropdownMenu.DropdownMenuItem>

                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href = "/map")
                                            }
                                            className="uppercase"
                                        >
                                            <MapPinnedIcon className="h-4 w-4" />
                                            Map
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
                                    <DropdownMenu.DropdownMenuSeparator />
                                    <DropdownMenu.DropdownMenuLabel>
                                        Other
                                    </DropdownMenu.DropdownMenuLabel>
                                    <DropdownMenu.DropdownMenuGroup>
                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/profile")
                                            }
                                            className="uppercase"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </DropdownMenu.DropdownMenuItem>

                                        <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href =
                                                    "/feedback")
                                            }
                                            className="uppercase"
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
                                        <span className="uppercase">
                                            Logout
                                        </span>
                                    </DropdownMenu.DropdownMenuItem>
                                </DropdownMenu.DropdownMenuContent>
                            </DropdownMenu.DropdownMenu>
                        ) : (
                            <DropdownMenu.DropdownMenu>
                                <DropdownMenu.DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8"
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
