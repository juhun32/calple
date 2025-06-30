"use client";

import { useState } from "react";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// icons
import { Plus } from "lucide-react";

// internal components
import { DDayForm } from "./DDayForm";

// types
import { DDayFormData, type AddDDayDialogProps } from "@/lib/types/calendar";

// dialog component for adding new calendar events - used by CalendarGrid and can be controlled externally
export function AddDDayDialog({
    isOpen,
    onOpenChange,
    initialDate,
    createDDay,
}: AddDDayDialogProps) {
    // loading state during form submission - passed to DDayForm for button state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handle form submission from the shared DDayForm component - called when user submits form
    const handleSubmit = async (formData: DDayFormData) => {
        setIsSubmitting(true);

        // prepare event data for creation (add createdBy field) - required by backend API
        const ddayData = {
            ...formData,
            createdBy: "",
        };

        // attempt to create the event - calls useDDays hook createDDay function
        const success = await createDDay(ddayData);
        setIsSubmitting(false);

        // close dialog on successful creation - calls CalendarGrid state setter
        if (success && onOpenChange) {
            onOpenChange(false);
        }

        return success;
    };

    // determine if this dialog is controlled (has external open state) or uncontrolled - affects trigger button rendering
    const isControlled = isOpen !== undefined && onOpenChange !== undefined;

    return (
        <AlertDialog.AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            {/* render trigger button only for uncontrolled mode - when used standalone */}
            {!isControlled && (
                <AlertDialog.AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="rounded-full flex items-center gap-2 hover:cursor-pointer sm:w-fit h-8 w-8"
                    >
                        <Plus className="h-6" />
                        <span className="hidden sm:flex">Add Event</span>
                    </Button>
                </AlertDialog.AlertDialogTrigger>
            )}
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle>
                        Add Event
                    </AlertDialog.AlertDialogTitle>
                    <AlertDialog.AlertDialogDescription asChild>
                        {/* shared form component - used by both AddDdayDialog and EditDdayDialog */}
                        <DDayForm
                            initialData={
                                initialDate ? { date: initialDate } : undefined
                            }
                            onSubmit={handleSubmit}
                            onCancel={() => onOpenChange?.(false)}
                            submitLabel="Add"
                            cancelLabel="Cancel"
                            isSubmitting={isSubmitting}
                        />
                    </AlertDialog.AlertDialogDescription>
                </AlertDialog.AlertDialogHeader>
            </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
    );
}
