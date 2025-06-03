"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCalendar } from "@/lib/hooks/useCalendar";
import { useDDays } from "@/lib/hooks/useDDays";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DDaySheet } from "@/components/calendar/DDaySheet";
import { AddDDayDialog } from "@/components/calendar/AddDdayDialog";

export default function Dates() {
    const { authState } = useAuth();

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    const {
        currentDate,
        monthData,
        requiredRows,
        goToNextMonth,
        goToPrevMonth,
        goToToday,
        isToday,
        isSelected,
        selectDate,
    } = useCalendar();

    const { ddays, getDDaysForDay } = useDDays(currentDate);

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col h-full container pt-12">
                <div className="flex items-center justify-between px-4 md:px-8 pt-8">
                    <CalendarHeader
                        currentDate={currentDate}
                        goToNextMonth={goToNextMonth}
                        goToPrevMonth={goToPrevMonth}
                        goToToday={goToToday}
                    />
                    <div className="flex items-center gap-2">
                        <DDaySheet ddays={ddays} />
                        <AddDDayDialog />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col h-full mb-8">
                    <CalendarGrid
                        currentDate={currentDate}
                        monthData={monthData}
                        requiredRows={requiredRows}
                        isSelected={isSelected}
                        isToday={isToday}
                        selectDate={selectDate}
                        getDDaysForDay={getDDaysForDay}
                    />
                </div>
            </div>
        </div>
    );
}
