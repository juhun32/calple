"use client";

import { useState, useEffect } from "react";
import { checkAuthStatus, login, logout } from "app/lib/utils";

import { Paintbrush, LogOut, KeyRound } from "lucide-react";
import { Button } from "app/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";

export default function Landing() {
    const backendURL = "http://localhost:5000";

    const [selectedColor, setSelectedColor] = useState("bg-white");
    const [selectedBgColor, setSelectedBgColor] = useState("bg-stone-100");
    const [selectedBorderColor, setSelectedBorderColor] = useState("");
    const [selectedTextColor, setSelectedTextColor] = useState("text-black");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedColor = localStorage.getItem("calpleColor");
            const savedBgColor = localStorage.getItem("calpleBg");
            const savedBorderColor = localStorage.getItem("calpleBorder");
            const savedTextColor = localStorage.getItem("calpleTextColor");

            if (savedColor) setSelectedColor(savedColor);
            if (savedBgColor) setSelectedBgColor(savedBgColor);
            if (savedBorderColor) setSelectedBorderColor(savedBorderColor);
            if (savedTextColor) setSelectedTextColor(savedTextColor);
        }
    }, []);

    const userSetColor = (color: string) => {
        let newColor: string = "bg-white";
        let newBgColor: string = "bg-stone-100";
        let newBorderColor: string = "";
        let newTextColor: string = "text-black";

        if (color === "white") {
            newColor = "bg-white";
            newBgColor = "bg-stone-100";
            newBorderColor = "";
            newTextColor = "text-black";
        } else if (color === "red") {
            newColor = "bg-red-50";
            newBgColor = "bg-red-100";
            newBorderColor = "border-red-200";
            newTextColor = "text-red-900";
        } else if (color === "dark") {
            newColor = "bg-stone-800";
            newBgColor = "bg-stone-900";
            newBorderColor = "border-stone-700";
            newTextColor = "text-stone-200";
        }

        localStorage.setItem("calpleColor", newColor);
        localStorage.setItem("calpleBg", newBgColor);
        localStorage.setItem("calpleBorder", newBorderColor);
        localStorage.setItem("calpleTextColor", newTextColor);

        setSelectedColor(newColor);
        setSelectedBgColor(newBgColor);
        setSelectedBorderColor(newBorderColor);
        setSelectedTextColor(newTextColor);
    };

    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        // Check auth status when component mounts
        checkAuthStatus().then((result) => {
            setAuthState({
                isAuthenticated: result.isAuthenticated,
                user: result.user,
                isLoading: false,
            });
        });
    }, []);

    return (
        <div
            className={`min-h-screen grid grid-rows-[auto_1fr] items-center justify-center 
            ${selectedBgColor} ${selectedTextColor}`}
        >
            <div
                className={`w-screen h-full border-b border-dashed ${selectedBorderColor} flex justify-center`}
            >
                <div
                    className={`container border-x border-dashed ${selectedBorderColor} w-full px-8 py-2 flex justify-between items-center`}
                >
                    <div className="flex gap-2">
                        <a href="/">[Calple]</a>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                asChild
                                className={`${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                            >
                                <Button variant="outline" size="icon">
                                    <Paintbrush />
                                    <span className="sr-only">
                                        Toggle theme
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className={`${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                            >
                                <DropdownMenuItem
                                    onClick={() => userSetColor("red")}
                                >
                                    <span className="h-4 w-4 px-0 py-0 rounded-full bg-red-200 hover:bg-red-200/70 border">
                                        &nbsp;
                                    </span>
                                    Pink
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => userSetColor("white")}
                                >
                                    <span className="h-4 w-4 px-0 py-0 rounded-full bg-white hover:bg-whte/70 border">
                                        &nbsp;
                                    </span>
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => userSetColor("dark")}
                                >
                                    <span className="h-4 w-4 px-0 py-0 rounded-full bg-gray-800 hover:bg-gray-800/70 border">
                                        &nbsp;
                                    </span>
                                    Dark
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {authState.isAuthenticated ? (
                            <Button
                                variant="outline"
                                className={`${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                onClick={logout}
                            >
                                <LogOut className="h-6" />
                                <span>LogOut</span>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
            <div
                className={`w-screen h-full border-b border-dashed ${selectedBorderColor} flex justify-center`}
            >
                <div
                    className={`container flex justify-center items-center border-x border-dashed ${selectedBorderColor} w-full p-8`}
                >
                    {!authState.isAuthenticated ? (
                        <Button
                            variant="outline"
                            className={`${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                            onClick={login}
                        >
                            <KeyRound className="h-6" />
                            <span>LogIn</span>
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="w-full h-full flex justify-center">
                <div
                    className={`flex flex-col h-full w-screen container border-x border-dashed ${selectedBorderColor}`}
                >
                    footer
                </div>
            </div>
        </div>
    );
}
