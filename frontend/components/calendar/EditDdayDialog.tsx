import { useEffect, useState } from "react";
import { format } from "date-fns";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import * as Popover from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import * as Select from "@/components/ui/select";

// icons
import { CalendarIcon, CircleSmall } from "lucide-react";

// utils
import { cn } from "@/lib/utils";
import { selectGroups } from "@/lib/constants/calendar";

// types
import { EditDdayDialogProps } from "@/lib/types/calendar";

export function EditDdayDialog({
    dday,
    isOpen,
    onOpenChange,
    updateDDay,
    deleteDDay,
}: EditDdayDialogProps) {
    const [title, setTitle] = useState(dday.title);
    const [group, setGroup] = useState(dday.group || "");
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

    // update state when dday prop changes
    // this ensures if the dday prop is updated, the dialog reflects the latest data
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
        if (!title || !dday.id) {
            toast("Missing information");
            return;
        }

        setIsSubmitting(true);

        try {
            const connectedUsers = connectedEmail ? [connectedEmail] : [];

            const success = await updateDDay(dday.id, {
                title,
                group,
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
        <AlertDialog.AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle>
                        Edit Event
                    </AlertDialog.AlertDialogTitle>
                    <AlertDialog.AlertDialogDescription asChild>
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-[1fr_5fr] gap-2 items-center">
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        !title
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Title:
                                </Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={cn(
                                        "border rounded-md text-sm w-full focus:text-foreground rounded-full",
                                        !title
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                    placeholder="Title"
                                />
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        !group
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Group:
                                </Label>
                                <Select.Select
                                    value={group}
                                    onValueChange={setGroup}
                                >
                                    <Select.SelectTrigger className="w-full text-sm rounded-full">
                                        <Select.SelectValue placeholder="Select Group" />
                                    </Select.SelectTrigger>
                                    <Select.SelectContent className="w-full">
                                        <Select.SelectGroup>
                                            {selectGroups.map((selectGroup) => (
                                                <Select.SelectItem
                                                    key={selectGroup.value}
                                                    value={selectGroup.value}
                                                    className="cursor-pointer text-xs"
                                                >
                                                    <CircleSmall
                                                        className={`${selectGroup.color}`}
                                                    />
                                                    <p className="text-foreground">
                                                        {selectGroup.label}
                                                    </p>
                                                </Select.SelectItem>
                                            ))}
                                        </Select.SelectGroup>
                                    </Select.SelectContent>
                                </Select.Select>
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        !description
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Description:
                                </Label>
                                <Input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className={cn(
                                        "border rounded-md text-sm w-full rounded-full focus:text-foreground",
                                        !description
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                    placeholder="Optional"
                                />
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        !date
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Date:
                                </Label>
                                <div className="flex">
                                    <Popover.Popover>
                                        <Popover.PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "rounded-full justify-start text-left font-normal w-3/4 text-foreground",
                                                    !date &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon
                                                    className="h-4 w-4"
                                                    strokeWidth={1.3}
                                                />
                                                {date ? (
                                                    format(date, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </Popover.PopoverTrigger>
                                        <Popover.PopoverContent
                                            className="w-auto p-0 z-50"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(date) =>
                                                    setDate(date || new Date())
                                                }
                                                className="pointer-events-auto"
                                            />
                                        </Popover.PopoverContent>
                                    </Popover.Popover>
                                    <div className="flex items-center text-sm justify-end px-2 w-1/3 sm:w-1/4 gap-2">
                                        <Label
                                            className={cn(
                                                !isAnnual
                                                    ? "text-muted-foreground"
                                                    : "text-foreground"
                                            )}
                                        >
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
                    </AlertDialog.AlertDialogDescription>
                </AlertDialog.AlertDialogHeader>
                <AlertDialog.AlertDialogFooter className="flex flex-row justify-between">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="sm:mr-auto rounded-full w-20"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="rounded-full w-20"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title}
                            className="rounded-full w-20"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </AlertDialog.AlertDialogFooter>
            </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
    );
}
