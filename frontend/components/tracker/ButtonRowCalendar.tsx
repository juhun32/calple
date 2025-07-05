"use client";

import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ButtonRowCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    periodDays: Set<string>;
    onPeriodToggle: (date: Date) => void;
    predictedPeriodDays: Set<string>;
}

export const ButtonRowCalendar = memo(function ButtonRowCalendar({
    currentDate,
    onDateSelect,
    periodDays,
    onPeriodToggle,
    predictedPeriodDays,
}: ButtonRowCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );

    // Sync currentMonth with currentDate prop
    useEffect(() => {
        setCurrentMonth(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
    }, [currentDate]);

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDateKey = (date: Date) => {
        // Use local date string to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isFutureDate = (day: number) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const checkDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        checkDate.setHours(0, 0, 0, 0); // Reset time to start of day
        return checkDate > today;
    };

    const isSelected = (day: number) => {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        return formatDateKey(date) === formatDateKey(currentDate);
    };

    const isPeriodDay = (day: number) => {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        return periodDays.has(formatDateKey(date));
    };

    const isPredictedPeriodDay = (day: number) => {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        return predictedPeriodDays.has(formatDateKey(date));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        onDateSelect(date);
    };

    const handlePeriodToggle = (date: Date) => {
        // Don't allow editing future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate > today) {
            return;
        }

        const dateKey = formatDateKey(date);
        const newPeriodDays = new Set(periodDays);

        if (newPeriodDays.has(dateKey)) {
            newPeriodDays.delete(dateKey);
        } else {
            newPeriodDays.add(dateKey);
        }

        onPeriodToggle(date);
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const prevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isPeriod = isPeriodDay(day);
        const isPredicted = isPredictedPeriodDay(day);
        const isCurrentDay = isToday(day);
        const isSelectedDay = isSelected(day);
        const isFuture = isFutureDate(day);

        let buttonVariant:
            | "default"
            | "secondary"
            | "destructive"
            | "outline"
            | "ghost"
            | "link" = "outline";
        let className = "h-8 w-8 rounded-full text-xs font-medium";

        if (isPeriod) {
            buttonVariant = "default";
            className += " bg-rose-500 text-white hover:bg-rose-500";
        } else if (isSelectedDay) {
            buttonVariant = "default";
            className += "text-white";
        } else if (isPredicted) {
            buttonVariant = "ghost";
            className +=
                " text-rose-400 border-2 border-dashed border-rose-400";
        } else if (isCurrentDay) {
            buttonVariant = "secondary";
            className += " ";
        }

        days.push(
            <div
                className="flex justify-center items-center h-full w-full"
                key={day}
            >
                <Button
                    variant={buttonVariant}
                    className={`${className} flex justify-center items-center text-base p-0 px-0 py-0`}
                    onClick={() => handleDayClick(day)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        if (!isFuture) {
                            handlePeriodToggle(
                                new Date(
                                    currentMonth.getFullYear(),
                                    currentMonth.getMonth(),
                                    day
                                )
                            );
                        }
                    }}
                    disabled={isFuture}
                    title={`${day} - ${monthName}${
                        isPeriod ? " (Period Day)" : ""
                    }${isPredicted ? " (Predicted Period)" : ""}${
                        isFuture ? " (Future date - cannot edit)" : ""
                    }`}
                >
                    {day}
                </Button>
            </div>
        );
    }

    return (
        <Card.Card>
            <Card.CardContent>
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">{monthName}</h3>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div
                                key={day}
                                className="flex justify-center items-center text-xs text-muted-foreground"
                            >
                                {day}
                            </div>
                        )
                    )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 h-full">{days}</div>

                <p className="text-xs text-muted-foreground mt-4">
                    Right-click on any day to mark/unmark it as a period day
                    (past dates only)
                </p>
            </Card.CardContent>
        </Card.Card>
    );
});
