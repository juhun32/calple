"use client";

import { useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Settings,
    Menu,
    Calendar1,
} from "lucide-react";

export default function CalendarPage() {
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

    return (
        <div className="grid grid-rows-[5rem_auto] min-h-screen w-full overflow-hidden bg-gray-800">
            {/* Navigation */}
            <div
                className={"flex items-center justify-between px-8 py-6"}
                style={{ animationDelay: "0.2s" }}
            >
                <div className="flex items-center gap-4">
                    <Menu className="h-6 w-6 text-white" />
                    <span className="text-2xl font-semibold text-white">
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
            </div>

            {/* Main Content */}
            <main className="h-[100vh_-_5rem] w-full flex">
                {/* Sidebar */}
                <div
                    className={
                        "w-1/2 bg-white/10 p-4 rounded-tr-xl flex flex-col justify-between"
                    }
                >
                    <div>
                        <button className="flex justify-center items-center px-4 py-2 text-white bg-blue-500 rounded-md gap-1">
                            <Plus className="h-5" />
                            <span>Create</span>
                        </button>

                        <div className="mt-4 flex flex-col">
                            {events.map((event, i) => (
                                <div
                                    key={i}
                                    className={`p-2 text-sm text-white rounded flex items-center`}
                                >
                                    {event.title}
                                    {event.startTime} - {event.endTime}
                                    <div
                                        className={`w-2 h-2 rounded-full ml-2 ${event.color}`}
                                    ></div>
                                    {event.location && (
                                        <span className="ml-2">
                                            {event.location}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calendar View */}
                <div className={"flex-1 flex flex-col"}>
                    <div className="flex-1 flex flex-col">
                        {/* Calendar Controls */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-4">
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
                            <button
                                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:cursor-pointer"
                                onClick={goToToday}
                            >
                                <div className="flex items-center gap-1">
                                    <Calendar1 className="h-5" />
                                    Today
                                </div>
                            </button>
                        </div>

                        {/* Month View */}
                        <div className="flex-1 overflow-auto p-4 flex flex-col h-full">
                            <div className="rounded-xl border border-white/20 shadow-xl flex flex-col flex-grow">
                                {/* Days of week header */}
                                <div className="grid grid-cols-7 p-2 bg-white/10 rounded-t-xl">
                                    {["S", "M", "T", "W", "T", "F", "S"].map(
                                        (day, i) => (
                                            <div
                                                key={i}
                                                className="text-center text-white/50 font-medium"
                                            >
                                                {day}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Calendar grid - use auto-rows and h-full */}
                                <div
                                    className={`grid grid-cols-7 flex-grow grid-rows-[repeat(${requiredRows},1fr)] border-l border-t border-white/10`}
                                >
                                    {monthData.map((day, i) => {
                                        const weekNumber =
                                            Math.floor(i / 7) + 1;
                                        const isHighlightedWeek =
                                            weekNumber === 2 ||
                                            weekNumber === 4;

                                        return (
                                            <div
                                                key={i}
                                                className={`
                                                    p-1 flex flex-col
                                                    ${
                                                        isHighlightedWeek
                                                            ? "border-y border-white/10"
                                                            : ""
                                                    }
                                                    ${
                                                        day
                                                            ? "cursor-pointer"
                                                            : "cursor-default"
                                                    }
                                                    ${
                                                        isToday(day)
                                                            ? "bg-white/10"
                                                            : day
                                                            ? "hover:bg-white/10"
                                                            : ""
                                                    }
                                                    ${
                                                        isSelected(day)
                                                            ? "border-x border-white/10"
                                                            : ""
                                                    }
                                                `}
                                                onClick={() =>
                                                    day && selectDate(day)
                                                }
                                            >
                                                {day && (
                                                    <div className="flex flex-col h-full">
                                                        <span className="px-1 text-md text-white/90 font-light">
                                                            {day}
                                                        </span>
                                                        <div className="mt-1 space-y-1 flex-grow overflow-y-auto">
                                                            {/* Event indicators would go here */}
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
            </main>
        </div>
    );
}
