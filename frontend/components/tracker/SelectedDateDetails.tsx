"use client";

import * as Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SelectedDateDetailsProps {
    date: Date;
}

export function SelectedDateDetails({ date }: SelectedDateDetailsProps) {
    return (
        <Card.Card className="backdrop-blur-sm border-0">
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
            <Card.CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">Symptoms</h4>
                    <div className="flex flex-wrap gap-4">
                        {["Cramps", "Headache", "Fatigue"].map((symptom) => (
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

                <div>
                    <h4 className="font-medium mb-2">Mood</h4>
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                    >
                        Happy
                    </Badge>
                </div>

                <div>
                    <h4 className="font-medium mb-2">Activities</h4>
                    <div className="flex flex-wrap gap-4">
                        {["Exercise", "Meditation"].map((activity) => (
                            <Badge
                                key={activity}
                                variant="secondary"
                                className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            >
                                {activity}
                            </Badge>
                        ))}
                    </div>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
}
