"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";

interface DayButtonRowProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    periodDays: Set<string>;
    onPeriodToggle: (date: Date) => void;
    predictedPeriodDays: Set<string>;
}

export const DayButtonRow = memo(function DayButtonRow({
    currentDate,
    onDateSelect,
    periodDays,
    onPeriodToggle,
    predictedPeriodDays,
}: DayButtonRowProps) {
    const formatDateKey = (date: Date) => {
        // Use local date string to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isFutureDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0); // Reset time to start of day
        return checkDate > today;
    };

    const isSelected = (date: Date) => {
        return formatDateKey(date) === formatDateKey(currentDate);
    };

    const isPeriodDay = (date: Date) => {
        return periodDays.has(formatDateKey(date));
    };

    const isPredictedPeriodDay = (date: Date) => {
        return predictedPeriodDays.has(formatDateKey(date));
    };

    const handlePeriodToggle = (date: Date) => {
        // Don't allow editing future dates
        if (isFutureDate(date)) {
            return;
        }
        onPeriodToggle(date);
    };

    const generateDateRow = () => {
        const today = new Date();
        const dates = [];

        for (let i = -5; i <= 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const dateRow = generateDateRow();

    return (
        <Card.Card>
            <Card.CardContent>
                <div className="flex justify-center items-center gap-1">
                    {dateRow.map((date, index) => {
                        const isCurrentDay = isToday(date);
                        const isSelectedDay = isSelected(date);
                        const isPeriod = isPeriodDay(date);
                        const isPredicted = isPredictedPeriodDay(date);
                        const isFuture = isFutureDate(date);

                        let buttonVariant:
                            | "default"
                            | "secondary"
                            | "destructive"
                            | "outline"
                            | "ghost"
                            | "link" = "outline";
                        let className =
                            "w-12 h-full rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center justify-center";

                        if (isPeriod) {
                            buttonVariant = "default";
                            className +=
                                " bg-rose-500 text-white hover:bg-rose-600";
                        } else if (isPredicted) {
                            buttonVariant = "ghost";
                            className +=
                                " border border-dashed border-rose-400 text-rose-400";
                        } else if (isSelectedDay) {
                            buttonVariant = "default";
                            className += "text-white";
                        } else if (isCurrentDay) {
                            buttonVariant = "secondary";
                            className += "";
                        }

                        return (
                            <Button
                                key={index}
                                variant={buttonVariant}
                                className={className}
                                onClick={() => onDateSelect(date)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    if (!isFuture) {
                                        handlePeriodToggle(date);
                                    }
                                }}
                                disabled={isFuture}
                                title={`${date.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}${isPeriod ? " (Period Day)" : ""}${
                                    isPredicted ? " (Predicted Period)" : ""
                                }${
                                    isFuture
                                        ? " (Future date - cannot edit)"
                                        : ""
                                }`}
                            >
                                <div className="text-xs font-normal">
                                    {date.toLocaleDateString("en-US", {
                                        weekday: "short",
                                    })}
                                </div>
                                <div className="text-xs font-bold">
                                    {date.getDate()}
                                </div>
                            </Button>
                        );
                    })}
                </div>

                {/* Instructions */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        💡 Right-click to mark/unmark period days (past dates
                        only)
                    </p>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
});
