"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar1 } from "lucide-react";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "app/components/ui/drawer";
import { Button } from "app/components/ui/button";

export default function CalendarPage() {
    interface Event {
        id: string;
        title: string;
        date: Date;
        isAnnual: boolean; // For recurring annual events
        color?: string; // Optional styling
    }

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
            month: "long",
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

    return (
        <div className="h-screen grid grid-rows-[2fr_3fr] items-center justify-center">
            <div className="w-screen h-full border-b border-dashed flex justify-center">
                <div className="container border-x border-dashed w-full p-8">
                    <div className="flex justify-between items-center pb-8">
                        <h2 className="text-xl font-semibold">D-Days</h2>
                        <Button className="w-24 flex justify-center items-center hover:cursor-pointer">
                            <Plus className="h-5" />
                            <span>Create</span>
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                        {ddays.map((day, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2 border rounded-md"
                            >
                                <span className="text-md flex items-baseline gap-2">
                                    <p className="truncate text-sm md:text-md max-w-[10rem] sm:max-w-full md:max-w-[10rem] lg:max-w-full">
                                        {day.title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        [{day.date.toLocaleDateString()}]
                                    </p>
                                </span>
                                <span className="text-sm md:text-md">{day.days}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full h-full border-b border-dashed flex justify-center">
                <div className="flex flex-col h-full w-screen container border-x border-dashed">
                    <div className="flex items-center justify-between px-8 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    className="hover:cursor-pointer"
                                    onClick={goToPrevMonth}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    className="hover:cursor-pointer"
                                    onClick={goToNextMonth}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                            <h2 className="text-xl font-semibold">
                                {formatMonth(currentDate)}
                            </h2>
                        </div>
                        <Button
                            className="w-24 flex items-center gap-2 hover:cursor-pointer"
                            onClick={goToToday}
                        >
                            <Calendar1 className="h-5" />
                            <span className="text-sm">Today</span>
                        </Button>
                    </div>

                    <div className="flex-1 overflow-auto p-8 flex flex-col h-full">
                        <div className="rounded-xl border flex flex-col flex-grow">
                            <div className="grid grid-cols-7 p-2 border-b">
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
                                    const weekNumber = Math.floor(i / 7) + 1;
                                    const isHighlightedWeek =
                                        weekNumber === 2 || weekNumber === 4;

                                    return (
                                        <div
                                            key={i}
                                            className={`
                                                    p-1 flex flex-col
                                                    ${
                                                        isHighlightedWeek
                                                            ? "border-y border-dashed"
                                                            : ""
                                                    }
                                                    ${
                                                        isToday(day)
                                                            ? "bg-stone-100"
                                                            : day
                                                            ? "hover:bg-stone-50/50"
                                                            : ""
                                                    }
                                                    ${
                                                        isSelected(day)
                                                            ? "border-x border-dashed"
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
                                                        ).map((dday, idx) => (
                                                            <Drawer>
                                                                <DrawerTrigger
                                                                    key={idx}
                                                                    className="h-5 w-full px-1 rounded text-xs truncate border hover:cursor-pointer"
                                                                    title={`${dday.title} (${dday.days})`}
                                                                >
                                                                    {dday.title}
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
                                                        ))}
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
            </div>
        </div>
    );
}
