"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Settings,
    Menu,
} from "lucide-react";

export default function CalendarPage() {
    const [currentView, setCurrentView] = useState("month");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Helper functions for calendar data
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    // Generate calendar grid for month view
    const generateMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);

        // Create array for calendar grid (including empty cells for padding)
        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    const monthData = generateMonthData();

    const formatMonth = (date: Date) => {
        return date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        if (currentView === "day") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (currentView === "week") {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const goToPrevMonth = () => {
        const newDate = new Date(currentDate);
        if (currentView === "day") {
            newDate.setDate(newDate.getDate() - 1);
        } else if (currentView === "week") {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
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
        // Calculate number of rows needed based on first day of month and days in month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const daysInMonth = getDaysInMonth(year, month);

        // Calculate total cells needed (first day offset + days in month)
        const totalCells = firstDayOfMonth + daysInMonth;

        // Calculate rows (divide by 7 days per week and round up)
        return Math.ceil(totalCells / 7);
    };

    // Get required rows for current month
    const requiredRows = calculateRequiredRows();

    // Updated sample calendar events with all events before 4 PM
    const events = [
        {
            id: 1,
            title: "Team Meeting",
            startTime: "09:00",
            endTime: "10:00",
            color: "bg-blue-500",
            day: 1,
            description: "Weekly team sync-up",
            location: "Conference Room A",
            attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
            organizer: "Alice Brown",
        },
        {
            id: 2,
            title: "Lunch with Emily",
            startTime: "12:30",
            endTime: "13:30",
            color: "bg-green-500",
            day: 1,
            description: "Date",
            location: "Cafe Nero",
            attendees: ["Emily Roman"],
            organizer: "You",
        },
        {
            id: 3,
            title: "Project Review",
            startTime: "14:00",
            endTime: "15:30",
            color: "bg-purple-500",
            day: 3,
            description: "Q2 project progress review",
            location: "Meeting Room 3",
            attendees: ["Team Alpha", "Stakeholders"],
            organizer: "Project Manager",
        },
    ];

    // Sample calendar days for the week view
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM

    // Helper function to calculate event position and height
    const calculateEventStyle = (startTime: string, endTime: string) => {
        const start =
            Number.parseInt(startTime.split(":")[0]) +
            Number.parseInt(startTime.split(":")[1]) / 60;
        const end =
            Number.parseInt(endTime.split(":")[0]) +
            Number.parseInt(endTime.split(":")[1]) / 60;
        const top = (start - 8) * 80; // 80px per hour
        const height = (end - start) * 80;
        return { top: `${top}px`, height: `${height}px` };
    };

    // Sample calendar for mini calendar
    const daysInMonth = 31;
    const firstDayOffset = 5; // Friday is the first day of the month in this example
    const miniCalendarDays = Array.from(
        { length: daysInMonth + firstDayOffset },
        (_, i) => (i < firstDayOffset ? null : i - firstDayOffset + 1)
    );

    // Sample my calendars
    const myCalendars = [
        { name: "My Calendar", color: "bg-blue-500" },
        { name: "Work", color: "bg-green-500" },
        { name: "Personal", color: "bg-purple-500" },
        { name: "Family", color: "bg-orange-500" },
    ];

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-950">
            {/* Navigation */}
            <header
                className={
                    "absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6"
                }
                style={{ animationDelay: "0.2s" }}
            >
                <div className="flex items-center gap-4">
                    <Menu className="h-6 w-6 text-white" />
                    <span className="text-2xl font-semibold text-white drop-shadow-lg">
                        Calendar
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>
                    <Settings className="h-6 w-6 text-white drop-shadow-md" />
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                        U
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative h-screen w-full pt-20 flex">
                {/* Sidebar */}
                <div
                    className={
                        "w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl flex flex-col justify-between"
                    }
                    style={{ animationDelay: "0.4s" }}
                >
                    <div>
                        <button className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full">
                            <Plus className="h-5 w-5" />
                            <span>Create</span>
                        </button>

                        {/* Mini Calendar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-medium">
                                    {formatMonth(currentMonth)}
                                </h3>
                                <div className="flex gap-1">
                                    <button
                                        className="p-1 rounded-full hover:bg-white/20"
                                        onClick={goToPrevMonth}
                                    >
                                        <ChevronLeft className="h-4 w-4 text-white" />
                                    </button>
                                    <button
                                        className="p-1 rounded-full hover:bg-white/20"
                                        onClick={goToNextMonth}
                                    >
                                        <ChevronRight className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {["S", "M", "T", "W", "T", "F", "S"].map(
                                    (day, i) => (
                                        <div
                                            key={i}
                                            className="text-xs text-white/70 font-medium py-1"
                                        >
                                            {day}
                                        </div>
                                    )
                                )}

                                {miniCalendarDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                                            day === 5
                                                ? "bg-blue-500 text-white"
                                                : "text-white hover:bg-white/20"
                                        } ${!day ? "invisible" : ""}`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* My Calendars */}
                        <div>
                            <h3 className="text-white font-medium mb-3">
                                My calendars
                            </h3>
                            <div className="space-y-2">
                                {myCalendars.map((cal, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className={`w-3 h-3 rounded-sm ${cal.color}`}
                                        ></div>
                                        <span className="text-white text-sm">
                                            {cal.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* New position for the big plus button */}
                    <button className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start">
                        <Plus className="h-6 w-6" />
                    </button>
                </div>

                {/* Calendar View */}
                <div className={"flex-1 flex flex-col"}>
                    <div className="flex-1 flex flex-col">
                        {/* Calendar Controls */}
                        <div className="flex items-center justify-between p-4 border-b border-white/20">
                            <div className="flex items-center gap-4">
                                <button
                                    className="px-4 py-2 text-white bg-blue-500 rounded-md"
                                    onClick={goToToday}
                                >
                                    Today
                                </button>
                                <div className="flex">
                                    <button
                                        className="p-2 text-white hover:bg-white/10 rounded-l-md"
                                        onClick={goToPrevMonth}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        className="p-2 text-white hover:bg-white/10 rounded-r-md"
                                        onClick={goToNextMonth}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                                <h2 className="text-xl font-semibold text-white">
                                    {formatMonth(currentDate)}
                                </h2>
                            </div>
                        </div>

                        {/* Month View */}
                        <div className="flex-1 overflow-auto p-4 flex flex-col h-full">
                            <div className="bg-white/20 rounded-xl border border-white/20 shadow-xl flex flex-col flex-grow">
                                {/* Days of week header */}
                                <div className="grid grid-cols-7 p-2 sticky top-0 bg-gray-900/50 backdrop-blur-sm z-10">
                                    {[
                                        "Sun",
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                    ].map((day, i) => (
                                        <div
                                            key={i}
                                            className="text-center py-2 text-white font-medium"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar grid - use auto-rows and h-full */}
                                <div
                                    className={`grid grid-cols-7 gap-2 p-2 flex-grow grid-rows-[repeat(${requiredRows},1fr)]`}
                                >
                                    {monthData.map((day, i) => (
                                        <div
                                            key={i}
                                            className={`
                                                p-1 rounded-md transition-colors border flex flex-col
                                                ${day ? "cursor-pointer" : "cursor-default"}
                                                ${day ? "border-white/20" : "border-transparent"} 
                                                ${isToday(day) ? "bg-blue-500/30" : "hover:bg-white/10"}
                                                ${isSelected(day) ? "ring-2 ring-blue-500" : ""}
                                            `}
                                            onClick={() =>
                                                day && selectDate(day)
                                            }
                                        >
                                            {day && (
                                                <div className="flex flex-col h-full">
                                                    <span
                                                        className={`
                                    text-lg font-medium w-8 h-8 flex items-center justify-center rounded-full
                                    ${
                                        isToday(day)
                                            ? "bg-blue-500 text-white"
                                            : "text-white"
                                    }
                                `}
                                                    >
                                                        {day}
                                                    </span>
                                                    <div className="mt-1 space-y-1 flex-grow overflow-y-auto">
                                                        {/* Event indicators would go here */}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
