"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Droplet, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function Tracker() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [lastPeriod, setLastPeriod] = useState<Date>(new Date(2025, 4, 15)); // May 15, 2025

    // Calculate next period date
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength);

    // Calculate days until next period
    const today = new Date();
    const daysUntilNextPeriod = Math.ceil(
        (nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate current cycle day
    const daysSinceLastPeriod = Math.ceil(
        (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentCycleDay =
        daysSinceLastPeriod > 0
            ? daysSinceLastPeriod
            : cycleLength + daysSinceLastPeriod;

    // Calculate fertility window (typically days 11-17 of cycle)
    const fertileStart = new Date(lastPeriod);
    fertileStart.setDate(lastPeriod.getDate() + 11);
    const fertileEnd = new Date(lastPeriod);
    fertileEnd.setDate(lastPeriod.getDate() + 17);

    // Function to determine if a day is in period
    const isDayInPeriod = (day: Date) => {
        // Check if the day is within periodLength days of lastPeriod
        const periodEnd = new Date(lastPeriod);
        periodEnd.setDate(lastPeriod.getDate() + periodLength - 1);

        return day >= lastPeriod && day <= periodEnd;
    };

    // Function to determine if a day is in the fertile window
    const isDayFertile = (day: Date) => {
        return day >= fertileStart && day <= fertileEnd;
    };

    // Function to determine if a day is the next period start
    const isNextPeriodStart = (day: Date) => {
        return (
            day.getDate() === nextPeriod.getDate() &&
            day.getMonth() === nextPeriod.getMonth() &&
            day.getFullYear() === nextPeriod.getFullYear()
        );
    };

    return (
        <div className="container px-4 py-6 space-y-6 pt-20">
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="mr-2">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Period Tracker</h1>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Cycle Overview</CardTitle>
                            <CardDescription>
                                Your current cycle information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Current Cycle Day
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {currentCycleDay}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Next Period In
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {daysUntilNextPeriod} days
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Cycle Length
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {cycleLength} days
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Cycle Progress
                                    </span>
                                    <span className="text-sm font-medium">
                                        {Math.round(
                                            (currentCycleDay / cycleLength) *
                                                100
                                        )}
                                        %
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        (currentCycleDay / cycleLength) * 100
                                    }
                                    className="h-2"
                                />
                            </div>

                            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/20">
                                <div className="flex items-start">
                                    <Droplet className="w-5 h-5 mr-2 text-rose-500" />
                                    <div>
                                        <p className="font-medium">
                                            Next Period Expected
                                        </p>
                                        <p className="text-sm">
                                            {nextPeriod.toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                }
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle>Fertility Window</CardTitle>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Info className="w-4 h-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-2">
                                            <h4 className="font-medium">
                                                About Fertility Windows
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                The fertility window is an
                                                estimate of days when you're
                                                most likely to be fertile. This
                                                is typically days 11-17 of your
                                                cycle. This is just an estimate
                                                and may vary.
                                            </p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 rounded-md bg-purple-50 dark:bg-purple-950/20">
                                <p className="font-medium">
                                    Estimated Fertile Days
                                </p>
                                <p className="text-sm">
                                    {fertileStart.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                    })}{" "}
                                    -{" "}
                                    {fertileEnd.toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Recent Symptoms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Badge
                                    variant="outline"
                                    className="bg-rose-50 dark:bg-rose-950/20"
                                >
                                    Cramps
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="bg-rose-50 dark:bg-rose-950/20"
                                >
                                    Headache
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="bg-rose-50 dark:bg-rose-950/20"
                                >
                                    Fatigue
                                </Badge>
                                <Badge variant="outline">Bloating</Badge>
                                <Badge variant="outline">Mood Swings</Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                Log Symptoms
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                modifiers={{
                                    period: (day) => isDayInPeriod(day),
                                    fertile: (day) => isDayFertile(day),
                                    nextPeriod: (day) => isNextPeriodStart(day),
                                }}
                                modifiersStyles={{
                                    period: {
                                        fontWeight: "bold",
                                        backgroundColor:
                                            "rgba(244, 63, 94, 0.1)",
                                        color: "rgb(244, 63, 94)",
                                    },
                                    fertile: {
                                        backgroundColor:
                                            "rgba(147, 51, 234, 0.1)",
                                        color: "rgb(147, 51, 234)",
                                    },
                                    nextPeriod: {
                                        border: "2px dashed rgb(244, 63, 94)",
                                    },
                                }}
                            />
                        </CardContent>
                        <CardFooter className="flex justify-center p-4 border-t">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 mr-1 rounded-full bg-rose-500"></div>
                                    <span>Period</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 mr-1 rounded-full bg-purple-500"></div>
                                    <span>Fertile</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 mr-1 border-2 rounded-full border-rose-500 border-dashed"></div>
                                    <span>Next Period</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>

                    <div className="flex justify-center mt-4">
                        <Button>Log Period Start</Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
