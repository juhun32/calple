"use client";

import { redirect } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCalendar } from "@/hooks/useCalendar";
import { useDDays } from "@/hooks/useDDays";
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

    const { ddays } = useDDays();

    return (
        <div className="min-h-screen items-center justify-center">
            <div className="h-screen border-b border-dashed flex justify-center">
                <div className="flex flex-col h-full container border-x border-dashed pt-12">
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

                    <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col h-full">
                        <CalendarGrid
                            currentDate={currentDate}
                            monthData={monthData}
                            requiredRows={requiredRows}
                            isSelected={isSelected}
                            isToday={isToday}
                            selectDate={selectDate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
