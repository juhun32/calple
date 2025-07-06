"use client";

import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ButtonRowCalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    periodDays: Set<string>;
    onPeriodToggle: (date: Date) => void;
    predictedPeriodDays: Set<string>;
    fertilityWindowDays: Set<string>;
    sexualActivityDays: Set<string>;
}

export const ButtonRowCalendar = memo(function ButtonRowCalendar({
    currentDate,
    onDateSelect,
    periodDays,
    onPeriodToggle,
    predictedPeriodDays,
    fertilityWindowDays,
    sexualActivityDays,
}: ButtonRowCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );

    useEffect(() => {
        setCurrentMonth(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        );
    }, [currentDate]);

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

    // This function will generate the grid for a given month
    const generateMonthView = (monthDate: Date) => {
        const getDaysInMonth = (date: Date) =>
            new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const getFirstDayOfMonth = (date: Date) =>
            new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const formatDateKey = (date: Date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                2,
                "0"
            )}-${String(date.getDate()).padStart(2, "0")}`;

        const isToday = (day: number) => {
            const today = new Date();
            return (
                day === today.getDate() &&
                monthDate.getMonth() === today.getMonth() &&
                monthDate.getFullYear() === today.getFullYear()
            );
        };

        const isFutureDate = (day: number) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                day
            );
            checkDate.setHours(0, 0, 0, 0);
            return checkDate > today;
        };

        const isSelected = (day: number) =>
            formatDateKey(
                new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
            ) === formatDateKey(currentDate);
        const isPeriodDay = (day: number) =>
            periodDays.has(
                formatDateKey(
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                )
            );
        const isPredictedPeriodDay = (day: number) =>
            predictedPeriodDays.has(
                formatDateKey(
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                )
            );
        const isFertilityWindowDay = (day: number) =>
            fertilityWindowDays.has(
                formatDateKey(
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                )
            );
        const isSexualActivityDay = (day: number) =>
            sexualActivityDays.has(
                formatDateKey(
                    new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
                )
            );

        const handleDayClick = (day: number) =>
            onDateSelect(
                new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
            );
        const handlePeriodToggle = (date: Date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date > today) return;
            onPeriodToggle(date);
        };

        const daysInMonth = getDaysInMonth(monthDate);
        const firstDayOfMonth = getFirstDayOfMonth(monthDate);
        const monthName = monthDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });

        const dayElements = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayElements.push(<div key={`empty-${i}`} className="w-10 h-10" />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isPeriod = isPeriodDay(day);
            const isPredicted = isPredictedPeriodDay(day);
            const isFertility = isFertilityWindowDay(day);
            const isSexual = isSexualActivityDay(day);
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
            let className = "h-9 w-9 rounded-full text-xs font-medium";

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
            } else if (isFertility) {
                buttonVariant = "ghost";
                className +=
                    " text-blue-400 border-2 border-dashed border-blue-400";
            } else if (isCurrentDay) {
                buttonVariant = "secondary";
            }

            dayElements.push(
                <div
                    className="flex justify-center items-center h-full w-full"
                    key={day}
                >
                    <Button
                        variant={buttonVariant}
                        className={`${className} flex justify-center items-center text-base p-0`}
                        onClick={() =>
                            handlePeriodToggle(
                                new Date(
                                    monthDate.getFullYear(),
                                    monthDate.getMonth(),
                                    day
                                )
                            )
                        }
                        onContextMenu={(e) => {
                            e.preventDefault();
                            handleDayClick(day);
                        }}
                        disabled={isFuture}
                        title={`${day} - ${monthName}`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <span>{day}</span>
                            {isSexual && (
                                <div className="h-1 w-1 rounded-full bg-purple-500"></div>
                            )}
                        </div>
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex-1">
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
                <div className="grid grid-cols-7 gap-1">{dayElements}</div>
            </div>
        );
    };

    const prevMonthDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
    );

    return (
        <Card.Card>
            <Card.CardContent className="px-4 lg:px-8">
                <div className="flex justify-between mb-4">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="hidden lg:flex text-center gap-8">
                        <h3 className="font-semibold flex items-center">
                            {prevMonthDate.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>

                        <Separator orientation="vertical" />

                        <h3 className="font-semibold flex items-center">
                            {currentMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>
                    </div>

                    <div className="flex lg:hidden text-center">
                        <h3 className="text-lg font-semibold flex items-center">
                            {currentMonth.toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex flex-col lg:gap-8">
                    <div className="hidden lg:block flex-1">
                        {generateMonthView(prevMonthDate)}
                    </div>

                    {/* Current Month */}
                    <div className="flex-1">
                        {generateMonthView(currentMonth)}
                    </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Click to log period • Right-click to view details
                </p>
            </Card.CardContent>
        </Card.Card>
    );
});
