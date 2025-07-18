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
    Flower,
    Download,
    Home,
    Calendar,
    SquareCheckBig,
    Droplets,
    MessageSquarePlus,
} from "lucide-react";

export function NavBar() {
    const { setTheme } = useTheme();
    const { authState } = useAuth();

    return (
        <>
            <div className="fixed h-12 w-full border-b flex justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex justify-between sm:grid sm:grid-cols-[1fr_auto] w-full px-4 md:px-8 py-2">
                    <div className="flex items-center">
                        <a href="/" className="hidden sm:flex mr-4 sm:mr-8">
                            <Calple />
                        </a>
                        <div className="flex flex-row gap-1 sm:gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-8"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                            >
                                <Home strokeWidth={1.7} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/checkin";
                                }}
                            >
                                <SquareCheckBig strokeWidth={1.7} />
                                <span className="hidden md:flex text-xs">
                                    Check-In
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 h-8 w-fit"
                                onClick={() => {
                                    window.location.href = "/calendar";
                                }}
                            >
                                <Calendar strokeWidth={1.7} />
                                <span className="flex text-xs">Calendar</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex sm:hidden rounded-full px-3 w-8 h-8 w-fit h-6"
                                onClick={() => {
                                    window.location.href = "/calendar";
                                }}
                                disabled
                            >
                                <Download strokeWidth={1.7} />
                                <span className="flex text-xs">IPhone</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/tracker";
                                }}
                            >
                                <Droplets strokeWidth={1.7} />
                                <span className="hidden md:flex text-xs">
                                    Cycle
                                </span>
                            </Button>
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

                            {/* <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex rounded-full px-3 w-8 h-8 sm:w-fit"
                                onClick={() => {
                                    window.location.href = "/map";
                                }}
                            >
                                <MapPinned />
                                <span className="hidden md:flex text-xs">
                                    Map
                                </span>
                            </Button> */}
                        </div>
                    </div>
                    <a
                        href="/"
                        className="flex sm:hidden h-full items-center justify-center"
                    >
                        <Calple />
                    </a>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:flex rounded-full px-3 w-8 h-8 w-fit"
                            onClick={() => {
                                window.location.href = "/calendar";
                            }}
                            disabled
                        >
                            <Download />
                            <span className="flex text-xs">IPhone</span>
                        </Button>

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
                                    Rose Light
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("pinkdark")}
                                >
                                    <Flower className="mr-2 h-4 w-4" />
                                    Rose Dark
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="mr-2 h-4 w-4" />
                                    Default Light
                                </DropdownMenu.DropdownMenuItem>
                                <DropdownMenu.DropdownMenuItem
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="mr-2 h-4 w-4" />
                                    Default Dark
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

                                        {/* <DropdownMenu.DropdownMenuItem
                                            onClick={() =>
                                                (window.location.href = "/map")
                                            }
                                        >
                                            <Map className="h-4 w-4" />
                                            Map
                                        </DropdownMenu.DropdownMenuItem> */}
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
                                        {/* <DropdownMenu.DropdownMenuItem disabled>
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </DropdownMenu.DropdownMenuItem> */}

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
                                        <Menu className="h-6" />
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
                                        {/* <DropdownMenu.DropdownMenuItem disabled>
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </DropdownMenu.DropdownMenuItem> */}
                                        <DropdownMenu.DropdownMenuItem disabled>
                                            <MessageSquarePlus className="h-4 w-4" />
                                            Feedback
                                        </DropdownMenu.DropdownMenuItem>
                                    </DropdownMenu.DropdownMenuGroup>
                                </DropdownMenu.DropdownMenuContent>
                            </DropdownMenu.DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
