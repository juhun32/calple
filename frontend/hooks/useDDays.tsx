import { useMemo } from "react";

export type DDay = {
    title: string;
    date: Date;
    days: string;
    isAnnual: boolean;
};

export function useDDays() {
    // will be fetched from the database
    // using placeholder for now
    const startDating = new Date("2024-01-22T00:00:00-05:00");
    const startMathClass = new Date("2023-08-21T00:00:00-04:00");
    const startMason = new Date("2025-08-26T00:00:00-04:00");
    const endDateMasonGraduation = new Date("2027-05-15T00:00:00-04:00");
    const endDateNOVAGraduation = new Date("2025-05-12T00:00:00-04:00");

    const calculateDDay = (targetDate: Date): string => {
        const now = new Date();
        const today = new Date(
            Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        );
        const target = new Date(
            Date.UTC(
                targetDate.getFullYear(),
                targetDate.getMonth(),
                targetDate.getDate()
            )
        );

        const diffTime = Math.abs(today.getTime() - target.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (target < today) {
            return `D+${diffDays}`;
        } else if (target > today) {
            return `D-${diffDays}`;
        } else {
            return "D-Day";
        }
    };

    const ddays = useMemo(
        () => [
            {
                title: "Our Dating Anniversary",
                date: startDating,
                days: calculateDDay(startDating),
                isAnnual: true,
            },
            {
                title: "Our First Math Class Together",
                date: startMathClass,
                days: calculateDDay(startMathClass),
                isAnnual: true,
            },
            {
                title: "NOVA Graduation Date",
                date: endDateNOVAGraduation,
                days: calculateDDay(endDateNOVAGraduation),
                isAnnual: false,
            },
            {
                title: "Mason Fall Semester Start Date",
                date: startMason,
                days: calculateDDay(startMason),
                isAnnual: false,
            },
            {
                title: "Mason Graduation Date",
                date: endDateMasonGraduation,
                days: calculateDDay(endDateMasonGraduation),
                isAnnual: false,
            },
        ],
        []
    );

    const getDDaysForDay = (day: number | null, currentDate: Date) => {
        if (!day) return [];

        return ddays.filter((dday) => {
            const eventDate = dday.date;

            if (!dday.isAnnual) {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth() &&
                    eventDate.getFullYear() === currentDate.getFullYear()
                );
            } else {
                return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === currentDate.getMonth()
                );
            }
        });
    };

    return { ddays, getDDaysForDay };
}
