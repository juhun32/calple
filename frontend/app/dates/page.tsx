"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Calendar as CalendarIcon,
    Calendar1,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";

export default function Dates() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [date, setDate] = useState<Date>();

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // generates the month data for the calendar
    // This creates an array of days for the current month, including empty cells for padding
    // also calculates the number of rows needed for the calendar grid
    // returns an array of days, where each day is represented by its date number or null for empty cells
    const generateMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        // array for calendar grid
        const days = [];

        // getting the first day of the month by adding the empty cells to the beginning of the array
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const monthData = generateMonthData();

    const formatMonth = (date: Date) => {
        return date.toLocaleString("default", {
            month: "short",
            year: "numeric",
        });
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const goToPrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const isToday = (day: number | null) => {
        if (!day) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number | null) => {
        if (!day) return false;
        return (
            day === selectedDate.getDate() &&
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const selectDate = (day: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const calculateRequiredRows = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const daysInMonth = getDaysInMonth(year, month);

        // first day offset + days in month
        const totalCells = firstDayOfMonth + daysInMonth;

        return Math.ceil(totalCells / 7);
    };

    const requiredRows = calculateRequiredRows();

    // D-Day dates placeholders
    // to be placed in a database and fetched from there
    const startDating = new Date("2024-01-22T00:00:00-05:00");
    const startMathClass = new Date("2023-08-21T00:00:00-04:00");
    const startMason = new Date("2025-08-26T00:00:00-04:00");

    const endDateMasonGraduation = new Date("2027-05-15T00:00:00-04:00");
    const endDateNOVAGraduation = new Date("2025-05-12T00:00:00-04:00");

    function calculateDDay(targetDate: Date): string {
        const now = new Date();
        const today = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        );
        const target = new Date(
            Date.UTC(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate()
            )
        );

        const diffTime = Math.abs(today.getTime() - target.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (target < today) {
            return `D+${diffDays}`;
        } else if (target > today) {
            return `D-${diffDays}`;
        } else {
            return "D-Day";
        }
    }

    const getDDaysForDay = (day: number | null) => {
        if (!day) return [];

        return ddays.filter((dday) => {
            const eventDate = dday.date;

            if (!dday.isAnnual) {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear()
                );
            } else {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth()
                );
            }
        });
    };

    const daysSinceDating = calculateDDay(startDating);
    const daysSinceMathClass = calculateDDay(startMathClass);
    const daysUntilMason = calculateDDay(startMason);
    const daysUntilMasonGrad = calculateDDay(endDateMasonGraduation);
    const daysUntilNOVAGrad = calculateDDay(endDateNOVAGraduation);
    const ddays = [
        {
            title: "Our Dating Anniversary",
            date: startDating,
            days: daysSinceDating,
            isAnnual: true,
        },
        {
            title: "Our First Math Class Together",
            date: startMathClass,
            days: daysSinceMathClass,
            isAnnual: true,
        },
        {
            title: "NOVA Graduation Date",
            date: endDateNOVAGraduation,
            days: daysUntilNOVAGrad,
            isAnnual: false,
        },
        {
            title: "Mason Fall Semester Start Date",
            date: startMason,
            days: daysUntilMason,
            isAnnual: false,
        },
        {
            title: "Mason Graduation Date",
            date: endDateMasonGraduation,
            days: daysUntilMasonGrad,
            isAnnual: false,
        },
    ];

    return (
        <div className="min-h-screen grid grid-rows-[auto_1fr] items-center justify-center ">
            <div className="h-full border-b border-dashed  flex justify-center">
                <div className="flex flex-col h-full container border-x border-dashed ">
                    <div className="flex items-center justify-between px-8 pt-8">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Button
                                    className="w-14 h-6 flex items-center gap-2 hover:cursor-pointer"
                                    variant={"ghost"}
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
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-5" />
                                    <h2 className="flex gap-2 justify-center items-center text-md md:text-lg font-semibold">
                                        {formatMonth(currentDate)}
                                    </h2>
                                </div>
                                <Button
                                    variant={"outline"}
                                    className={"w-6 h-6 hover:cursor-pointer"}
                                    onClick={goToNextMonth}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="h-8">
                                        <Calendar1 className="h-6" />
                                        View D-Days
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="top">
                                    <SheetHeader>
                                        <SheetTitle>D-Days</SheetTitle>
                                        <SheetDescription>
                                            Days until or since, and the date of
                                            the event.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="grid gap-4">
                                        <div className="px-6">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-4/5">
                                                            Event
                                                        </TableHead>
                                                        <TableHead>
                                                            Date
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Count
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {ddays.map((day, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="truncate max-w-3/4">
                                                                {day.title}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {day.date.toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {day.days}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    <SheetFooter>
                                        <SheetClose asChild>
                                            <Button
                                                variant={"outline"}
                                                type="submit"
                                            >
                                                Close
                                            </Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={
                                            "w-24 h-8 flex items-center gap-2 hover:cursor-pointer"
                                        }
                                    >
                                        <Plus className="h-6" />
                                        <span>Create</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Add D-Day
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <label
                                                        htmlFor="title"
                                                        className="text-sm font-medium"
                                                    >
                                                        Title:
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        id="title"
                                                        className="border border-gray-300 rounded-md py-1 px-2 text-sm w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={
                                                                    "outline"
                                                                }
                                                                className={cn(
                                                                    "w-[240px] justify-start text-left font-normal",
                                                                    !date &&
                                                                        "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon />
                                                                {date ? (
                                                                    format(
                                                                        date,
                                                                        "PPP"
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pick a
                                                                        date
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={date}
                                                                onSelect={
                                                                    setDate
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <div className="flex items-center border border-gray-300 rounded-md text-sm w-full">
                                                        <Input
                                                            type="date"
                                                            id="date"
                                                            className="border-none"
                                                        />
                                                        <Label className="text-sm font-medium ml-2">
                                                            Annual:
                                                        </Label>

                                                        <Checkbox
                                                            id="isAnnual"
                                                            className="ml-1 mr-3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction>
                                            Add
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8 flex flex-col h-full">
                        <div
                            className={
                                "rounded-xl sm:p-4 flex flex-col flex-grow"
                            }
                        >
                            <div className={"grid grid-cols-7 p-2 border-b "}>
                                {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (day, i) => (
                                        <div
                                            key={i}
                                            className="text-center font-medium"
                                        >
                                            {day}
                                        </div>
                                    )
                                )}
                            </div>

                            <div
                                className={`grid grid-cols-7 flex-grow grid-rows-[repeat(${requiredRows},1fr)]`}
                            >
                                {monthData.map((day, i) => {
                                    const weekNumber = Math.floor(i / 7) + 1;
                                    const isHighlightedWeek =
                                        weekNumber === 2 || weekNumber === 4;

                                    return (
                                        <div
                                            key={i}
                                            className={`p-1 flex flex-col
                                                    ${
                                                        isHighlightedWeek
                                                            ? "border-y border-dashed"
                                                            : ""
                                                    }
                                                    ${
                                                        isToday(day)
                                                            ? "brightness-98"
                                                            : day
                                                            ? "hover:bg-stone-50/30"
                                                            : ""
                                                    }
                                                    ${
                                                        isSelected(day)
                                                            ? "border-x border-dashed "
                                                            : ""
                                                    }
                                                `}
                                            onClick={() =>
                                                day && selectDate(day)
                                            }
                                        >
                                            {day && (
                                                <div className="flex flex-col h-full">
                                                    <span className="px-1 font-light">
                                                        {day}
                                                    </span>
                                                    <div className="space-y-1 px-1 flex-grow overflow-y-auto">
                                                        {getDDaysForDay(
                                                            day
                                                        ).map((dday, idx) => (
                                                            <Drawer
                                                                key={`dday-${day}-${idx}`}
                                                            >
                                                                <DrawerTrigger
                                                                    className="w-full"
                                                                    title={`${dday.title} (${dday.days})`}
                                                                >
                                                                    <div className="flex sm:hidden h-5 w-5 rounded-full text-xs truncate border hover:cursor-pointer">
                                                                        &nbsp;
                                                                    </div>
                                                                    <div className="hidden sm:flex w-full px-1 rounded text-xs truncate border hover:cursor-pointer">
                                                                        {
                                                                            dday.title
                                                                        }
                                                                    </div>
                                                                </DrawerTrigger>
                                                                <DrawerContent>
                                                                    <DrawerHeader>
                                                                        <DrawerTitle>
                                                                            <div className="flex justify-between items-baseline gap-2 px-4">
                                                                                <div className="flex items-baseline gap-2">
                                                                                    {
                                                                                        dday.title
                                                                                    }
                                                                                    <span className="text-xs text-gray-500">
                                                                                        [
                                                                                        {dday.date.toLocaleDateString()}

                                                                                        ]
                                                                                    </span>
                                                                                </div>
                                                                                {
                                                                                    dday.days
                                                                                }
                                                                            </div>
                                                                        </DrawerTitle>
                                                                    </DrawerHeader>
                                                                    <DrawerFooter>
                                                                        <DrawerClose
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                className="w-full hover:cursor-pointer"
                                                                                variant="outline"
                                                                            >
                                                                                Close
                                                                            </Button>
                                                                        </DrawerClose>
                                                                    </DrawerFooter>
                                                                </DrawerContent>
                                                            </Drawer>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
