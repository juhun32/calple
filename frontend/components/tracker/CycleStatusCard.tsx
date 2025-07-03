"use client";

import * as Card from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplets, Calendar } from "lucide-react";

interface CycleStatusCardProps {
    currentCycleDay: number | null;
    cycleLength: number;
    daysUntilNextPeriod: number | null;
    nextPeriod: Date | null;
    hasPeriodData: boolean;
}

export function CycleStatusCard({
    currentCycleDay,
    cycleLength,
    daysUntilNextPeriod,
    nextPeriod,
    hasPeriodData,
}: CycleStatusCardProps) {
    if (!hasPeriodData) {
        return (
            <Card.Card className="w-full h-full">
                <Card.CardContent>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                    <div className="mt-4">
                        <h2 className="text-sm font-semibold">
                            No Period Data Yet
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Start tracking your period by right-clicking on
                            dates in the overview or calendar to mark them as
                            period days.
                        </p>
                    </div>
                </Card.CardContent>
            </Card.Card>
        );
    }

    return (
        <Card.Card className="w-full h-full">
            <Card.CardContent>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Day {currentCycleDay}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            of your cycle
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-rose-500">
                            {daysUntilNextPeriod}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            days until next period
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium mb-2">
                            Cycle Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {Math.round((currentCycleDay! / cycleLength) * 100)}
                            %
                        </span>
                    </div>
                    <Progress
                        value={(currentCycleDay! / cycleLength) * 100}
                        className="h-3"
                    />
                </div>

                <div className="mt-4 bg-gradient-to-r from-rose-100 to-purple-100 dark:from-rose-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-4 px-8 py-4">
                        <Droplets className="w-4 h-4 text-white" />
                        <div>
                            <p className="font-medium">Next Period Expected</p>
                            <p className="text-sm text-muted-foreground">
                                {nextPeriod!.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
}
