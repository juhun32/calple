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

export function useDDays(currentDate: Date = new Date()) {
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

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const fetchDDays = async () => {
        try {
            setLoading(true);

            const base =
                process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
            const endpoint = "/api/ddays";
            const queryParams = new URLSearchParams({
                view:
                    currentDate.getFullYear().toString() +
                    month.toString().padStart(2, "0"),
            });
            const urlWithParams = `${base}${endpoint}?${queryParams.toString()}`;
            const url = new URL(urlWithParams);

            console.log("Request URL:", url);

            const response = await fetch(url, {
                credentials: "include",
            }).catch((err) => {
                console.error("Fetch network error:", err);
                throw err;
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch D-days: ${response.status}`);
            }

            const data = await response.json();
            console.log("Raw response data:", data);
            console.log("Fetched D-days:", data.ddays);

            const formattedDdays = data.ddays.map((dday: any) => {
                let dateObj;

                if (
                    typeof dday.date === "string" &&
                    dday.date.match(/^\d{8}$/)
                ) {
                    const year = parseInt(dday.date.substring(0, 4));
                    const month = parseInt(dday.date.substring(4, 6)) - 1; // 0-indexed month
                    const day = parseInt(dday.date.substring(6, 8));
                    dateObj = new Date(year, month, day);
                } else {
                    dateObj = new Date(dday.date);
                }

                return {
                    id: dday.id,
                    title: dday.title,
                    description: dday.description || "",
                    date: dateObj,
                    days: calculateDDay(dateObj),
                    isAnnual: dday.isAnnual,
                    createdBy: dday.createdBy,
                    connectedUsers: dday.connectedUsers || [],
                };
            });

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
    }, [year, month]);

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
            const year = dday.date.getFullYear();
            const month = String(dday.date.getMonth() + 1).padStart(2, "0");
            const day = String(dday.date.getDate()).padStart(2, "0");
            const dateString = `${year}${month}${day}`;

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
                        date: dateString,
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
            let dateString = undefined;
            if (updates.date) {
                const year = updates.date.getFullYear();
                const month = String(updates.date.getMonth() + 1).padStart(
                    2,
                    "0"
                );
                const day = String(updates.date.getDate()).padStart(2, "0");
                dateString = `${year}${month}${day}`;
            }

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
                        date: dateString,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to update D-day: ${response.status}`);
            }

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
