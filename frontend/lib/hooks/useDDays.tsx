import { useEffect, useState } from "react";

export type DDay = {
    id?: string;
    title: string;
    date: Date;
    description?: string;
    days: string;
    isAnnual: boolean;
    createdBy?: string;
    connectedUsers?: string[];
};

export function useDDays() {
    const [ddays, setDdays] = useState<DDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const calculateDDay = (targetDate: Date): string => {
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );
        const target = new Date(
            targetDate.getFullYear(),
            targetDate.getMonth(),
            targetDate.getDate()
        );

        const diffTime = Math.abs(today.getTime() - target.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (target.getTime() === today.getTime()) {
            return "D-Day";
        } else if (target < today) {
            return `D+${diffDays}`;
        } else {
            return `D-${diffDays}`;
        }
    };

    const fetchDDays = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch D-days: ${response.status}`);
            }

            const data = await response.json();
            const formattedDdays = data.ddays.map((dday: any) => ({
                id: dday.id,
                title: dday.title,
                description: dday.description || "",
                date: new Date(dday.date),
                days: calculateDDay(new Date(dday.date)),
                isAnnual: dday.isAnnual,
                createdBy: dday.createdBy,
                connectedUsers: dday.connectedUsers || [],
            }));
            setDdays(formattedDdays);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch D-days:", err);
            setError("Failed to load calendar events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDDays();
    }, []);

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

    const createDDay = async (
        dday: Omit<DDay, "days" | "id">
    ): Promise<boolean> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        title: dday.title,
                        date: dday.date.toISOString(),
                        description: dday.description || "",
                        isAnnual: dday.isAnnual,
                        connectedUsers: dday.connectedUsers || [],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to create D-day: ${response.status}`);
            }

            const data = await response.json();
            const newDday = {
                ...dday,
                id: data.dday.id,
                days: calculateDDay(dday.date),
            };

            setDdays((prev) => [...prev, newDday]);
            return true;
        } catch (error) {
            console.error("Failed to create D-day:", error);
            return false;
        }
    };

    const updateDDay = async (
        id: string,
        updates: Partial<Omit<DDay, "days" | "id">>
    ): Promise<boolean> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        ...updates,
                        date: updates.date?.toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to update D-day: ${response.status}`);
            }

            const data = await response.json();

            setDdays((prev) =>
                prev.map((dday) => {
                    if (dday.id === id) {
                        const updatedDate = updates.date || dday.date;
                        return {
                            ...dday,
                            ...updates,
                            days: calculateDDay(updatedDate),
                        };
                    }
                    return dday;
                })
            );

            return true;
        } catch (error) {
            console.error("Failed to update D-day:", error);
            return false;
        }
    };

    const deleteDDay = async (id: string): Promise<boolean> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays/${id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to delete D-day: ${response.status}`);
            }

            setDdays((prev) => prev.filter((dday) => dday.id !== id));
            return true;
        } catch (error) {
            console.error("Failed to delete D-day:", error);
            return false;
        }
    };

    return {
        ddays,
        loading,
        error,
        getDDaysForDay,
        createDDay,
        updateDDay,
        deleteDDay,
        refreshDDays: fetchDDays,
    };
}
