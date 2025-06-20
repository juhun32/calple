"use client";
import { useState } from "react";

// drag & drop
import { useDroppable } from "@dnd-kit/core";

// components
import { Button } from "../ui/button";

// icons
import { CirclePlus } from "lucide-react";

// internal components
import { DDayIndicator } from "./DDayIndicator";
import { AddDDayDialog } from "./AddDdayDialog";
import { ShowAllEvents } from "./ShowAllEvents";

// types
import { CalendarGridProps, DDay } from "@/lib/types/calendar";

// This is the new component for a single day cell.
function CalendarDayCell({
    day,
    index,
    currentDate,
    isSelected,
    isToday,
    selectDate,
    getDDaysForDay,
    updateDDay,
    deleteDDay,
    handleAddClick,
}: {
    day: number | null;
    index: number;
    currentDate: Date;
    isSelected: (day: number) => boolean;
    isToday: (day: number) => boolean;
    selectDate: (day: number) => void;
    getDDaysForDay: (day: number | null, currentDate: Date) => DDay[];
    updateDDay: CalendarGridProps["updateDDay"];
    deleteDDay: CalendarGridProps["deleteDDay"];
    handleAddClick: (e: React.MouseEvent, day: number) => void;
}) {
    // The useDroppable hook is now correctly called at the top level of this component.
    const dateForId = day
        ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        : null;
    const droppableId = dateForId
        ? dateForId.toISOString().split("T")[0]
        : `empty-${index}`;

    const { isOver, setNodeRef } = useDroppable({
        id: droppableId,
        disabled: !day,
    });

    const weekNumber = Math.floor(index / 7) + 1;
    const isHighlightedWeek =
        weekNumber === 2 || weekNumber === 4 || weekNumber === 6;
    const dayDdays = getDDaysForDay(day, currentDate);

    return (
        <div
            ref={setNodeRef}
            className={`p-2 flex flex-col h-full
            ${isHighlightedWeek ? "border-y border-dashed" : ""}
            ${isOver ? " bg-accent" : ""}`}
            onClick={() => day && selectDate(day)}
        >
            {day && (
                <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-1">
                        {isSelected(day) ? (
                            <div className="flex items-center justify-between h-6">
                                <div className="w-6 flex justify-center border-b border-foreground">
                                    {day}
                                </div>
                                <Button
                                    variant="ghost"
                                    className="hidden sm:flex h-6 w-6 rounded-full"
                                    size={"sm"}
                                    onClick={(e) => handleAddClick(e, day)}
                                >
                                    <CirclePlus className="h-6" />
                                </Button>
                            </div>
                        ) : isToday(day) ? (
                            <div className="h-6 w-6 border-b border-foreground border-dashed flex items-center justify-center">
                                {day}
                            </div>
                        ) : (
                            <div className="h-6 w-6 flex items-center justify-center text-muted-foreground">
                                {day}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col mt-1 gap-1 text-xs">
                        {dayDdays.slice(0, 2).map((dday, idx) => (
                            <div
                                key={`dday-slice-${day}-${idx}-${
                                    dday.id || idx
                                }`}
                                className="border rounded-full h-5 flex items-center text-xs"
                            >
                                <DDayIndicator
                                    dday={dday}
                                    updateDDay={updateDDay}
                                    deleteDDay={deleteDDay}
                                />
                            </div>
                        ))}
                        <div>
                            {dayDdays.length >= 3 && (
                                <ShowAllEvents
                                    ddays={dayDdays}
                                    updateDDay={updateDDay}
                                    deleteDDay={deleteDDay}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CalendarGrid({
    currentDate,
    monthData,
    isSelected,
    isToday,
    selectDate,
    getDDaysForDay,
    createDDay,
    updateDDay,
    deleteDDay,
}: CalendarGridProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [selectedDateForAdd, setSelectedDateForAdd] = useState<Date | null>(
        null
    );

    const [isShowAllEventsDialogOpen, setIsShowAllEventsDialogOpen] =
        useState(false);

    const handleAddClick = (e: React.MouseEvent, day: number) => {
        // prevent the click event from bubbling up to the parent div
        e.stopPropagation();

        const dateForDialog = new Date(currentDate);
        dateForDialog.setDate(day);

        setSelectedDateForAdd(dateForDialog);
        setIsAddDialogOpen(true);
    };

    return (
        <>
            <div className="rounded-xl flex flex-col min-h-0 h-full border border-dashed sm:p-4 bg-card">
                <div className="grid grid-cols-7 p-2 border-b">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                        <div key={i} className="text-center font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr h-full">
                    {monthData.map((day, i) => (
                        <CalendarDayCell
                            key={i}
                            index={i}
                            day={day}
                            currentDate={currentDate}
                            isSelected={isSelected}
                            isToday={isToday}
                            selectDate={selectDate}
                            getDDaysForDay={getDDaysForDay}
                            updateDDay={updateDDay}
                            deleteDDay={deleteDDay}
                            handleAddClick={handleAddClick}
                        />
                    ))}
                </div>
            </div>
            <AddDDayDialog
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                initialDate={selectedDateForAdd}
                createDDay={createDDay}
            />
        </>
    );
}
