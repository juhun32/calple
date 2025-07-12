"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PeriodDay } from "@/lib/types/periods";
import { Separator } from "../ui/separator";

const symptoms = [
    "Cramps",
    "Headache",
    "Fatigue",
    "Bloating",
    "Mood Swings",
    "Back Pain",
    "Tender Breasts",
    "Acne",
];

const moodsPositive = [
    "Happy",
    "Calm",
    "Energetic",
    "Content",
    "Relaxed",
    "Motivated",
];

const moodsNegative = [
    "Angry",
    "Frustrated",
    "Overwhelmed",
    "Disappointed",
    "Lonely",
    "Bored",
    "Nervous",
];

const activities = ["Exercise", "Meditation", "Social", "Work", "Rest"];

const sexualActivities = ["Used", "Not Used"];

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
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when the selected date or its log data changes
    useEffect(() => {
        setSelectedSymptoms(existingLog?.symptoms || []);
        setSelectedMoods(existingLog?.mood || []);
        setSelectedActivities(existingLog?.activities || []);
        setNotes(existingLog?.notes || "");
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
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;

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
        <Card.Card className="flex flex-col h-full">
            <Card.CardHeader>
                <Card.CardTitle className="flex items-center gap-2">
                    Log Data for{" "}
                    <p className="px-2 py-1 inset-shadow-sm bg-background rounded">
                        {date.toLocaleDateString()}
                    </p>
                </Card.CardTitle>
                <Card.CardDescription className="mt-2">
                    Track your symptoms, mood, and activities
                </Card.CardDescription>
                <Separator orientation="horizontal" className="my-2 lg:my-4" />
            </Card.CardHeader>
            <Card.CardContent className="flex flex-col flex-1 gap-4">
                {/* Symptoms */}
                <div>
                    <Label className="text-base text-muted-foreground px-0">
                        Symptoms
                    </Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
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
                                <Label
                                    htmlFor={symptom}
                                    className="text-sm px-1"
                                >
                                    {symptom}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mood */}
                <div>
                    <Label className="text-base text-muted-foreground px-0">
                        Mood
                    </Label>
                    <div className="text-xs flex items-center gap-2">
                        <p className="text-emerald-700">Positive</p> -{" "}
                        <p className="text-orange-700">Negative</p>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                        {moodsPositive.map((mood) => (
                            <div
                                key={mood}
                                className="flex items-center space-x-2 text-emerald-700"
                            >
                                <Checkbox
                                    id={mood}
                                    checked={selectedMoods.includes(mood)}
                                    onCheckedChange={() =>
                                        handleMoodToggle(mood)
                                    }
                                />
                                <Label htmlFor={mood} className="text-sm px-1">
                                    {mood}
                                </Label>
                            </div>
                        ))}
                        {moodsNegative.map((mood) => (
                            <div
                                key={mood}
                                className="flex items-center space-x-2 text-orange-700"
                            >
                                <Checkbox
                                    id={mood}
                                    checked={selectedMoods.includes(mood)}
                                    onCheckedChange={() =>
                                        handleMoodToggle(mood)
                                    }
                                />
                                <Label htmlFor={mood} className="text-sm px-1">
                                    {mood}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activities */}
                <div>
                    <Label className="text-base text-muted-foreground px-0">
                        Activities
                    </Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
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
                                <Label
                                    htmlFor={activity}
                                    className="text-sm px-1"
                                >
                                    {activity}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sexual Activity */}
                <div>
                    <Label className="text-base text-muted-foreground px-0">
                        Sexual Activity
                    </Label>
                    <p className="text-xs text-muted-foreground">Protection</p>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                        {sexualActivities.map((activity) => (
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
                                <Label
                                    htmlFor={activity}
                                    className="text-sm px-1"
                                >
                                    {activity}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <Label className="text-base text-muted-foreground px-0">
                        Notes
                    </Label>
                    <Textarea
                        placeholder="Additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2 flex-1"
                        rows={3}
                    />
                </div>

                <div className="mt-auto md:pt-4">
                    <Button
                        className="w-full"
                        variant="default"
                        size={"sm"}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : existingLog
                            ? "Update Entry"
                            : "Save Entry"}
                    </Button>
                </div>
            </Card.CardContent>
        </Card.Card>
    );
}
