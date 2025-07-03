"use client";

import { useState, useEffect, useMemo } from "react";
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
    DayButtonRow,
    ButtonRowCalendar,
    CycleStatusCard,
    QuickStatsGrid,
    TodaysSummary,
    SelectedDateDetails,
    LogForm,
    InsightsCard,
} from "@/components/tracker";

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

    if (!authState.isAuthenticated && typeof window !== "undefined") {
        redirect("/");
    }

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
    const [selectedTab, setSelectedTab] = useState("overview");
    const [periodDays, setPeriodDays] = useState<Set<string>>(new Set());

    // Calculate the most recent period date from periodDays
    const mostRecentPeriodDate = useMemo(() => {
        if (periodDays.size === 0) return null;

        const sortedDates = Array.from(periodDays)
            .map(parseDateKey)
            .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (most recent first)

        return sortedDates[0];
    }, [periodDays]);

    // Calculate the end of the most recent period
    const mostRecentPeriodEnd = useMemo(() => {
        if (!mostRecentPeriodDate) return null;

        // Find all consecutive period days starting from the most recent
        const sortedDates = Array.from(periodDays)
            .map(parseDateKey)
            .sort((a, b) => a.getTime() - b.getTime()); // Sort ascending

        // Find the last consecutive day from the most recent period
        let periodEnd = mostRecentPeriodDate;
        const periodEndKey = formatDateKey(periodEnd);

        // Check if the next day is also a period day
        for (let i = 1; i < periodLength; i++) {
            const nextDay = new Date(mostRecentPeriodDate);
            nextDay.setDate(mostRecentPeriodDate.getDate() + i);
            const nextDayKey = formatDateKey(nextDay);

            if (periodDays.has(nextDayKey)) {
                periodEnd = nextDay;
            } else {
                break;
            }
        }

        return periodEnd;
    }, [periodDays, mostRecentPeriodDate, periodLength]);

    // Check if user has any period data
    const hasPeriodData = mostRecentPeriodDate !== null;

    // Calculate next period date (only if we have period data)
    const nextPeriod =
        hasPeriodData && mostRecentPeriodEnd
            ? (() => {
                  const next = new Date(mostRecentPeriodEnd);
                  next.setDate(mostRecentPeriodEnd.getDate() + cycleLength);
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
        hasPeriodData && mostRecentPeriodEnd
            ? (() => {
                  const daysSinceLastPeriod = Math.ceil(
                      (today.getTime() - mostRecentPeriodEnd.getTime()) /
                          (1000 * 60 * 60 * 24)
                  );
                  return daysSinceLastPeriod > 0
                      ? daysSinceLastPeriod
                      : cycleLength + daysSinceLastPeriod;
              })()
            : null;

    // Calculate fertility window (only if we have period data)
    const fertileStart =
        hasPeriodData && mostRecentPeriodEnd
            ? (() => {
                  const start = new Date(mostRecentPeriodEnd);
                  start.setDate(mostRecentPeriodEnd.getDate() + 11);
                  return start;
              })()
            : null;

    const fertileEnd =
        hasPeriodData && mostRecentPeriodEnd
            ? (() => {
                  const end = new Date(mostRecentPeriodEnd);
                  end.setDate(mostRecentPeriodEnd.getDate() + 17);
                  return end;
              })()
            : null;

    // Generate predicted period days (only if we have period data)
    const generatePredictedPeriodDays = () => {
        if (!hasPeriodData || !mostRecentPeriodEnd) return new Set<string>();

        const predicted = new Set<string>();
        let currentPeriodStart = new Date(mostRecentPeriodEnd);
        currentPeriodStart.setDate(mostRecentPeriodEnd.getDate() + cycleLength);

        for (let i = 0; i < 3; i++) {
            for (let day = 0; day < periodLength; day++) {
                const periodDay = new Date(currentPeriodStart);
                periodDay.setDate(currentPeriodStart.getDate() + day);
                predicted.add(formatDateKey(periodDay));
            }
            currentPeriodStart.setDate(
                currentPeriodStart.getDate() + cycleLength
            );
        }
        return predicted;
    };

    const predictedPeriodDays = generatePredictedPeriodDays();

    // Handle period day toggle
    const handlePeriodToggle = (date: Date) => {
        const dateKey = formatDateKey(date);
        const newPeriodDays = new Set(periodDays);

        if (newPeriodDays.has(dateKey)) {
            newPeriodDays.delete(dateKey);
        } else {
            newPeriodDays.add(dateKey);
        }

        setPeriodDays(newPeriodDays);
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
                        <TabsTrigger
                            value="insights"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Insights
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent
                        value="overview"
                        className="flex flex-col gap-4"
                    >
                        <DayButtonRow
                            currentDate={date || new Date()}
                            onDateSelect={setDate}
                            periodDays={periodDays}
                            onPeriodToggle={handlePeriodToggle}
                            predictedPeriodDays={predictedPeriodDays}
                        />
                        <div className="grid grid-cols-[5fr_2fr_1fr] gap-4 justify-center items-center">
                            <CycleStatusCard
                                currentCycleDay={currentCycleDay}
                                cycleLength={cycleLength}
                                daysUntilNextPeriod={daysUntilNextPeriod}
                                nextPeriod={nextPeriod}
                                hasPeriodData={hasPeriodData}
                            />

                            {date && <SelectedDateDetails date={date} />}

                            <QuickStatsGrid
                                fertileStart={fertileStart}
                                fertileEnd={fertileEnd}
                                cycleLength={cycleLength}
                                hasPeriodData={hasPeriodData}
                            />
                        </div>

                        <TodaysSummary />
                    </TabsContent>

                    <TabsContent value="log" className="space-y-4">
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <ButtonRowCalendar
                                currentDate={date || new Date()}
                                onDateSelect={setDate}
                                periodDays={periodDays}
                                onPeriodToggle={handlePeriodToggle}
                                predictedPeriodDays={predictedPeriodDays}
                            />
                            <LogForm />
                        </div>
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                        <InsightsCard />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
