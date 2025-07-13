// represents a calendar event with all its properties; used by useDDays hook and all calendar components
export type DDay = {
    id: string; // unique identifier for the event; used by api calls and database operations
    title: string; // display name of the event; shown in DDayIndicator and form components
    group: string; // category/group the event belongs to; used for color coding and filtering
    date?: Date; // start date of the event (optional for unscheduled events); used by calendar grid and date calculations
    endDate?: Date; // end date for mult;day events; used by layout system and date range calculations
    description: string; // detailed description of the event; shown in DDayIndicator details dialog
    days: string; // calculated day count (e.g., ";5", "Today", "D+3"); computed by useDDays hook
    isAnnual: boolean; // whether this event repeats annually; used by useDDays hook for date filtering
    createdBy: string; // user ID who created the event; used by backend api for user association
    connectedUsers?: string[]; // array of connected user emails; used by DDayForm for user connections
};

// defines the visual position of an event in a multiday layout; used by DDayIndicator and calendar grid
export type EventPosition = "start" | "middle" | "end" | "single";

// props for the main calendar grid component passed from calendar page to CalendarGrid
export interface CalendarGridProps {
    currentDate: Date; // currently displayed month/year; from useCalendar hook
    monthData: (number | null)[]; // array of day numbers (null for empty cells); from useCalendar hook
    isSelected: (day: number | null) => boolean; // function to check if a day is selected; from useCalendar hook
    isToday: (day: number | null) => boolean; // function to check if a day is today; from useCalendar hook
    selectDate: (day: number) => void; // function to select a date; from useCalendar hook
    getDDaysForDay: (day: number | null, currentDate: Date) => (DDay | null)[]; // get events for a specific day; from useDDays hook
    createDDay: (dday: Omit<DDay, "id" | "days">) => Promise<boolean>; // create new event; from useDDays hook
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "id" | "days">>
    ) => Promise<boolean>; // update existing event; from useDDays hook
    deleteDDay: (id: string) => Promise<boolean>; // delete an event; from useDDays hook
    activeDDay: DDay | null; // currently dragged event for dnd; from calendar page drag state
}

// props for the add event dialog component; used by CalendarGrid and can be controlled externally
export interface AddDDayDialogProps {
    isOpen?: boolean; // whether the dialog is open; from CalendarGrid state
    onOpenChange?: (open: boolean) => void; // callback when dialog open state changes; passed to CalendarGrid
    initialDate?: Date | null; // preselected date for the new event; from CalendarGrid day selection
    createDDay: (dday: Omit<DDay, "id" | "days">) => Promise<boolean>; // function to create event; from useDDays hook
}

// props for individual event indicator components; used by CalendarGrid, DDaySheet, and ShowAllEvents
export interface DDayIndicatorProps {
    dday: DDay; // the event to display; from useDDays hook data
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "id" | "days">>
    ) => Promise<boolean>; // update function; from useDDays hook
    deleteDDay: (id: string) => Promise<boolean>; // delete function; from useDDays hook
    onDraggingChange?: (isDragging: boolean) => void; // callback for drag state changes; used by DDaySheet
    context?: "sheet" | "grid"; // where the indicator is being used; affects styling and behavior
    length?: "short" | "long"; // display length for title truncation; used by ShowAllEvents for table display
    position?: EventPosition; // visual position in multiday layout; calculated by getEventPosition function
    dayIndex?: number; // index of the day in the grid; used by CalendarGrid for week highlighting
    droppableId?: string; // id for dnd functionality; used by CalendarGrid drag system
    currentDate?: Date; // current date for context; used by CalendarGrid for date calculations
}

// props for the calendar header component; passed from calendar page to CalendarHeader
export interface CalendarHeaderProps {
    currentDate: Date; // currently displayed month/year; from useCalendar hook
    goToNextMonth: () => void; // navigate to next month; from useCalendar hook
    goToPrevMonth: () => void; // navigate to previous month; from useCalendar hook
    goToToday: () => void; // navigate to current month; from useCalendar hook
}

// props for the edit event dialog component; used by DDayIndicator for editing events
export interface EditDdayDialogProps {
    dday: DDay; // the event to edit; from DDayIndicator click
    isOpen: boolean; // whether the dialog is open; from DDayIndicator state
    onOpenChange: (open: boolean) => void; // callback when dialog state changes; passed to DDayIndicator
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "days" | "id">>
    ) => Promise<boolean>; // update function; from useDDays hook
    deleteDDay: (id: string) => Promise<boolean>; // delete function; from useDDays hook
}

// data structure for event form inputs; used by DDayForm and shared between AddDdayDialog and EditDdayDialog
export interface DDayFormData {
    title: string; // event title; required field for form validation
    group: string; // event category/group; used for color coding and filtering
    description: string; // event description; optional field for additional details
    date?: Date; // start date; used by calendar grid and date calculations
    endDate?: Date; // end date for mult;day events; used by layout system
    isAnnual: boolean; // whether event repeats annually; used by useDDays hook for filtering
    connectedUsers: string[]; // array of connected user emails; used for user connections
}

// props for the shared event form component; used by AddDdayDialog and EditDdayDialog
export interface DDayFormProps {
    initialData?: Partial<DDay>; // prepopulated form data; from existing event or user input
    onSubmit: (data: DDayFormData) => Promise<boolean>; // form submission handler; passed from parent dialog
    onCancel?: () => void; // cancel button handler; passed from parent dialog
    onDelete?: () => void; // delete button handler; passed from parent dialog
    submitLabel?: string; // text for submit button; customizable by parent dialog
    cancelLabel?: string; // text for cancel button; customizable by parent dialog
    deleteLabel?: string; // text for delete button; customizable by parent dialog
    isSubmitting?: boolean; // whether form is currently submitting; from parent dialog state
    isDeleting?: boolean; // whether delete action is currently in progress; from parent dialog state
}

// props for the show all events dialog component; used by CalendarGrid only when there are 4+ events on a day
export interface ShowAllEventsProps {
    ddays: DDay[]; // array of events to display; from CalendarGrid day events
    updateDDay: (
        id: string,
        updates: Partial<Omit<DDay, "id" | "days">>
    ) => Promise<boolean>; // update function; from useDDays hook
    deleteDDay: (id: string) => Promise<boolean>; // delete function; from useDDays hook
}
