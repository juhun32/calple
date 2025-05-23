import { CirclePlus } from "lucide-react";
import { Button } from "../ui/button";
import { DDayIndicator } from "./DDayIndicator";
import { useDDays } from "@/hooks/useDDays";

type CalendarGridProps = {
    currentDate: Date;
    monthData: (number | null)[];
    requiredRows: number;
    isSelected: (day: number | null) => boolean;
    isToday: (day: number | null) => boolean;
    selectDate: (day: number) => void;
};

export function CalendarGrid({
    currentDate,
    monthData,
    requiredRows,
    isSelected,
    isToday,
    selectDate,
}: CalendarGridProps) {
    const { getDDaysForDay } = useDDays();

    return (
        <div className="rounded-xl flex flex-col flex-grow pb-8">
            <div className="grid grid-cols-7 p-2 border-b">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="text-center font-medium">
                        {day}
                    </div>
                ))}
            </div>

            <div
                className={`grid grid-cols-7 flex-grow grid-rows-[repeat(${requiredRows},1fr)]`}
            >
                {monthData.map((day, i) => {
                    const weekNumber = Math.floor(i / 7) + 1;
                    const isHighlightedWeek =
                        weekNumber === 2 ||
                        weekNumber === 4 ||
                        weekNumber === 6;
                    const dayDdays = getDDaysForDay(day, currentDate);

                    return (
                        <div
                            key={i}
                            className={`p-2 flex flex-col
                                ${
                                    isHighlightedWeek
                                        ? "border-y border-dashed"
                                        : ""
                                }
                                `}
                            onClick={() => day && selectDate(day)}
                        >
                            {day && (
                                <div className="flex flex-col h-16 sm:min-h-20">
                                    <span className="flex flex-col gap-1">
                                        {isSelected(day) ? (
                                            <div className="flex items-center justify-between">
                                                <div className="h-8 w-8 px-2 py-1 w-fit rounded-md flex justify-center sm:justify-start font-medium">
                                                    {day}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className="hidden sm:flex h-8 w-8"
                                                >
                                                    <CirclePlus className="h-6" />
                                                </Button>
                                            </div>
                                        ) : isToday(day) ? (
                                            <div className="h-8 w-8 px-2 py-1 w-fit rounded-lg bg-neutral-900/90 dark:bg-neutral-50 text-white dark:text-black flex items-center justify-center sm:justify-start">
                                                {day}
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 px-2 py-1 w-fit rounded-md flex justify-center sm:justify-start font-normal">
                                                {day}
                                            </div>
                                        )}

                                        {dayDdays.map((dday, idx) => (
                                            <DDayIndicator
                                                key={`dday-${day}-${idx}`}
                                                dday={dday}
                                            />
                                        ))}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
