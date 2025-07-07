"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Plus, TrendingUp, Settings } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import {
    CycleStatusCard,
    TodaysSummary,
    SelectedDateDetails,
    DayButtonRow,
    LogForm,
    ButtonRowCalendar,
    CycleSettingsForm,
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
        periodDaysSet,
        allLogDataSet,
        cycleSettings,
        togglePeriodDay,
        updatePeriodDay,
        getLogForDate,
        updateSettings,
    } = usePeriods();

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTab, setSelectedTab] = useState("overview");
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    const sexualActivityDays = useMemo(() => {
        const activityDays = new Set<string>();
        const sexualActivityKeywords = ["Used Protection", "Unprotected"];
        for (const day of allLogDataSet.values()) {
            if (
                day.activities &&
                day.activities.some((activity) =>
                    sexualActivityKeywords.includes(activity)
                )
            ) {
                activityDays.add(day.date);
            }
        }
        return activityDays;
    }, [allLogDataSet]);

    const periodLength = cycleSettings?.periodLength || 5;

    // calculate most recent period start/end dates and average cycle length
    const {
        mostRecentPeriodStart,
        mostRecentPeriodEnd,
        calculatedCycleLength,
    } = useMemo(() => {
        if (periodDaysSet.size === 0) {
            return {
                mostRecentPeriodStart: null,
                mostRecentPeriodEnd: null,
                calculatedCycleLength: cycleSettings?.cycleLength || 28,
            };
        }

        const sortedDates = Array.from(periodDaysSet)
            .map(parseDateKey)
            .sort((a, b) => a.getTime() - b.getTime());

        // Group dates into potential periods (dates within 3 days of each other)
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

                if (daysDiff <= 3) {
                    currentPeriod.push(currentDate);
                } else {
                    if (currentPeriod.length > 0) {
                        potentialPeriods.push([...currentPeriod]);
                    }
                    currentPeriod = [currentDate];
                }
            }
        }
        if (currentPeriod.length > 0) {
            potentialPeriods.push(currentPeriod);
        }

        // Extract start dates from each period
        const periodStartDates = potentialPeriods.map((period) => period[0]);

        // Calculate average cycle length
        let avgCycleLength = cycleSettings?.cycleLength || 28;
        if (periodStartDates.length > 1) {
            let totalCycleDays = 0;
            for (let i = 1; i < periodStartDates.length; i++) {
                const diff = Math.ceil(
                    (periodStartDates[i].getTime() -
                        periodStartDates[i - 1].getTime()) /
                        (1000 * 60 * 60 * 24)
                );
                totalCycleDays += diff;
            }
            avgCycleLength = Math.round(
                totalCycleDays / (periodStartDates.length - 1)
            );
        }

        let periodStart: Date | null = null;
        let periodEnd: Date | null = null;
        if (potentialPeriods.length > 0) {
            const mostRecentPeriod =
                potentialPeriods[potentialPeriods.length - 1];
            periodStart = mostRecentPeriod[0];
            periodEnd = mostRecentPeriod[mostRecentPeriod.length - 1];
        }

        return {
            mostRecentPeriodStart: periodStart,
            mostRecentPeriodEnd: periodEnd,
            calculatedCycleLength: avgCycleLength,
        };
    }, [periodDaysSet, cycleSettings?.cycleLength]);

    const cycleLength = calculatedCycleLength;

    // check if user has any period data
    const hasPeriodData = mostRecentPeriodStart !== null;

    // calculate next period date only if we have period data
    const nextPeriod =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const next = new Date(mostRecentPeriodStart);
                  next.setDate(mostRecentPeriodStart.getDate() + cycleLength);
                  return next;
              })()
            : null;

    // calculate days until next period only if we have period data
    const today = new Date();
    const daysUntilNextPeriod =
        hasPeriodData && nextPeriod
            ? Math.ceil(
                  (nextPeriod.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
              )
            : null;

    // calculate current cycle day only if we have period data
    const currentCycleDay =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const daysSinceLastPeriod = Math.ceil(
                      (today.getTime() - mostRecentPeriodStart.getTime()) /
                          (1000 * 60 * 60 * 24)
                  );
                  const cycleDay = daysSinceLastPeriod % cycleLength;
                  return cycleDay === 0 ? cycleLength : cycleDay;
              })()
            : null;

    // calculate fertility window only if we have period data
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

    // Calculate days until ovulation (typically day 14 of cycle)
    const daysUntilOvulation =
        hasPeriodData && mostRecentPeriodStart
            ? (() => {
                  const ovulationDate = new Date(mostRecentPeriodStart);
                  ovulationDate.setDate(mostRecentPeriodStart.getDate() + 14);
                  const daysDiff = Math.ceil(
                      (ovulationDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24)
                  );
                  return daysDiff;
              })()
            : null;

    // generate predicted period days only if we have period data
    const generatePredictedPeriodDays = () => {
        if (!hasPeriodData || !mostRecentPeriodStart) return new Set<string>();

        const predicted = new Set<string>();

        // add the expected period days for the current period
        if (mostRecentPeriodStart) {
            // check if the current period is complete by counting period days
            let confirmedDays = 0;
            for (let day = 0; day < periodLength; day++) {
                const periodDay = new Date(mostRecentPeriodStart);
                periodDay.setDate(mostRecentPeriodStart.getDate() + day);
                const periodDayKey = formatDateKey(periodDay);

                if (periodDaysSet.has(periodDayKey)) {
                    confirmedDays++;
                }
            }

            // only show predicted days if the period is not complete
            // which is when period days are less than the period length
            if (confirmedDays < periodLength) {
                for (let day = 0; day < periodLength; day++) {
                    const periodDay = new Date(mostRecentPeriodStart);
                    periodDay.setDate(mostRecentPeriodStart.getDate() + day);
                    const periodDayKey = formatDateKey(periodDay);

                    if (!periodDaysSet.has(periodDayKey)) {
                        predicted.add(periodDayKey);
                    }
                }
            }
        }

        // start from the most recent period start and predict future periods
        let currentPeriodStart = new Date(mostRecentPeriodStart);

        // add cycle length to get to the next period start which is
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
        try {
            await togglePeriodDay(dateKey);
        } catch (error) {
            console.error("Tracker: Period day toggle failed:", error);
        }
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

    const handleSaveSettings = async (settings: {
        cycleLength: number;
        periodLength: number;
    }) => {
        setIsSavingSettings(true);
        try {
            await updateSettings(settings);
        } finally {
            setIsSavingSettings(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="min-h-screen container mx-auto px-8 pt-20 pb-16 flex flex-col">
                <Tabs
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    className="flex flex-col flex-1"
                >
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
                            value="settings"
                            className="flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
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
                        className="flex-1 flex flex-col gap-4"
                    >
                        <DayButtonRow
                            currentDate={date || new Date()}
                            onDateSelect={setDate}
                            periodDays={periodDaysSet}
                            onPeriodToggle={handlePeriodToggle}
                            predictedPeriodDays={predictedPeriodDays}
                            fertilityWindowDays={fertilityWindowDays}
                            sexualActivityDays={sexualActivityDays}
                        />

                        <div className="grid md:grid-cols-[4fr_2fr_2fr] gap-4 flex-1">
                            <TodaysSummary
                                todaysData={getLogForDate(
                                    formatDateKey(new Date())
                                )}
                                daysUntilNextPeriod={daysUntilNextPeriod}
                                daysUntilOvulation={daysUntilOvulation}
                                currentCycleDay={currentCycleDay}
                                cycleLength={cycleLength}
                                hasPeriodData={hasPeriodData}
                                periodDaysSet={periodDaysSet}
                                mostRecentPeriodStart={mostRecentPeriodStart}
                            />

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
                                    onLogClick={() => setSelectedTab("log")}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="log" className="flex-1 flex flex-col">
                        <div className="grid md:grid-cols-[auto_1fr] gap-4 flex-1">
                            <ButtonRowCalendar
                                currentDate={date || new Date()}
                                onDateSelect={setDate}
                                periodDays={periodDaysSet}
                                onPeriodToggle={handlePeriodToggle}
                                predictedPeriodDays={predictedPeriodDays}
                                fertilityWindowDays={fertilityWindowDays}
                                sexualActivityDays={sexualActivityDays}
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

                    <TabsContent
                        value="settings"
                        className="flex-1 flex flex-col"
                    >
                        <div className="flex-1 flex justify-center items-start">
                            <CycleSettingsForm
                                cycleLength={cycleLength}
                                periodLength={periodLength}
                                onSave={handleSaveSettings}
                                isLoading={isSavingSettings}
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
