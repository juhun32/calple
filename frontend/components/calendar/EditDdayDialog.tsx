import { useState, useMemo } from "react"; // Import useMemo

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// internal components

// types
import { DDayFormData, EditDdayDialogProps } from "@/lib/types/calendar";
import { DDayForm } from "./DDayForm";

// dialog component for editing existing calendar events - used by DDayIndicator
export function EditDdayDialog({
    dday,
    isOpen,
    onOpenChange,
    updateDDay,
    deleteDDay,
    uploadDDayImage,
}: EditDdayDialogProps) {
    // loading state during form submission - passed to DDayForm for button state
    const [isSubmitting, setIsSubmitting] = useState(false);
    // loading state during deletion - used for delete button state
    const [isDeleting, setIsDeleting] = useState(false);

    // handle form submission from the shared DDayForm component - called when user submits form
    const handleSubmit = async (formData: DDayFormData) => {
        if (!dday.id) {
            toast("Missing event ID");
            return false;
        }

        setIsSubmitting(true);

        try {
            // attempt to update the event - calls useDDays hook updateDDay function
            const success = await updateDDay(dday.id, formData);

            if (success) {
                toast("Your event has been updated successfully");
                onOpenChange(false);
            } else {
                toast("Failed to update event. Please try again.");
            }

            return success;
        } catch (error) {
            console.error("Error updating event:", error);
            toast("Something went wrong. Please try again.");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    // handle event deletion - called when user clicks delete button
    const handleDelete = async () => {
        if (!dday.id) return;

        // confirm deletion with user - browser confirm dialog
        if (!confirm("Are you sure you want to delete this event?")) {
            return;
        }

        setIsDeleting(true);

        try {
            // attempt to delete the event - calls useDDays hook deleteDDay function
            const success = await deleteDDay(dday.id);

            if (success) {
                toast("Your event has been deleted successfully");
                onOpenChange(false);
            } else {
                toast("Failed to delete event. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            toast("Something went wrong. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Memoize initialData to prevent it from being recreated on every render.
    // This stabilizes the prop and prevents the DDayForm's useEffect from re-running unnecessarily.
    const initialData = useMemo(
        () => ({
            title: dday.title,
            group: dday.group,
            description: dday.description,
            imageUrl: dday.imageUrl,
            date: dday.date,
            endDate: dday.endDate,
            isAnnual: dday.isAnnual,
            connectedUsers: dday.connectedUsers || [],
        }),
        [dday]
    );

    return (
        <AlertDialog.AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle>
                        Edit Event
                    </AlertDialog.AlertDialogTitle>
                    <AlertDialog.AlertDialogDescription asChild>
                        <div className="space-y-4">
                            <DDayForm
                                initialData={initialData}
                                onSubmit={handleSubmit}
                                onCancel={() => onOpenChange(false)}
                                onDelete={handleDelete}
                                submitLabel="Save"
                                cancelLabel="Cancel"
                                deleteLabel="Delete Event"
                                isSubmitting={isSubmitting}
                                isDeleting={isDeleting}
                                uploadImage={uploadDDayImage}
                            />
                        </div>
                    </AlertDialog.AlertDialogDescription>
                </AlertDialog.AlertDialogHeader>
            </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
    );
}
