"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Plus, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import {
    CycleStatusCard,
    TodaysSummary,
    SelectedDateDetails,
    InsightsCard,
    DayButtonRow,
    LogForm,
    ButtonRowCalendar,
} from "@/components/tracker";
import { usePeriods } from "@/lib/hooks/usePeriods";

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

    // Generate fertility window days (only if we have period data)
    const generateFertilityWindowDays = () => {
        if (!hasPeriodData || !mostRecentPeriodStart) return new Set<string>();

        const fertilityDays = new Set<string>();

        // Generate fertility window for current cycle
        if (mostRecentPeriodStart) {
            for (let day = 11; day <= 17; day++) {
                const fertilityDay = new Date(mostRecentPeriodStart);
                fertilityDay.setDate(mostRecentPeriodStart.getDate() + day);
                fertilityDays.add(formatDateKey(fertilityDay));
            }
        }

        // Generate fertility windows for future cycles
        let currentPeriodStart = new Date(mostRecentPeriodStart);

        // Add cycle length to get to the next period start
        currentPeriodStart.setDate(
            mostRecentPeriodStart.getDate() + cycleLength
        );

        // Generate 3 future fertility windows
        for (let i = 0; i < 3; i++) {
            for (let day = 11; day <= 17; day++) {
                const fertilityDay = new Date(currentPeriodStart);
                fertilityDay.setDate(currentPeriodStart.getDate() + day);
                fertilityDays.add(formatDateKey(fertilityDay));
            }
            // Move to the next period start
            currentPeriodStart.setDate(
                currentPeriodStart.getDate() + cycleLength
            );
        }
        return fertilityDays;
    };

    const predictedPeriodDays = generatePredictedPeriodDays();
    const fertilityWindowDays = generateFertilityWindowDays();

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

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 pt-20 pb-16">
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
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
                        {/* <TabsTrigger
                            value="insights"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Insights
                        </TabsTrigger> */}
                    </TabsList>

                    <TabsContent
                        value="overview"
                        className="flex flex-col gap-4"
                    >
                        <DayButtonRow
                            currentDate={date || new Date()}
                            onDateSelect={setDate}
                            periodDays={periodDaysSet}
                            onPeriodToggle={handlePeriodToggle}
                            predictedPeriodDays={predictedPeriodDays}
                            fertilityWindowDays={fertilityWindowDays}
                        />

                        <div className="grid grid-cols-[3fr_2fr] gap-4 justify-center items-center">
                            <CycleStatusCard
                                currentCycleDay={currentCycleDay}
                                cycleLength={cycleLength}
                                daysUntilNextPeriod={daysUntilNextPeriod}
                                nextPeriod={nextPeriod}
                                hasPeriodData={hasPeriodData}
                                fertileStart={fertileStart}
                                fertileEnd={fertileEnd}
                            />

                            {date && (
                                <SelectedDateDetails
                                    date={date}
                                    periodData={getLogForDate(
                                        formatDateKey(date)
                                    )}
                                />
                            )}
                        </div>

                        <TodaysSummary
                            todaysData={getLogForDate(
                                formatDateKey(new Date())
                            )}
                            onLogClick={() => setSelectedTab("log")}
                        />
                    </TabsContent>

                    <TabsContent value="log" className="space-y-4">
                        <div className="grid grid-cols-[auto_auto] gap-4">
                            <ButtonRowCalendar
                                currentDate={date || new Date()}
                                onDateSelect={setDate}
                                periodDays={periodDaysSet}
                                onPeriodToggle={handlePeriodToggle}
                                predictedPeriodDays={predictedPeriodDays}
                                fertilityWindowDays={fertilityWindowDays}
                            />

                            <LogForm
                                date={date || new Date()}
                                existingLog={
                                    date
                                        ? getLogForDate(formatDateKey(date))
                                        : null
                                }
                                onSave={handleSaveLog}
                                onUpdate={handleUpdateLog}
                            />
                        </div>
                    </TabsContent>

                    {/* <TabsContent value="insights" className="space-y-4">
                        <InsightsCard />
                    </TabsContent> */}
                </Tabs>
            </div>
        </div>
    );
}
