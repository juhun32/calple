"use client";

import { useEffect, useState } from "react";

// components
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// types
import { type CalendarHeaderProps } from "@/lib/types/calendar";

// header component for the calendar with navigation controls - used by calendar page
export function CalendarHeader({
    currentDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
}: CalendarHeaderProps) {
    // state for the formatted month display (responsive to screen size) - shown in header title
    const [formattedMonth, setFormattedMonth] = useState(() => {
        return currentDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    });

    // update month format based on screen size when currentDate changes - responsive design
    useEffect(() => {
        const screenWidth = window.innerWidth;
        const monthFormat = screenWidth > 768 ? "long" : "short";
        setFormattedMonth(
            currentDate.toLocaleString("default", {
                month: monthFormat,
                year: "numeric",
            })
        );
    }, [currentDate]);

    return (
        <div className="flex items-center gap-2">
            {/* today button - navigates to current month - calls useCalendar hook goToToday */}
            <Button
                className="rounded-full w-16 h-8 flex items-center gap-2 hover:cursor-pointer"
                variant={"outline"}
                onClick={goToToday}
            >
                <span className="text-xs">Today</span>
            </Button>
            {/* previous month button - calls useCalendar hook goToPrevMonth */}
            <Button
                variant={"outline"}
                className={"rounded-full w-8 h-8 hover:cursor-pointer"}
                onClick={goToPrevMonth}
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            {/* next month button - calls useCalendar hook goToNextMonth */}
            <Button
                variant={"outline"}
                className={"rounded-full w-8 h-8 hover:cursor-pointer"}
                onClick={goToNextMonth}
            >
                <ChevronRight className="h-6 w-6" />
            </Button>
            {/* current month/year display - shows formatted month from state */}
            <div className="flex items-center gap-1">
                <CalendarIcon className="h-4" strokeWidth={1.5} />
                <h2 className="flex gap-2 justify-center items-center text-md md:text-lg font-medium px-2 md:px-4 rounded-md lg:rounded-lg bg-card inset-shadow-sm border">
                    {formattedMonth}
                </h2>
            </div>
        </div>
    );
}
