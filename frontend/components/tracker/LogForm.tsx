"use client";

import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const symptoms = [
    "Cramps",
    "Headache",
    "Fatigue",
    "Bloating",
    "Mood Swings",
    "Back Pain",
    "Breast Tenderness",
    "Acne",
];

const moods = [
    "Happy",
    "Calm",
    "Anxious",
    "Irritable",
    "Sad",
    "Energetic",
    "Tired",
    "Stressed",
];

const activities = ["Exercise", "Sex", "Meditation", "Social", "Work", "Rest"];

export function LogForm() {
    return (
        <Card.Card className="border-0">
            <Card.CardHeader>
                <Card.CardTitle>Log Today's Data</Card.CardTitle>
                <Card.CardDescription>
                    Track your symptoms, mood, and activities
                </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent className="space-y-6">
                {/* Symptoms */}
                <div>
                    <Label className="text-base font-medium">Symptoms</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {symptoms.map((symptom) => (
                            <div
                                key={symptom}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox id={symptom} />
                                <Label htmlFor={symptom} className="text-sm">
                                    {symptom}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mood */}
                <div>
                    <Label className="text-base font-medium">Mood</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {moods.map((mood) => (
                            <div
                                key={mood}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox id={mood} />
                                <Label htmlFor={mood} className="text-sm">
                                    {mood}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activities */}
                <div>
                    <Label className="text-base font-medium">Activities</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {activities.map((activity) => (
                            <div
                                key={activity}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox id={activity} />
                                <Label htmlFor={activity} className="text-sm">
                                    {activity}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full">Save Entry</Button>
            </Card.CardContent>
        </Card.Card>
    );
}
