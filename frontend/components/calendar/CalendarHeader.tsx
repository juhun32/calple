import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarHeaderProps = {
    currentDate: Date;
    goToNextMonth: () => void;
    goToPrevMonth: () => void;
    goToToday: () => void;
};

export function CalendarHeader({
    currentDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
}: CalendarHeaderProps) {
    const formatMonth = (date: Date) => {
        return date.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                className="w-14 h-6 flex items-center gap-2 hover:cursor-pointer"
                variant={"outline"}
                onClick={goToToday}
            >
                <span className="text-xs">Today</span>
            </Button>
            <Button
                variant={"outline"}
                className={"w-6 h-6 hover:cursor-pointer"}
                onClick={goToPrevMonth}
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
                variant={"outline"}
                className={"w-6 h-6 hover:cursor-pointer"}
                onClick={goToNextMonth}
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1">
                <CalendarIcon className="h-5" strokeWidth={1.5} />
                <h2 className="flex gap-2 justify-center items-center text-md md:text-lg font-semibold">
                    {formatMonth(currentDate)}
                </h2>
            </div>
        </div>
    );
}
