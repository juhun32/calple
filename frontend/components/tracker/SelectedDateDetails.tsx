"use client";

import * as Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PeriodDay } from "@/lib/types/periods";
import { Button } from "../ui/button";
import { Plus, Edit } from "lucide-react";

interface SelectedDateDetailsProps {
    date: Date;
    periodData?: PeriodDay | null;
    onLogClick?: () => void;
}

export function SelectedDateDetails({
    date,
    periodData,
    onLogClick,
}: SelectedDateDetailsProps) {
    const hasData =
        periodData &&
        (periodData.symptoms.length > 0 ||
            periodData.mood.length > 0 ||
            periodData.activities.length > 0);

    return (
        <Card.Card className="h-full">
            <Card.CardHeader>
                <Card.CardTitle>
                    {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                </Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent className="h-full flex flex-col">
                {!hasData ? (
                    <div className="h-full flex flex-col justify-between">
                        <div className="pt-4 text-muted-foreground flex flex-col items-start gap-2">
                            <p>No data logged for this date</p>
                            <p className="text-xs">
                                Click on the Log tab to add data
                            </p>
                        </div>
                        <Button
                            className="w-full text-foreground"
                            variant="outline"
                            onClick={onLogClick}
                        >
                            <Plus className="w-4 h-4" />
                            Log Data
                        </Button>
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-between">
                        <div className="space-y-4">
                            {periodData.symptoms.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">
                                        Symptoms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {periodData.symptoms.map((symptom) => (
                                            <Badge
                                                key={symptom}
                                                variant="secondary"
                                                className="bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
                                            >
                                                {symptom}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {periodData.mood.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Mood</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {periodData.mood.map((mood) => (
                                            <Badge
                                                key={mood}
                                                variant="secondary"
                                                className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                            >
                                                {mood}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {periodData.activities.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">
                                        Activities
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {periodData.activities.map(
                                            (activity) => (
                                                <Badge
                                                    key={activity}
                                                    variant="secondary"
                                                    className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                >
                                                    {activity}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {periodData.notes && (
                                <div>
                                    <h4 className="font-medium mb-2">Notes</h4>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {periodData.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full text-foreground"
                            variant="outline"
                            onClick={onLogClick}
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Log
                        </Button>
                    </div>
                )}
            </Card.CardContent>
        </Card.Card>
    );
}
