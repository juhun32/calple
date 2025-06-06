"use client";

// TODO

// 1.
// need to make stared events for dday dialog. right now it is only
// showing one month's events, but it should show all events
// but that is not possible if there are lots of events
// so i think we will need to only hsow special events
// which are starred or something like that

// 2.
// for annual events, dday is not working properly
// it is showing the D-Day based on the current date
// but it should show the D-Day based on the year of the event
// for ex) D-3 to event from 2025/1/1 should be D-368 for 2026/1/1

// 3.
// pagination is done, but i think there are some improvements
// that canbe made. like lazy loading, etc.

// 4.
// +number button is not yet implemented
// for days with >2 events

import { redirect } from "next/navigation";

// hooks
import { useCalendar } from "@/lib/hooks/useCalendar";
import { useDDays } from "@/lib/hooks/useDDays";

// components
import { useAuth } from "@/components/auth-provider";

// components/calendar
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DDaySheet } from "@/components/calendar/DDaySheet";
import { AddDDayDialog } from "@/components/calendar/AddDdayDialog";

export default function Dates() {
    const { authState } = useAuth();

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    // hooks for calendar state
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

    // hooks for dday state
    // this will fetch all dday events for the current month
    const { ddays, getDDaysForDay, updateDDay, deleteDDay, createDDay } =
        useDDays(currentDate);

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="container lg:grid lg:grid-cols-[3fr_1fr] h-full">
                <div className="flex flex-col h-full container pt-12 pb-8">
                    <div className="flex items-center justify-between px-4 md:px-8 pt-8">
                        <CalendarHeader
                            currentDate={currentDate}
                            goToNextMonth={goToNextMonth}
                            goToPrevMonth={goToPrevMonth}
                            goToToday={goToToday}
                        />
                        <div className="flex items-center gap-2">
                            <div className="flex lg:hidden">
                                <DDaySheet ddays={ddays} />
                            </div>
                            <AddDDayDialog createDDay={createDDay} />
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
                            getDDaysForDay={getDDaysForDay}
                            createDDay={createDDay}
                            updateDDay={updateDDay}
                            deleteDDay={deleteDDay}
                        />
                    </div>
                </div>
                <div className="hidden lg:flex flex-col h-full pr-4 md:pr-8 pt-20 pb-8">
                    <DDaySheet ddays={ddays} />
                </div>
            </div>
        </div>
    );
}
