"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatingInfoCardProps {
    startedDating: string | null;
    onUpdate: (date: string) => Promise<void>;
    isLoading: boolean;
}

export function DatingInfoCard({
    startedDating,
    onUpdate,
    isLoading,
}: DatingInfoCardProps) {
    const [date, setDate] = useState("");

    useEffect(() => {
        if (startedDating) {
            setDate(new Date(startedDating).toISOString().split("T")[0]);
        }
    }, [startedDating]);

    const handleSave = () => {
        if (date) {
            onUpdate(date);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Relationship Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="dating-date">Started Dating</Label>
                    <Input
                        id="dating-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1"
                    />
                </div>
                <Button onClick={handleSave} disabled={isLoading || !date}>
                    {isLoading ? "Saving..." : "Save Date"}
                </Button>
            </CardContent>
        </Card>
    );
}
