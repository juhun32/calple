"use client";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { CalendarIcon, Plus } from "lucide-react";
import { PeriodDay } from "@/lib/types/periods";

interface TodaysSummaryProps {
    todaysData?: PeriodDay | null;
    onLogClick?: () => void;
}

export function TodaysSummary({ todaysData, onLogClick }: TodaysSummaryProps) {
    const symptomsCount = todaysData?.symptoms?.length || 0;
    const moodCount = todaysData?.mood?.length || 0;
    const activitiesCount = todaysData?.activities?.length || 0;

    const primaryMood = todaysData?.mood?.[0] || "None";

    return (
        <Card.Card className="border-0">
            <Card.CardHeader>
                <Card.CardTitle className="flex items-center gap-4">
                    <CalendarIcon className="w-5 h-5" />
                    Today's Summary
                </Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            Symptoms
                        </p>
                        <p className="font-semibold text-rose-600 dark:text-rose-400">
                            {symptomsCount}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">Mood</p>
                        <p className="font-semibold text-yellow-600 dark:text-yellow-400">
                            {primaryMood}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                            Activities
                        </p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                            {activitiesCount}
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full"
                    variant="outline"
                    onClick={onLogClick}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Today's Data
                </Button>
            </Card.CardContent>
        </Card.Card>
    );
}
