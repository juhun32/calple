"use client";

import * as Card from "@/components/ui/card";
import { Heart, Moon, Calendar } from "lucide-react";

interface QuickStatsGridProps {
    fertileStart: Date | null;
    fertileEnd: Date | null;
    cycleLength: number;
    hasPeriodData: boolean;
}

export function QuickStatsGrid({
    fertileStart,
    fertileEnd,
    cycleLength,
    hasPeriodData,
}: QuickStatsGridProps) {
    if (!hasPeriodData) {
        return (
            <Card.Card className="w-full h-full">
                <Card.CardContent>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                    <div className="mt-4">
                        <p className="text-sm font-medium">Start Tracking</p>
                        <p className="text-xs text-muted-foreground">
                            Mark your period days to see fertility predictions
                            and cycle insights
                        </p>
                    </div>
                </Card.CardContent>
            </Card.Card>
        );
    }

    return (
        <div className="h-full grid grid-rows-2 gap-4">
            <Card.Card>
                <Card.CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4" />
                        <div>
                            <p className="text-sm font-medium">
                                Fertility Window
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {fertileStart!.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}{" "}
                                -{" "}
                                {fertileEnd!.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </Card.CardContent>
            </Card.Card>

            <Card.Card className="backdrop-blur-sm border-0">
                <Card.CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full">
                            <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Cycle Length</p>
                            <p className="text-xs text-muted-foreground">
                                {cycleLength} days average
                            </p>
                        </div>
                    </div>
                </Card.CardContent>
            </Card.Card>
        </div>
    );
}
