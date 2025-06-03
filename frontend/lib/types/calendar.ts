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

export interface CalendarGridProps {
    currentDate: Date;
    monthData: (number | null)[];
    requiredRows: number;
    isSelected: (day: number | null) => boolean;
    isToday: (day: number | null) => boolean;
    selectDate: (day: number) => void;
    getDDaysForDay: (day: number | null, currentDate: Date) => any[];
    createDDay: (dday: Omit<any, "id" | "days">) => Promise<boolean>;
    updateDDay: (
        id: string,
        updates: Partial<Omit<any, "id" | "days">>
    ) => Promise<boolean>;
    deleteDDay: (id: string) => Promise<boolean>;
}

export interface AddDDayDialogProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialDate?: Date | null;
    createDDay: (dday: Omit<DDay, "id" | "days">) => Promise<boolean>;
}

export interface DDayIndicatorProps {
    dday: DDay;
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "id" | "days">>
    ) => Promise<boolean>;
    deleteDDay: (id: string) => Promise<boolean>;
}
