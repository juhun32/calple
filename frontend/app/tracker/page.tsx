"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Activity,
    Calendar as CalendarIcon,
    Plus,
    TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import {
    CycleStatusCard,
    QuickStatsGrid,
    TodaysSummary,
    SelectedDateDetails,
    InsightsCard,
} from "@/components/tracker";
import { usePeriods } from "@/lib/hooks/usePeriods";
import { PeriodTest } from "@/components/tracker/PeriodTest";

// Lazy load calendar components
const DayButtonRow = lazy(() =>
    import("@/components/tracker/DayButtonRow").then((module) => ({
        default: module.DayButtonRow,
    }))
);
const LogForm = lazy(() =>
    import("@/components/tracker/LogForm").then((module) => ({
        default: module.LogForm,
    }))
);

// Import ButtonRowCalendar normally for immediate loading
import { ButtonRowCalendar } from "@/components/tracker/ButtonRowCalendar";

// Loading component for calendar
const CalendarLoader = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-muted-foreground">
            Loading calendar...
        </span>
    </div>
);

// Helper function to format date consistently
const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// Helper function to parse date key back to Date
const parseDateKey = (dateKey: string): Date => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export default function Tracker() {
    const { authState } = useAuth();
    const {
        periodDays,
        periodDaysSet,
        cycleSettings,
        loading,
        error,
        togglePeriodDay,
        updateSettings,
        updatePeriodDay,
        getLogForDate,
    } = usePeriods();

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTab, setSelectedTab] = useState("overview");
    const [calendarLoaded, setCalendarLoaded] = useState(false);

    // Use cycle settings from backend or defaults
    const cycleLength = cycleSettings?.cycleLength || 28;
    const periodLength = cycleSettings?.periodLength || 5;

    // Calculate the most recent period start and end dates
    const { mostRecentPeriodStart, mostRecentPeriodEnd } = useMemo(() => {
        if (periodDaysSet.size === 0)
            return { mostRecentPeriodStart: null, mostRecentPeriodEnd: null };

        const sortedDates = Array.from(periodDaysSet)
            .map(parseDateKey)
            .sort((a, b) => a.getTime() - b.getTime()); // Sort ascending

        // Find the most recent period by looking for period days within a reasonable range
        let periodStart: Date | null = null;
        let periodEnd: Date | null = null;

        // Group dates into potential periods (dates within 7 days of each other)
        const potentialPeriods: Date[][] = [];
        let currentPeriod: Date[] = [];

        for (let i = 0; i < sortedDates.length; i++) {
            const currentDate = sortedDates[i];

            if (currentPeriod.length === 0) {
                currentPeriod.push(currentDate);
            } else {
                const lastDate = currentPeriod[currentPeriod.length - 1];
                const daysDiff = Math.ceil(
                    (currentDate.getTime() - lastDate.getTime()) /
                        (1000 * 60 * 60 * 24)
                );

                // If dates are within 3 days of each other, consider them part of the same period
                if (daysDiff <= 3) {
                    currentPeriod.push(currentDate);
                } else {
                    // Start a new period
                    if (currentPeriod.length > 0) {
                        potentialPeriods.push([...currentPeriod]);
                    }
                    currentPeriod = [currentDate];
                }
            }
        }

        // Add the last period
        if (currentPeriod.length > 0) {
            potentialPeriods.push(currentPeriod);
        }

        // Find the most recent period
        if (potentialPeriods.length > 0) {
            const mostRecentPeriod =
                potentialPeriods[potentialPeriods.length - 1];
            periodStart = mostRecentPeriod[0]; // First date in the period
            periodEnd = mostRecentPeriod[mostRecentPeriod.length - 1]; // Last date in the period
        }

        // If no periods found, use the most recent single period day as the start
        if (!periodStart && sortedDates.length > 0) {
            const mostRecent = sortedDates[sortedDates.length - 1];
            periodStart = mostRecent;
            // Calculate the expected end date based on period length
            periodEnd = new Date(mostRecent);
            periodEnd.setDate(mostRecent.getDate() + periodLength - 1);
        }

        return {
            mostRecentPeriodStart: periodStart,
            mostRecentPeriodEnd: periodEnd,
        };
    }, [periodDaysSet, periodLength]);

    // Check if user has any period data
    const hasPeriodData = mostRecentPeriodStart !== null;

    // Calculate next period date (only if we have period data)
    const nextPeriod =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const next = new Date(mostRecentPeriodStart);
                  next.setDate(mostRecentPeriodStart.getDate() + cycleLength);
                  return next;
              })()
            : null;

    // Calculate days until next period (only if we have period data)
    const today = new Date();
    const daysUntilNextPeriod =
        hasPeriodData && nextPeriod
            ? Math.ceil(
                  (nextPeriod.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
              )
            : null;

    // Calculate current cycle day (only if we have period data)
    const currentCycleDay =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const daysSinceLastPeriod = Math.ceil(
                      (today.getTime() - mostRecentPeriodStart.getTime()) /
                          (1000 * 60 * 60 * 24)
                  );
                  // Calculate cycle day (1-based, where 1 is the first day of period)
                  const cycleDay = daysSinceLastPeriod % cycleLength;
                  return cycleDay === 0 ? cycleLength : cycleDay;
              })()
            : null;

    // Calculate fertility window (only if we have period data)
    const fertileStart =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const start = new Date(mostRecentPeriodStart);
                  start.setDate(mostRecentPeriodStart.getDate() + 11);
                  return start;
              })()
            : null;

    const fertileEnd =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const end = new Date(mostRecentPeriodStart);
                  end.setDate(mostRecentPeriodStart.getDate() + 17);
                  return end;
              })()
            : null;

    // Generate predicted period days (only if we have period data)
    const generatePredictedPeriodDays = () => {
        if (!hasPeriodData || !mostRecentPeriodStart) return new Set<string>();

        const predicted = new Set<string>();

        // First, add the expected period days for the current period (if it's not complete)
        if (mostRecentPeriodStart) {
            // Check if the current period is complete by counting confirmed period days
            let confirmedDays = 0;
            for (let day = 0; day < periodLength; day++) {
                const periodDay = new Date(mostRecentPeriodStart);
                periodDay.setDate(mostRecentPeriodStart.getDate() + day);
                const periodDayKey = formatDateKey(periodDay);

                if (periodDaysSet.has(periodDayKey)) {
                    confirmedDays++;
                }
            }

            // Only show predicted days if the period is not complete
            if (confirmedDays < periodLength) {
                for (let day = 0; day < periodLength; day++) {
                    const periodDay = new Date(mostRecentPeriodStart);
                    periodDay.setDate(mostRecentPeriodStart.getDate() + day);
                    const periodDayKey = formatDateKey(periodDay);

                    // Only add if it's not already a confirmed period day
                    if (!periodDaysSet.has(periodDayKey)) {
                        predicted.add(periodDayKey);
                    }
                }
            }
        }

        // Start from the most recent period start and predict future periods
        let currentPeriodStart = new Date(mostRecentPeriodStart);

        // Add cycle length to get to the next period start
        currentPeriodStart.setDate(
            mostRecentPeriodStart.getDate() + cycleLength
        );

        // Generate 3 future periods
        for (let i = 0; i < 3; i++) {
            // For each period, add periodLength days starting from the period start
            for (let day = 0; day < periodLength; day++) {
                const periodDay = new Date(currentPeriodStart);
                periodDay.setDate(currentPeriodStart.getDate() + day);
                predicted.add(formatDateKey(periodDay));
            }
            // Move to the next period start
            currentPeriodStart.setDate(
                currentPeriodStart.getDate() + cycleLength
            );
        }
        return predicted;
    };

    const predictedPeriodDays = generatePredictedPeriodDays();

    // Handle period day toggle using backend API
    const handlePeriodToggle = async (date: Date) => {
        const dateKey = formatDateKey(date);
        await togglePeriodDay(dateKey);
    };

    // Wrapper functions for LogForm
    const handleSaveLog = async (log: {
        date: string;
        symptoms: string[];
        mood: string[];
        activities: string[];
        notes: string;
    }) => {
        await updatePeriodDay(log.date, {
            symptoms: log.symptoms,
            mood: log.mood,
            activities: log.activities,
            notes: log.notes,
        });
    };

    const handleUpdateLog = async (log: {
        date: string;
        symptoms: string[];
        mood: string[];
        activities: string[];
        notes: string;
    }) => {
        await updatePeriodDay(log.date, {
            symptoms: log.symptoms,
            mood: log.mood,
            activities: log.activities,
            notes: log.notes,
        });
    };

    // Handle tab change with lazy loading
    const handleTabChange = (newTab: string) => {
        setSelectedTab(newTab);
        if ((newTab === "overview" || newTab === "log") && !calendarLoaded) {
            setCalendarLoaded(true);
        }
    };

    // Show loading state only for initial data load
    if (loading && !calendarLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-lg">Loading period data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 pt-20 pb-16">
                <Tabs value={selectedTab} onValueChange={handleTabChange}>
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-2"
                        >
                            <Activity className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="log"
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Log
                        </TabsTrigger>
                        <TabsTrigger
                            value="insights"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Insights
                        </TabsTrigger>
                        <TabsTrigger
                            value="test"
                            className="flex items-center gap-2"
                        >
                            Test
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="overview"
                        className="flex flex-col gap-4"
                    >
                        {calendarLoaded ? (
                            <Suspense fallback={<CalendarLoader />}>
                                <DayButtonRow
                                    currentDate={date || new Date()}
                                    onDateSelect={setDate}
                                    periodDays={periodDaysSet}
                                    onPeriodToggle={handlePeriodToggle}
                                    predictedPeriodDays={predictedPeriodDays}
                                />
                            </Suspense>
                        ) : (
                            <div className="h-32 flex items-center justify-center">
                                <button
                                    onClick={() => setCalendarLoaded(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Load Calendar
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-[5fr_2fr_1fr] gap-4 justify-center items-center">
                            <CycleStatusCard
                                currentCycleDay={currentCycleDay}
                                cycleLength={cycleLength}
                                daysUntilNextPeriod={daysUntilNextPeriod}
                                nextPeriod={nextPeriod}
                                hasPeriodData={hasPeriodData}
                            />

                            {date && (
                                <SelectedDateDetails
                                    date={date}
                                    periodData={getLogForDate(
                                        formatDateKey(date)
                                    )}
                                />
                            )}

                            <QuickStatsGrid
                                fertileStart={fertileStart}
                                fertileEnd={fertileEnd}
                                cycleLength={cycleLength}
                                hasPeriodData={hasPeriodData}
                            />
                        </div>

                        <TodaysSummary
                            todaysData={getLogForDate(
                                formatDateKey(new Date())
                            )}
                            onLogClick={() => handleTabChange("log")}
                        />
                    </TabsContent>

                    <TabsContent value="log" className="space-y-4">
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <ButtonRowCalendar
                                currentDate={date || new Date()}
                                onDateSelect={setDate}
                                periodDays={periodDaysSet}
                                onPeriodToggle={handlePeriodToggle}
                                predictedPeriodDays={predictedPeriodDays}
                            />

                            {calendarLoaded ? (
                                <Suspense fallback={<CalendarLoader />}>
                                    <LogForm
                                        date={date || new Date()}
                                        existingLog={
                                            date
                                                ? getLogForDate(
                                                      formatDateKey(date)
                                                  )
                                                : null
                                        }
                                        onSave={handleSaveLog}
                                        onUpdate={handleUpdateLog}
                                    />
                                </Suspense>
                            ) : (
                                <div className="h-64 flex items-center justify-center">
                                    <p className="text-muted-foreground">
                                        Load calendar to log data
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                        <InsightsCard />
                    </TabsContent>

                    <TabsContent value="test" className="space-y-4">
                        <PeriodTest />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
