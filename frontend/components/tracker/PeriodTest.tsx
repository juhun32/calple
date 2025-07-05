"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePeriods } from "@/lib/hooks/usePeriods";

export function PeriodTest() {
    const {
        periodDays,
        cycleSettings,
        loading,
        error,
        togglePeriodDay,
        updateSettings,
    } = usePeriods();
    const [testDate, setTestDate] = useState("2024-01-15");

    const handleTestToggle = async () => {
        try {
            await togglePeriodDay(testDate);
        } catch (error) {
            console.error("Test toggle failed:", error);
        }
    };

    const handleTestSettings = async () => {
        try {
            await updateSettings({ cycleLength: 30, periodLength: 6 });
        } catch (error) {
            console.error("Test settings failed:", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Period API Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p>Period Days: {periodDays.size}</p>
                    <p>Cycle Length: {cycleSettings?.cycleLength || 28}</p>
                    <p>Period Length: {cycleSettings?.periodLength || 5}</p>
                </div>

                <div className="space-y-2">
                    <input
                        type="date"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <Button onClick={handleTestToggle} className="w-full">
                        Toggle Period Day
                    </Button>
                    <Button onClick={handleTestSettings} className="w-full">
                        Update Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
