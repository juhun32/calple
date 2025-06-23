import { useEffect, useState } from "react";
import { EventPosition, type DDay } from "@/lib/types/calendar";

export function useDDays(currentDate: Date = new Date()) {
    const [ddays, setDdays] = useState<DDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventLayout, setEventLayout] = useState<Map<string, number>>(
        new Map()
    );

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
            return "Today";
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

            const formattedDdays = data.ddays.map((dday: any) => {
                let dateObj: Date | undefined = undefined;
                let endDateObj: Date | undefined = undefined;

                if (
                    typeof dday.date === "string" &&
                    dday.date.match(/^\d{8}$/)
                ) {
                    const year = parseInt(dday.date.substring(0, 4));
                    const month = parseInt(dday.date.substring(4, 6)) - 1; // 0-indexed month
                    const day = parseInt(dday.date.substring(6, 8));
                    dateObj = new Date(year, month, day);
                }

                if (
                    typeof dday.endDate === "string" &&
                    dday.endDate.match(/^\d{8}$/)
                ) {
                    const year = parseInt(dday.endDate.substring(0, 4));
                    const month = parseInt(dday.endDate.substring(4, 6)) - 1; // 0-indexed month
                    const day = parseInt(dday.endDate.substring(6, 8));
                    endDateObj = new Date(year, month, day);
                }

                return {
                    id: dday.id,
                    title: dday.title,
                    group: dday.group || "",
                    description: dday.description || "",
                    date: dateObj,
                    endDate: endDateObj,
                    days: dateObj ? calculateDDay(dateObj) : "Unscheduled",
                    isAnnual: dday.isAnnual,
                    createdBy: dday.createdBy,
                    connectedUsers: dday.connectedUsers || [],
                };
            });

            setDdays(formattedDdays);
            setEventLayout(calculateEventLayout(formattedDdays));
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

        const targetDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        );
        targetDate.setHours(0, 0, 0, 0);
        const targetTime = targetDate.getTime();

        return ddays.filter((dday) => {
            if (!dday.date) {
                return false;
            }

            const startDate = new Date(dday.date);
            startDate.setHours(0, 0, 0, 0);
            const startTime = startDate.getTime();

            if (dday.isAnnual) {
                return (
                    startDate.getDate() === day &&
                    startDate.getMonth() === currentDate.getMonth()
                );
            }
            const endDate = dday.endDate ? new Date(dday.endDate) : startDate;
            endDate.setHours(0, 0, 0, 0);
            const endTime = endDate.getTime();

            return targetTime >= startTime && targetTime <= endTime;
        });
    };

    const createDDay = async (
        dday: Omit<DDay, "days" | "id">
    ): Promise<boolean> => {
        try {
            const dateString = dday.date
                ? `${dday.date.getFullYear()}${String(
                      dday.date.getMonth() + 1
                  ).padStart(2, "0")}${String(dday.date.getDate()).padStart(
                      2,
                      "0"
                  )}`
                : "";

            const endDateString = dday.endDate
                ? `${dday.endDate.getFullYear()}${String(
                      dday.endDate.getMonth() + 1
                  ).padStart(2, "0")}${String(dday.endDate.getDate()).padStart(
                      2,
                      "0"
                  )}`
                : "";

            const payload = {
                title: dday.title,
                group: dday.group,
                description: dday.description,
                isAnnual: dday.isAnnual,
                connectedUsers: dday.connectedUsers || [],
                createdBy: dday.createdBy,
                date: dateString,
                endDate: endDateString,
            };

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const errorMessage =
                    errorBody?.error ||
                    `Failed to create D-day: ${response.status}`;
                throw new Error(errorMessage);
            }

            await fetchDDays();
            return true;
        } catch (error) {
            console.error("Failed to create D-day:", error);
            return false;
        }
    };

    const calculateEventLayout = (events: DDay[]): Map<string, number> => {
        const layout = new Map<string, number>();
        const daySlots = new Map<string, boolean[]>(); // date string -> occupied rows

        const sortedEvents = [...events].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            const aStart = a.date.getTime();
            const bStart = b.date.getTime();
            if (aStart !== bStart) return aStart - bStart;

            const aEnd = a.endDate?.getTime() || aStart;
            const bEnd = b.endDate?.getTime() || bStart;

            // longer events first
            return bEnd - aEnd;
        });

        sortedEvents.forEach((event) => {
            if (!event.date) return;

            let row = 0;
            while (true) {
                let isRowAvailable = true;
                const eventEndDate = event.endDate || event.date;
                for (
                    let d = new Date(event.date);
                    d <= eventEndDate;
                    d.setDate(d.getDate() + 1)
                ) {
                    const dateString = d.toISOString().split("T")[0];
                    if (daySlots.get(dateString)?.[row]) {
                        isRowAvailable = false;
                        break;
                    }
                }

                if (isRowAvailable) {
                    layout.set(event.id, row);
                    for (
                        let d = new Date(event.date);
                        d <= eventEndDate;
                        d.setDate(d.getDate() + 1)
                    ) {
                        const dateString = d.toISOString().split("T")[0];
                        if (!daySlots.has(dateString)) {
                            daySlots.set(dateString, []);
                        }
                        daySlots.get(dateString)![row] = true;
                    }
                    break;
                }
                row++;
            }
        });
        return layout;
    };

    const getRenderableDDaysForDay = (
        day: number | null,
        currentDate: Date
    ): (DDay | null)[] => {
        const eventsForDay = getDDaysForDay(day, currentDate);
        const renderableEvents: (DDay | null)[] = [];

        eventsForDay.forEach((event) => {
            const row = eventLayout.get(event.id);
            if (row !== undefined) {
                // make sure array is long enough
                while (renderableEvents.length <= row) {
                    renderableEvents.push(null);
                }
                renderableEvents[row] = event;
            }
        });

        return renderableEvents;
    };

    const updateDDay = async (
        id: string,
        updates: Partial<Omit<DDay, "days" | "id">>
    ): Promise<boolean> => {
        try {
            const payload = { ...updates };

            if (Object.prototype.hasOwnProperty.call(updates, "date")) {
                const date = updates.date;
                // format to YYYYMMDD string or empty string if date is null/undefined
                (payload as any).date = date
                    ? `${date.getFullYear()}${String(
                          date.getMonth() + 1
                      ).padStart(2, "0")}${String(date.getDate()).padStart(
                          2,
                          "0"
                      )}`
                    : "";
            }

            if (Object.prototype.hasOwnProperty.call(updates, "endDate")) {
                const endDate = updates.endDate;
                // format to YYYYMMDD string or empty string if endDate is null/undefined
                (payload as any).endDate = endDate
                    ? `${endDate.getFullYear()}${String(
                          endDate.getMonth() + 1
                      ).padStart(2, "0")}${String(endDate.getDate()).padStart(
                          2,
                          "0"
                      )}`
                    : "";
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ddays/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to update D-day: ${response.status}`);
            }

            await fetchDDays();

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
        getRenderableDDaysForDay,
        createDDay,
        updateDDay,
        deleteDDay,
        refreshDDays: fetchDDays,
    };
}

export function getEventPosition(event: DDay, date: Date): EventPosition {
    if (!event.date) return "single";

    const eventStartDate = event.date;
    const eventEndDate = event.endDate || eventStartDate;

    const normalizeDate = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const normalizedCurrent = normalizeDate(date);
    const normalizedStart = normalizeDate(eventStartDate);
    const normalizedEnd = normalizeDate(eventEndDate);

    if (
        normalizedCurrent < normalizedStart ||
        normalizedCurrent > normalizedEnd
    )
        return "single";

    const isSingleDay = normalizedStart === normalizedEnd;

    if (isSingleDay) {
        return "single";
    }
    if (normalizedCurrent === normalizedStart) {
        return "start";
    }
    if (normalizedCurrent === normalizedEnd) {
        return "end";
    }
    return "middle";
}
