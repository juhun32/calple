"use client";

import { useState, useEffect } from "react";
import { checkAuthStatus, login, logout } from "app/lib/utils";

import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar,
    Calendar1,
    CalendarHeart,
    Moon,
    Sun,
    Heart,
    Paintbrush,
    KeyRound,
    LogOut,
} from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "app/components/ui/drawer";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "app/components/ui/alert-dialog";
import { Checkbox } from "app/components/ui/checkbox";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "app/components/ui/dropdown-menu";

export default function CalendarPage() {
    const backendURL = "http://localhost:5000";

    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        checkAuthStatus().then((result) => {
            setAuthState({
                isAuthenticated: result.isAuthenticated,
                user: result.user,
                isLoading: false,
            });
        });
    }, []);
    console.log("Auth State:", authState);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Helper functions for calendar data
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Generate calendar grid for month view
    const generateMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        // Create array for calendar grid (including empty cells for padding)
        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const monthData = generateMonthData();

    const formatMonth = (date: Date) => {
        return date.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const goToPrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number | null) => {
        if (!day) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const selectDate = (day: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const calculateRequiredRows = () => {
        // Calculate number of rows needed based on first day of month and days in month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const daysInMonth = getDaysInMonth(year, month);

        // Calculate total cells needed (first day offset + days in month)
        const totalCells = firstDayOfMonth + daysInMonth;

        // Calculate rows (divide by 7 days per week and round up)
        return Math.ceil(totalCells / 7);
    };

    // Get required rows for current month
    const requiredRows = calculateRequiredRows();

    const startDating = new Date("2024-01-22T00:00:00-05:00");
    const startMathClass = new Date("2023-08-21T00:00:00-04:00"); // Summer, so EDT
    const startMason = new Date("2025-08-26T00:00:00-04:00"); // Summer, so EDT

    const endDateMasonGraduation = new Date("2027-05-15T00:00:00-04:00"); // Summer, so EDT
    const endDateNOVAGraduation = new Date("2025-05-12T00:00:00-04:00");

    function calculateDDay(targetDate: Date): string {
        // Get current date (April 19, 2025 based on your context)
        const now = new Date();

        // Create dates set to midnight UTC to eliminate timezone issues
        const today = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        );
        const target = new Date(
            Date.UTC(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate()
            )
        );

        // Calculate difference in days precisely
        const diffTime = Math.abs(today.getTime() - target.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (target < today) {
            return `D+${diffDays}`;
        } else if (target > today) {
            return `D-${diffDays}`;
        } else {
            return "D-Day";
        }
    }

    const getDDaysForDay = (day: number | null) => {
        if (!day) return [];

        return ddays.filter((dday) => {
            const eventDate = dday.date;

            // For non-annual events, check full date match
            if (!dday.isAnnual) {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear()
                );
            }
            // For annual events, just match day and month
            else {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth()
                );
            }
        });
    };

    // Calculate days since for each milestone
    const daysSinceDating = calculateDDay(startDating);
    const daysSinceMathClass = calculateDDay(startMathClass);
    const daysUntilMason = calculateDDay(startMason);
    const daysUntilMasonGrad = calculateDDay(endDateMasonGraduation);
    const daysUntilNOVAGrad = calculateDDay(endDateNOVAGraduation);

    const ddays = [
        {
            title: "Our Dating Anniversary",
            date: startDating,
            days: daysSinceDating,
            isAnnual: true,
        },
        {
            title: "Our First Math Class Together",
            date: startMathClass,
            days: daysSinceMathClass,
            isAnnual: true,
        },
        {
            title: "NOVA Graduation Date",
            date: endDateNOVAGraduation,
            days: daysUntilNOVAGrad,
            isAnnual: false,
        },
        {
            title: "Mason Fall Semester Start Date",
            date: startMason,
            days: daysUntilMason,
            isAnnual: false,
        },
        {
            title: "Mason Graduation Date",
            date: endDateMasonGraduation,
            days: daysUntilMasonGrad,
            isAnnual: false,
        },
    ];

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

    return (
        <div
            className={`min-h-screen grid grid-rows-[auto_3fr_7fr] items-center justify-center 
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
                                <span>Logout</span>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className={`${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                onClick={login}
                            >
                                <KeyRound className="h-6" />
                                <span>Login</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div
                className={`w-screen h-full border-b border-dashed ${selectedBorderColor} flex justify-center`}
            >
                <div
                    className={`container border-x border-dashed ${selectedBorderColor} w-full p-8`}
                >
                    <div className="flex justify-between items-center pb-8">
                        <h2 className="flex gap-2 items-center text-lg md:text-xl font-semibold">
                            <CalendarHeart className="h-6" />
                            D-Days
                        </h2>
                        {authState.isAuthenticated ? (
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <Button
                                        variant={"outline"}
                                        className={`w-24 h-8 flex items-center gap-2 hover:cursor-pointer ${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                    >
                                        <Plus className="h-6" />
                                        <span>Create</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Add D-Day
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <label
                                                        htmlFor="title"
                                                        className="text-sm font-medium"
                                                    >
                                                        Title:
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        id="title"
                                                        className="border border-gray-300 rounded-md py-1 px-2 text-sm w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label
                                                        htmlFor="date"
                                                        className="text-sm font-medium"
                                                    >
                                                        Date:
                                                    </label>
                                                    <div className="flex items-center border border-gray-300 rounded-md text-sm w-full">
                                                        <Input
                                                            type="date"
                                                            id="date"
                                                            className="border-none"
                                                        />
                                                        <label
                                                            htmlFor="isAnnual"
                                                            className="text-sm font-medium ml-2"
                                                        >
                                                            Annual:
                                                        </label>

                                                        <Checkbox
                                                            id="isAnnual"
                                                            className="ml-1 mr-3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction>
                                            Add
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : null}
                    </div>
                    <div>
                        {authState.isAuthenticated ? (
                            <div className="grid md:grid-cols-2 gap-2">
                                {ddays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-2 rounded-md ${selectedColor}`}
                                    >
                                        <span className="text-md flex items-baseline gap-2">
                                            <p className="truncate text-sm md:text-md max-w-[10rem] sm:max-w-full md:max-w-[10rem] lg:max-w-full">
                                                {day.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                [{day.date.toLocaleDateString()}
                                                ]
                                            </p>
                                        </span>
                                        <span className="text-sm md:text-md">
                                            {day.days}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-2 rounded-md">
                                <span className="text-md flex items-baseline gap-2">
                                    <p className="truncate text-sm md:text-md max-w-[10rem] sm:max-w-full md:max-w-[10rem] lg:max-w-full">
                                        Please log in to view D-Days.
                                    </p>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full h-full flex justify-center">
                {authState.isAuthenticated ? (
                    <div
                        className={`flex flex-col h-full w-screen container border-x border-dashed ${selectedBorderColor}`}
                    >
                        <div className="flex items-center justify-between px-8 pt-8">
                            <div className="flex items-center gap-2">
                                <h2 className="flex gap-2 justify-center items-center text-lg md:text-xl font-semibold mr-4">
                                    <Calendar className="h-6" />
                                    {formatMonth(currentDate)}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={"outline"}
                                        className={`w-6 h-6 hover:cursor-pointer ${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                        onClick={goToPrevMonth}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant={"outline"}
                                        className={`w-6 h-6 hover:cursor-pointer ${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                        onClick={goToNextMonth}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <Button
                                className={`w-24 h-8 flex items-center gap-2 hover:cursor-pointer ${selectedColor} ${selectedTextColor} ${selectedBorderColor}`}
                                variant={"outline"}
                                onClick={goToToday}
                            >
                                <Calendar1 className="h-6" />
                                <span className="text-md">Today</span>
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-8 flex flex-col h-full">
                            <div
                                className={`rounded-xl sm:p-4 flex flex-col flex-grow ${selectedColor}`}
                            >
                                <div
                                    className={`grid grid-cols-7 p-2 border-b ${selectedBorderColor}`}
                                >
                                    {["S", "M", "T", "W", "T", "F", "S"].map(
                                        (day, i) => (
                                            <div
                                                key={i}
                                                className="text-center font-medium"
                                            >
                                                {day}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div
                                    className={`grid grid-cols-7 flex-grow grid-rows-[repeat(${requiredRows},1fr)]`}
                                >
                                    {monthData.map((day, i) => {
                                        const weekNumber =
                                            Math.floor(i / 7) + 1;
                                        const isHighlightedWeek =
                                            weekNumber === 2 ||
                                            weekNumber === 4;

                                        return (
                                            <div
                                                key={i}
                                                className={`
                                                    p-1 flex flex-col
                                                    ${
                                                        isHighlightedWeek
                                                            ? `border-y border-dashed ${selectedBorderColor}`
                                                            : ""
                                                    }
                                                    ${
                                                        isToday(day)
                                                            ? `${selectedColor} brightness-98`
                                                            : day
                                                            ? "hover:bg-stone-50/30"
                                                            : ""
                                                    }
                                                    ${
                                                        isSelected(day)
                                                            ? `border-x border-dashed ${selectedBorderColor}`
                                                            : ""
                                                    }
                                                `}
                                                onClick={() =>
                                                    day && selectDate(day)
                                                }
                                            >
                                                {day && (
                                                    <div className="flex flex-col h-full">
                                                        <span className="px-1 font-light">
                                                            {day}
                                                        </span>
                                                        <div className="space-y-1 px-1 flex-grow overflow-y-auto">
                                                            {getDDaysForDay(
                                                                day
                                                            ).map(
                                                                (dday, idx) => (
                                                                    <Drawer>
                                                                        <DrawerTrigger
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className={`flex sm:hidden h-5 w-5 rounded-full text-xs truncate border hover:cursor-pointer ${selectedBgColor}`}
                                                                            title={`${dday.title} (${dday.days})`}
                                                                        >
                                                                            &nbsp;
                                                                        </DrawerTrigger>
                                                                        <DrawerTrigger
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className={`hidden sm:flex w-full px-1 rounded text-xs truncate border hover:cursor-pointer ${selectedBgColor}`}
                                                                            title={`${dday.title} (${dday.days})`}
                                                                        >
                                                                            {
                                                                                dday.title
                                                                            }
                                                                        </DrawerTrigger>
                                                                        <DrawerContent>
                                                                            <DrawerHeader>
                                                                                <DrawerTitle>
                                                                                    <div className="flex justify-between items-baseline gap-2 px-4">
                                                                                        <div className="flex items-baseline gap-2">
                                                                                            {
                                                                                                dday.title
                                                                                            }
                                                                                            <span className="text-xs text-gray-500">
                                                                                                [
                                                                                                {dday.date.toLocaleDateString()}

                                                                                                ]
                                                                                            </span>
                                                                                        </div>
                                                                                        {
                                                                                            dday.days
                                                                                        }
                                                                                    </div>
                                                                                </DrawerTitle>
                                                                            </DrawerHeader>
                                                                            <DrawerFooter>
                                                                                <DrawerClose>
                                                                                    <Button
                                                                                        className="w-full hover:cursor-pointer"
                                                                                        variant="outline"
                                                                                    >
                                                                                        Close
                                                                                    </Button>
                                                                                </DrawerClose>
                                                                            </DrawerFooter>
                                                                        </DrawerContent>
                                                                    </Drawer>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col h-full w-screen container border-x border-dashed ${selectedBorderColor}`}
                    >
                        <div className="flex items-center justify-center p-2 rounded-md">
                            <span className="text-md flex items-baseline gap-2">
                                <p className="truncate text-sm md:text-md max-w-[10rem] sm:max-w-full md:max-w-[10rem] lg:max-w-full">
                                    Please log in to view the calendar.
                                </p>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
