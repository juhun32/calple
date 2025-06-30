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
import { DateRange } from "react-day-picker";

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
    initialDate,
    updateDDay,
    deleteDDay,
}: EditDdayDialogProps) {
    const [title, setTitle] = useState(dday.title);
    const [group, setGroup] = useState(dday.group || "");
    const [description, setDescription] = useState(dday.description || "");
    const [date, setDate] = useState<Date | undefined>(dday.date);

    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialDate ? { from: initialDate, to: initialDate } : undefined
    );
    const [isMultiDay, setIsMultiDay] = useState(false);
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
        const hasEndDate =
            dday.endDate && dday.date?.getTime() !== dday.endDate?.getTime();
        setIsMultiDay(!!hasEndDate);
        setDateRange(
            dday.date
                ? { from: dday.date, to: dday.endDate || dday.date }
                : undefined
        );
    }, [isOpen, dday]);

    const formatDateDisplay = () => {
        if (!dateRange?.from) return <span>(Optional)</span>;

        if (isMultiDay && dateRange.to) {
            return (
                <>
                    <span className="hidden sm:inline">
                        {format(dateRange.from, "PP")} to{" "}
                        {format(dateRange.to, "PP")}
                    </span>
                    <span className="sm:hidden">
                        {format(dateRange.from, "M/d/yy")} to{" "}
                        {format(dateRange.to, "M/d/yy")}
                    </span>
                </>
            );
        }

        return (
            <>
                <span className="hidden sm:inline">
                    {format(dateRange.from, "PPP")}
                </span>
                <span className="sm:hidden">
                    {format(dateRange.from, "M/d/yy")}
                </span>
            </>
        );
    };

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
                description,
                isAnnual,
                connectedUsers,
                date: dateRange?.from,
                endDate: isMultiDay ? dateRange?.to : undefined,
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
                            <div className="grid grid-cols-[1fr_4fr] gap-2 items-center">
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
                                    value={group ? group : "others"}
                                    onValueChange={setGroup}
                                >
                                    <Select.SelectTrigger className="w-full text-sm rounded-full">
                                        <Select.SelectValue placeholder="Others" />
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
                                        "border rounded-md text-sm w-full focus:text-foreground rounded-full",
                                        !description
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                    placeholder="(Optional)"
                                />
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        !dateRange?.from
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Date:
                                </Label>
                                <Popover.Popover>
                                    <Popover.PopoverTrigger
                                        asChild
                                        className="flex sm:hidden"
                                    >
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal w-full text-foreground rounded-full gap-1",
                                                !dateRange?.from &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon
                                                className="h-4 w-4"
                                                strokeWidth={1.3}
                                            />
                                            {formatDateDisplay()}
                                        </Button>
                                    </Popover.PopoverTrigger>

                                    <Popover.PopoverTrigger
                                        asChild
                                        className="hidden sm:flex"
                                    >
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "justify-start text-left font-normal w-full text-foreground rounded-full gap-1",
                                                !dateRange?.from &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon
                                                className="h-4 w-4"
                                                strokeWidth={1.3}
                                            />
                                            {formatDateDisplay()}
                                        </Button>
                                    </Popover.PopoverTrigger>

                                    <Popover.PopoverContent
                                        className="w-auto p-0 z-50"
                                        align="start"
                                    >
                                        {isMultiDay ? (
                                            <Calendar
                                                mode="range"
                                                selected={dateRange}
                                                onSelect={setDateRange}
                                                className="pointer-events-auto"
                                                numberOfMonths={2}
                                            />
                                        ) : (
                                            <Calendar
                                                mode="single"
                                                selected={dateRange?.from}
                                                onSelect={(date) =>
                                                    setDateRange(
                                                        date
                                                            ? {
                                                                  from: date,
                                                                  to: date,
                                                              }
                                                            : undefined
                                                    )
                                                }
                                                className="pointer-events-auto"
                                                numberOfMonths={1}
                                            />
                                        )}
                                    </Popover.PopoverContent>
                                </Popover.Popover>
                                <Label
                                    className={cn(
                                        "text-sm font-medium",
                                        "text-foreground"
                                    )}
                                >
                                    Options:
                                </Label>
                                <div className="flex items-center gap-4 p-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isMultiDay"
                                            checked={isMultiDay}
                                            onCheckedChange={(checked) => {
                                                setIsMultiDay(checked === true);
                                                if (checked === false) {
                                                    // Reset to single day if unchecking
                                                    setDateRange(
                                                        dateRange?.from
                                                            ? {
                                                                  from: dateRange.from,
                                                                  to: dateRange.from,
                                                              }
                                                            : undefined
                                                    );
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="isMultiDay"
                                            className={cn(
                                                !isMultiDay
                                                    ? "text-muted-foreground"
                                                    : "text-foreground"
                                            )}
                                        >
                                            Multi-day
                                        </Label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isAnnual"
                                            checked={isAnnual}
                                            onCheckedChange={(checked) =>
                                                setIsAnnual(checked === true)
                                            }
                                        />
                                        <Label
                                            htmlFor="isAnnual"
                                            className={cn(
                                                !isAnnual
                                                    ? "text-muted-foreground"
                                                    : "text-foreground"
                                            )}
                                        >
                                            Annual
                                        </Label>
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
