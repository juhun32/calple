"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PeriodDay } from "@/lib/types/periods";

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

interface LogFormProps {
    date: Date;
    existingLog?: PeriodDay | null;
    onSave: (log: {
        date: string;
        symptoms: string[];
        mood: string[];
        activities: string[];
        notes: string;
    }) => Promise<void>;
    onUpdate: (log: {
        date: string;
        symptoms: string[];
        mood: string[];
        activities: string[];
        notes: string;
    }) => Promise<void>;
}

export function LogForm({ date, existingLog, onSave, onUpdate }: LogFormProps) {
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(
        existingLog?.symptoms || []
    );
    const [selectedMoods, setSelectedMoods] = useState<string[]>(
        existingLog?.mood || []
    );
    const [selectedActivities, setSelectedActivities] = useState<string[]>(
        existingLog?.activities || []
    );
    const [notes, setNotes] = useState(existingLog?.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when existingLog changes
    useEffect(() => {
        if (existingLog) {
            setSelectedSymptoms(existingLog.symptoms);
            setSelectedMoods(existingLog.mood);
            setSelectedActivities(existingLog.activities);
            setNotes(existingLog.notes);
        } else {
            setSelectedSymptoms([]);
            setSelectedMoods([]);
            setSelectedActivities([]);
            setNotes("");
        }
    }, [existingLog]);

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms((prev) =>
            prev.includes(symptom)
                ? prev.filter((s) => s !== symptom)
                : [...prev, symptom]
        );
    };

    const handleMoodToggle = (mood: string) => {
        setSelectedMoods((prev) =>
            prev.includes(mood)
                ? prev.filter((m) => m !== mood)
                : [...prev, mood]
        );
    };

    const handleActivityToggle = (activity: string) => {
        setSelectedActivities((prev) =>
            prev.includes(activity)
                ? prev.filter((a) => a !== activity)
                : [...prev, activity]
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format
            const logData = {
                date: dateString,
                symptoms: selectedSymptoms,
                mood: selectedMoods,
                activities: selectedActivities,
                notes: notes,
            };

            if (existingLog) {
                await onUpdate(logData);
            } else {
                await onSave(logData);
            }
        } catch (error) {
            console.error("Failed to save log:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card.Card className="gap-4">
            <Card.CardHeader>
                <Card.CardTitle>
                    Log Data for {date.toLocaleDateString()}
                </Card.CardTitle>
                <Card.CardDescription>
                    Track your symptoms, mood, and activities
                </Card.CardDescription>
            </Card.CardHeader>
            <Card.CardContent className="space-y-8">
                {/* Symptoms */}
                <div>
                    <Label className="text-base font-medium">Symptoms</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {symptoms.map((symptom) => (
                            <div
                                key={symptom}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={symptom}
                                    checked={selectedSymptoms.includes(symptom)}
                                    onCheckedChange={() =>
                                        handleSymptomToggle(symptom)
                                    }
                                />
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
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {moods.map((mood) => (
                            <div
                                key={mood}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={mood}
                                    checked={selectedMoods.includes(mood)}
                                    onCheckedChange={() =>
                                        handleMoodToggle(mood)
                                    }
                                />
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
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {activities.map((activity) => (
                            <div
                                key={activity}
                                className="flex items-center space-x-2"
                            >
                                <Checkbox
                                    id={activity}
                                    checked={selectedActivities.includes(
                                        activity
                                    )}
                                    onCheckedChange={() =>
                                        handleActivityToggle(activity)
                                    }
                                />
                                <Label htmlFor={activity} className="text-sm">
                                    {activity}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <Label className="text-base font-medium">Notes</Label>
                    <Textarea
                        placeholder="Add any additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                        rows={3}
                    />
                </div>

                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Saving..."
                        : existingLog
                        ? "Update Entry"
                        : "Save Entry"}
                </Button>
            </Card.CardContent>
        </Card.Card>
    );
}
