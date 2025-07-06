"use client";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import {
    CalendarIcon,
    Plus,
    Lightbulb,
    Clock,
    Droplets,
    Heart,
    Dot,
    CircleSmall,
} from "lucide-react";
import { PeriodDay } from "@/lib/types/periods";
import { Separator } from "@/components/ui/separator";

interface TodaysSummaryProps {
    todaysData?: PeriodDay | null;
    // New props for enhanced features
    daysUntilNextPeriod?: number | null;
    daysUntilOvulation?: number | null;
    currentCycleDay?: number | null;
    cycleLength?: number;
    hasPeriodData?: boolean;
    // New props for period status
    isTodayPeriodDay?: boolean;
    isFirstDayOfPeriod?: boolean;
    periodDaysSet?: Set<string>;
    mostRecentPeriodStart?: Date | null;
    periodDays?: string[]; // Array of period day dates for cycle calculation
}

export function TodaysSummary({
    todaysData,
    daysUntilNextPeriod,
    daysUntilOvulation,
    currentCycleDay,
    cycleLength = 28,
    hasPeriodData = false,
    isTodayPeriodDay = false,
    isFirstDayOfPeriod = false,
    periodDaysSet,
    mostRecentPeriodStart,
    periodDays,
}: TodaysSummaryProps) {
    const symptomsCount = todaysData?.symptoms?.length || 0;
    const moodCount = todaysData?.mood?.length || 0;
    const activitiesCount = todaysData?.activities?.length || 0;

    const primaryMood = todaysData?.mood?.[0] || "None";

    // Helper function to format date consistently
    const formatDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Determine if today is a period day and if it's the first day
    const today = new Date();
    const todayKey = formatDateKey(today);
    const isInPeriod = periodDaysSet?.has(todayKey) || isTodayPeriodDay;
    const isFirstDay =
        isFirstDayOfPeriod ||
        (mostRecentPeriodStart &&
            formatDateKey(mostRecentPeriodStart) === todayKey);

    // Calculate cycle length (days from last period start to current period start)
    const getCycleLength = () => {
        if (
            !mostRecentPeriodStart ||
            !isInPeriod ||
            !periodDays ||
            periodDays.length < 2
        ) {
            return cycleLength; // Fallback to user's cycle length setting
        }

        // Sort period days to find the previous period start
        const sortedPeriodDays = periodDays
            .map((date) => new Date(date))
            .sort((a, b) => a.getTime() - b.getTime());

        // Find the period start before the most recent one
        const currentPeriodStartIndex = sortedPeriodDays.findIndex(
            (date) =>
                formatDateKey(date) === formatDateKey(mostRecentPeriodStart!)
        );

        if (currentPeriodStartIndex > 0) {
            const previousPeriodStart =
                sortedPeriodDays[currentPeriodStartIndex - 1];
            const daysDiff = Math.ceil(
                (mostRecentPeriodStart!.getTime() -
                    previousPeriodStart.getTime()) /
                    (1000 * 60 * 60 * 24)
            );
            return daysDiff;
        }

        return cycleLength; // Fallback to user's cycle length setting
    };

    // Calculate current period day (how many days since period started)
    const getCurrentPeriodDay = () => {
        if (!mostRecentPeriodStart || !isInPeriod) return 0;

        const daysDiff = Math.floor(
            (today.getTime() - mostRecentPeriodStart.getTime()) /
                (1000 * 60 * 60 * 24)
        );
        return daysDiff + 1; // +1 because we count the start day as day 1
    };

    // Type for event objects
    type EventInfo = {
        type: string;
        days: number;
        icon: any;
        color: string;
        isFirstDay?: boolean;
        cycleLength?: number;
        currentPeriodDay?: number;
    };

    // Generate AI suggestions based on current data and cycle position
    const generateSuggestions = () => {
        const suggestions: string[] = [];

        if (!hasPeriodData) {
            suggestions.push(
                "Start tracking your period to get personalized insights"
            );
            suggestions.push(
                "Log your first period day to begin cycle predictions"
            );
            return suggestions;
        }

        // Suggestions based on cycle day
        if (currentCycleDay) {
            if (currentCycleDay <= 5) {
                suggestions.push(
                    "Consider gentle exercise and rest during your period"
                );
                suggestions.push("Stay hydrated and maintain a balanced diet");
            } else if (currentCycleDay >= 11 && currentCycleDay <= 17) {
                suggestions.push(
                    "This is your fertile window - plan accordingly"
                );
                suggestions.push(
                    "Consider tracking cervical mucus for fertility awareness"
                );
            } else if (currentCycleDay >= 18 && currentCycleDay <= 25) {
                suggestions.push(
                    "Energy levels typically increase during this phase"
                );
                suggestions.push("Great time for high-intensity workouts");
            } else if (currentCycleDay >= 26) {
                suggestions.push(
                    "PMS symptoms may appear - practice self-care"
                );
                suggestions.push(
                    "Consider reducing caffeine and increasing magnesium"
                );
            }
        }

        // Suggestions based on symptoms
        if (todaysData?.symptoms) {
            if (todaysData.symptoms.includes("cramps")) {
                suggestions.push(
                    "Try heat therapy or gentle stretching for cramps"
                );
            }
            if (todaysData.symptoms.includes("fatigue")) {
                suggestions.push("Listen to your body and rest when needed");
            }
            if (todaysData.symptoms.includes("bloating")) {
                suggestions.push("Reduce salt intake and stay hydrated");
            }
        }

        // Suggestions based on mood
        if (todaysData?.mood) {
            if (todaysData.mood.includes("anxious")) {
                suggestions.push("Practice deep breathing or meditation");
            }
            if (todaysData.mood.includes("irritable")) {
                suggestions.push("Take breaks and avoid stressful situations");
            }
        }

        // Default suggestions if none generated
        if (suggestions.length === 0) {
            suggestions.push("Keep tracking to receive personalized insights");
            suggestions.push("Regular exercise can help with cycle regularity");
        }

        return suggestions.slice(0, 3); // Limit to 3 suggestions
    };

    // Get closest upcoming event
    const getClosestEvent = (): EventInfo | null => {
        if (!hasPeriodData) {
            return null;
        }

        // If user is in period, show period information
        if (isInPeriod) {
            return {
                type: "current_period",
                days: 0,
                icon: Droplets,
                color: "text-rose-500",
                isFirstDay: isFirstDay || false,
                cycleLength: getCycleLength(),
                currentPeriodDay: getCurrentPeriodDay(),
            };
        }

        const events: EventInfo[] = [];

        if (daysUntilNextPeriod !== null && daysUntilNextPeriod !== undefined) {
            events.push({
                type: "period",
                days: daysUntilNextPeriod,
                icon: Droplets,
                color: "text-rose-500",
            });
        }

        if (daysUntilOvulation !== null && daysUntilOvulation !== undefined) {
            events.push({
                type: "ovulation",
                days: daysUntilOvulation,
                icon: Heart,
                color: "text-blue-400",
            });
        }

        if (events.length === 0) {
            return null;
        }

        // Return the closest event
        return events.reduce((closest, event) =>
            event.days < closest.days ? event : closest
        );
    };

    const suggestions = generateSuggestions();
    const closestEvent = getClosestEvent();

    return (
        <Card.Card className="h-full w-full gap-4 shadow-none border border-dashed">
            <Card.CardContent className="flex flex-col gap-4">
                <Card.CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <p className="text-lg">Today's Summary</p>
                </Card.CardTitle>

                <Separator orientation="horizontal" className="" />

                {closestEvent && (
                    <div className="border border-dashed rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <closestEvent.icon
                                className={`w-4 h-4 ${closestEvent.color}`}
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {closestEvent.type === "current_period"
                                        ? closestEvent.isFirstDay
                                            ? "Period started today"
                                            : `Day ${closestEvent.currentPeriodDay}`
                                        : closestEvent.type === "period"
                                        ? "Next Period"
                                        : "Ovulation"}{" "}
                                    {closestEvent.type === "current_period"
                                        ? ""
                                        : `in ${closestEvent.days} days`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {closestEvent.type === "current_period"
                                        ? closestEvent.isFirstDay
                                            ? "Your period has started"
                                            : `Previous Cycle length: ${closestEvent.cycleLength} days`
                                        : closestEvent.type === "period"
                                        ? "Prepare for your upcoming period"
                                        : "Fertile window approaching"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                    <div className="space-y-2 lg:space-y-4">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            <p className="text-sm font-medium">
                                AI Suggestions
                            </p>
                        </div>
                        <div className="space-y-2 lg:space-y-4">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-2 lg:px-4"
                                >
                                    - {suggestion}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.CardContent>
        </Card.Card>
    );
}
