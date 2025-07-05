import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
    getPeriodDays,
    createPeriodDay,
    deletePeriodDay,
    getCycleSettings,
    updateCycleSettings,
} from "@/lib/api/periods";
import {
    PeriodDay,
    CycleSettings,
    CreatePeriodDayRequest,
    UpdateCycleSettingsRequest,
} from "@/lib/types/periods";

export function usePeriods() {
    const [periodDays, setPeriodDays] = useState<PeriodDay[]>([]);
    const [cycleSettings, setCycleSettings] = useState<CycleSettings | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Load period days
            const periodDaysResponse = await getPeriodDays();
            setPeriodDays(periodDaysResponse.periodDays);

            // Load cycle settings
            const settingsResponse = await getCycleSettings();
            setCycleSettings(settingsResponse.cycleSettings);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "Failed to load period data";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get period days as a Set for easy lookup
    const periodDaysSet = useMemo(() => {
        return new Set(
            periodDays.filter((pd) => pd.isPeriod).map((pd) => pd.date)
        );
    }, [periodDays]);

    // Period Days operations
    const addPeriodDay = useCallback(
        async (date: string, isPeriod: boolean = true) => {
            try {
                const newPeriodDay: CreatePeriodDayRequest = {
                    date,
                    isPeriod,
                    symptoms: [],
                    mood: [],
                    activities: [],
                    notes: "",
                };
                await createPeriodDay(newPeriodDay);
                await loadData(); // Reload data to get the updated list
                toast.success("Period day added successfully");
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to add period day";
                toast.error(errorMessage);
                throw err;
            }
        },
        [loadData]
    );

    const removePeriodDay = useCallback(
        async (date: string) => {
            try {
                await deletePeriodDay(date);
                await loadData(); // Reload data to get the updated list
                toast.success("Period day removed successfully");
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to remove period day";
                toast.error(errorMessage);
                throw err;
            }
        },
        [loadData]
    );

    const togglePeriodDay = useCallback(
        async (date: string) => {
            const existingDay = periodDays.find((pd) => pd.date === date);
            if (existingDay) {
                if (existingDay.isPeriod) {
                    // If it's a period day, remove it
                    await removePeriodDay(date);
                } else {
                    // If it's not a period day, make it one
                    await addPeriodDay(date, true);
                }
            } else {
                // If no day exists, create a new period day
                await addPeriodDay(date, true);
            }
        },
        [periodDays, addPeriodDay, removePeriodDay]
    );

    // Update period day data (symptoms, mood, activities, notes)
    const updatePeriodDay = useCallback(
        async (
            date: string,
            data: {
                symptoms: string[];
                mood: string[];
                activities: string[];
                notes: string;
            }
        ) => {
            try {
                const existingDay = periodDays.find((pd) => pd.date === date);
                const updateData: CreatePeriodDayRequest = {
                    date,
                    isPeriod: existingDay?.isPeriod || false,
                    ...data,
                };
                await createPeriodDay(updateData);
                await loadData(); // Reload data to get the updated list
                toast.success("Period day updated successfully");
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to update period day";
                toast.error(errorMessage);
                throw err;
            }
        },
        [periodDays, loadData]
    );

    // Cycle Settings operations
    const updateSettings = useCallback(
        async (settings: UpdateCycleSettingsRequest) => {
            try {
                const response = await updateCycleSettings(settings);
                setCycleSettings(response.cycleSettings);
                toast.success("Cycle settings updated successfully");
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : "Failed to update cycle settings";
                toast.error(errorMessage);
                throw err;
            }
        },
        []
    );

    const getLogForDate = useCallback(
        (date: string) => {
            return periodDays.find((day) => day.date === date) || null;
        },
        [periodDays]
    );

    return {
        // State
        periodDays,
        periodDaysSet,
        cycleSettings,
        loading,
        error,

        // Actions
        loadData,
        addPeriodDay,
        removePeriodDay,
        togglePeriodDay,
        updatePeriodDay,
        updateSettings,
        getLogForDate,
    };
}
