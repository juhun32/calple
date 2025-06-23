export type DDay = {
    id: string;
    title: string;
    group: string;
    date?: Date;
    endDate?: Date;
    description: string;
    days: string;
    isAnnual: boolean;
    createdBy: string;
    connectedUsers?: string[];
};

export type EventPosition = "start" | "middle" | "end" | "single";

export interface CalendarGridProps {
    currentDate: Date;
    endDate?: Date;
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
    activeDDay: DDay | null;
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
    onDraggingChange?: (isDragging: boolean) => void;
    context?: "sheet" | "grid";
    length?: "short" | "long";
    position?: EventPosition;
    dayIndex?: number;
    droppableId?: string;
}

export interface CalendarHeaderProps {
    currentDate: Date;
    goToNextMonth: () => void;
    goToPrevMonth: () => void;
    goToToday: () => void;
}

export interface EditDdayDialogProps {
    dday: DDay;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "days" | "id">>
    ) => Promise<boolean>;
    deleteDDay: (id: string) => Promise<boolean>;
}
