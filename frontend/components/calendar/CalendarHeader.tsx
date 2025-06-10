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

export function CalendarHeader({
    currentDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
}: CalendarHeaderProps) {
    const [formattedMonth, setFormattedMonth] = useState(() => {
        return currentDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    });

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
            <Button
                className="rounded-full w-14 h-6 flex items-center gap-2 hover:cursor-pointer bg-card"
                variant={"outline"}
                onClick={goToToday}
            >
                <span className="text-xs">Today</span>
            </Button>
            <Button
                variant={"outline"}
                className={"rounded-full w-6 h-6 hover:cursor-pointer bg-card"}
                onClick={goToPrevMonth}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
                variant={"outline"}
                className={"rounded-full w-6 h-6 hover:cursor-pointer bg-card"}
                onClick={goToNextMonth}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
                <CalendarIcon className="h-4" strokeWidth={1.5} />
                <h2 className="flex gap-2 justify-center items-center text-md md:text-lg font-semibold">
                    {formattedMonth}
                </h2>
            </div>
        </div>
    );
}
