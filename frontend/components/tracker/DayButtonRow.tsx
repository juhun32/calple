"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion"; // Import PanInfo for drag event type
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CircleSmall,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as Tooltip from "../ui/tooltip";

interface DayButtonRowProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    periodDays: Set<string>;
    onPeriodToggle: (date: Date) => void;
    predictedPeriodDays: Set<string>;
    fertilityWindowDays: Set<string>;
}

export const DayButtonRow = memo(function DayButtonRow({
    currentDate,
    onDateSelect,
    periodDays,
    onPeriodToggle,
    predictedPeriodDays,
    fertilityWindowDays,
}: DayButtonRowProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);

    const formatDateKey = (date: Date) => {
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
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
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

    const isFertilityWindowDay = (date: Date) => {
        return fertilityWindowDays.has(formatDateKey(date));
    };

    const handlePeriodToggle = (date: Date) => {
        if (isFutureDate(date)) return;
        onPeriodToggle(date);
    };

    const allDates = useMemo(() => {
        const today = new Date();
        const dates = [];
        const todayIndex = 38;
        const daysBefore = todayIndex;
        const daysAfter = 38;

        for (let i = -daysBefore; i <= daysAfter; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    }, []);

    useEffect(() => {
        const todayIndex = 38;
        const pageForToday = Math.floor(todayIndex / 11);
        setCurrentPage(pageForToday);
    }, [allDates]);

    const getCurrentPageDates = () => {
        const startIndex = currentPage * 11;
        return allDates.slice(startIndex, startIndex + 11);
    };

    const currentPageDates = getCurrentPageDates();

    const paginate = (newDirection: number) => {
        const maxPage = Math.floor(allDates.length / 11) - 1;
        const newPageIndex = currentPage + newDirection;

        if (newPageIndex >= 0 && newPageIndex <= maxPage) {
            setDirection(newDirection);
            setCurrentPage(newPageIndex);
        }
    };

    useEffect(() => {
        if (currentPageDates.length > 0) {
            const today = new Date();
            const todayInPage = currentPageDates.find(
                (date) =>
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
            );

            // if (todayInPage && !isSelected(todayInPage)) {
            //     onDateSelect(todayInPage);
            // }
        }
    }, [currentPage, currentPageDates, onDateSelect]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? "100%" : "-100%",
            opacity: 0,
        }),
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const handleDragEnd = (
        e: MouseEvent | TouchEvent | PointerEvent,
        { offset, velocity }: PanInfo
    ) => {
        const swipe = swipePower(offset.x, velocity.x);

        if (swipe < -swipeConfidenceThreshold) {
            paginate(1); // Swipe left, go to next page
        } else if (swipe > swipeConfidenceThreshold) {
            paginate(-1); // Swipe right, go to previous page
        }
    };

    return (
        <Card.Card>
            <Card.CardHeader>
                <Card.CardTitle className="flex flex-col items-center">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => paginate(-1)}
                            disabled={currentPage === 0}
                            className="p-1"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-center">
                            {(() => {
                                const today = new Date();
                                return today.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                });
                            })()}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => paginate(1)}
                            disabled={
                                currentPage >=
                                Math.floor(allDates.length / 11) - 1
                            }
                            className="p-1"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                </Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>
                <div className="relative h-24 overflow-x-hidden">
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentPage}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                opacity: { duration: 0.2 },
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={handleDragEnd}
                            className="absolute top-0 left-0 w-full flex justify-center items-center gap-1"
                        >
                            {currentPageDates.map((date, index) => {
                                const isCurrentDay = isToday(date);
                                const isSelectedDay = isSelected(date);
                                const isPeriod = isPeriodDay(date);
                                const isPredicted = isPredictedPeriodDay(date);
                                const isFertility = isFertilityWindowDay(date);
                                const isFuture = isFutureDate(date);

                                let buttonVariant:
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                    | "ghost"
                                    | "link" = "outline";
                                let className =
                                    "w-6 sm:w-10 md:w-12 h-24 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center justify-center p-0 has-[>svg]:px-0";

                                if (isPeriod) {
                                    buttonVariant = "default";
                                    className +=
                                        " bg-rose-500 text-white hover:bg-rose-600";
                                } else if (isPredicted) {
                                    buttonVariant = "ghost";
                                    className +=
                                        " border border-dashed border-rose-400 text-rose-400";
                                } else if (isFertility) {
                                    buttonVariant = "ghost";
                                    className +=
                                        " border border-dashed border-blue-400 text-blue-400";
                                } else if (isSelectedDay) {
                                    buttonVariant = "default";
                                } else if (isCurrentDay) {
                                    buttonVariant = "secondary";
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={buttonVariant}
                                        className={className}
                                        onClick={() => handlePeriodToggle(date)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            onDateSelect(date);
                                        }}
                                        disabled={isFuture}
                                        title={`${date.toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            }
                                        )}${isPeriod ? " (Period Day)" : ""}${
                                            isPredicted
                                                ? " (Predicted Period)"
                                                : ""
                                        }${
                                            isFertility
                                                ? " (Fertility Window)"
                                                : ""
                                        }${
                                            isFuture
                                                ? " (Future date - cannot edit)"
                                                : ""
                                        }`}
                                    >
                                        <div className="hidden lg:flex text-xs font-normal">
                                            {date.toLocaleDateString("en-US", {
                                                weekday: "short",
                                            })}
                                        </div>
                                        <div className="flex lg:hidden text-xs font-normal">
                                            {date.toLocaleDateString("en-US", {
                                                weekday: "narrow",
                                            })}
                                        </div>
                                        <CircleSmall
                                            className={cn(
                                                "h-2 w-2",
                                                isPeriod && "text-rose-200",
                                                isPredicted && "text-rose-400",
                                                isFertility && "text-blue-400",
                                                !isPeriod &&
                                                    !isPredicted &&
                                                    !isFertility &&
                                                    "text-transparent"
                                            )}
                                        />
                                        <div className="text-sm lg:text-lg font-semibold">
                                            {date.getDate()}
                                        </div>
                                    </Button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="text-center pt-2">
                    <p className="flex lg:hidden text-xs text-muted-foreground justify-center">
                        Tap to log period • Drag to navigate
                    </p>
                    <div className="hidden lg:flex items-center justify-center gap-2">
                        <Tooltip.Tooltip>
                            <Tooltip.TooltipTrigger asChild>
                                <Button variant="ghost" className="h-4 w-4">
                                    <Info />
                                </Button>
                            </Tooltip.TooltipTrigger>
                            <Tooltip.TooltipContent>
                                <p>
                                    Left-click to log period • Right-click to
                                    view details • Drag to navigate
                                </p>
                            </Tooltip.TooltipContent>
                        </Tooltip.Tooltip>
                    </div>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
});
