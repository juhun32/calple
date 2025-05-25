import { useEffect, useState } from "react";
import { DDay, useDDays } from "@/hooks/useDDays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditDdayDialogProps {
    dday: DDay;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditDdayDialog({
    dday,
    isOpen,
    onOpenChange,
}: EditDdayDialogProps) {
    const { updateDDay, deleteDDay } = useDDays();

    // Initialize form with the existing dday values
    const [title, setTitle] = useState(dday.title);
    const [description, setDescription] = useState(dday.description || "");
    const [date, setDate] = useState<Date | undefined>(dday.date);
    const [isAnnual, setIsAnnual] = useState(dday.isAnnual);
    const [connectedEmail, setConnectedEmail] = useState(
        dday.connectedUsers && dday.connectedUsers.length > 0
            ? dday.connectedUsers[0]
            : ""
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Update form values when dday changes
    useEffect(() => {
        setTitle(dday.title);
        setDescription(dday.description || "");
        setDate(dday.date);
        setIsAnnual(dday.isAnnual);
        setConnectedEmail(
            dday.connectedUsers && dday.connectedUsers.length > 0
                ? dday.connectedUsers[0]
                : ""
        );
    }, [dday]);

    const handleSubmit = async () => {
        if (!title || !date || !dday.id) {
            toast("Missing information");
            return;
        }

        setIsSubmitting(true);

        try {
            const connectedUsers = connectedEmail ? [connectedEmail] : [];

            const success = await updateDDay(dday.id, {
                title,
                date,
                description,
                isAnnual,
                connectedUsers,
            });

            if (success) {
                toast("Your event has been updated successfully");
                onOpenChange(false);
            } else {
                toast("Failed to update event. Please try again.");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            toast("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!dday.id) return;

        if (!confirm("Are you sure you want to delete this event?")) {
            return;
        }

        setIsDeleting(true);

        try {
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

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add D-Day</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-[1fr_5fr] gap-2 items-center">
                                <Label className="text-sm font-medium">
                                    Title:
                                </Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border rounded-md py-1 px- text-sm w-full"
                                    placeholder="Title"
                                />
                            </div>
                            <div className="grid grid-cols-[1fr_5fr] gap-2 items-center">
                                <Label className="text-sm font-medium">
                                    Description:
                                </Label>
                                <Input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="border py-1 px-2 text-sm w-full"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-[1fr_5fr] gap-2 items-center">
                                <Label className="text-sm font-medium">
                                    Date:
                                </Label>
                                <div className="flex">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "justify-start text-left font-normal w-3/4",
                                                    !date &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? (
                                                    format(date, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(date) =>
                                                    setDate(date || new Date())
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <div className="flex items-center text-sm justify-end px-2 w-1/4 gap-2">
                                        <Label className="text-sm">
                                            Annual:
                                        </Label>
                                        <Checkbox
                                            id="isAnnual"
                                            checked={isAnnual}
                                            onCheckedChange={(checked) =>
                                                setIsAnnual(checked === true)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="sm:mr-auto"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title || !date}
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
