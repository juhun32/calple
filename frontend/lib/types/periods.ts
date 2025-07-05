export interface PeriodDay {
    id: string;
    userId: string;
    date: string; // Format: YYYY-MM-DD
    isPeriod: boolean;
    symptoms: string[];
    mood: string[];
    activities: string[];
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface CycleSettings {
    id: string;
    userId: string;
    cycleLength: number;
    periodLength: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePeriodDayRequest {
    date: string;
    isPeriod: boolean;
    symptoms: string[];
    mood: string[];
    activities: string[];
    notes: string;
}

export interface UpdateCycleSettingsRequest {
    cycleLength: number;
    periodLength: number;
}
