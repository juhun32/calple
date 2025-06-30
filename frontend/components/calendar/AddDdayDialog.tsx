"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

// utils
import { cn } from "@/lib/utils";
import { selectGroups } from "@/lib/constants/calendar";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import * as Popover from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import * as Select from "@/components/ui/select";
import { DateRange } from "react-day-picker";

// icons
import {
    Plus,
    Calendar as CalendarIcon,
    CircleSmall,
    Pencil,
    SquareChevronRight,
    Settings,
} from "lucide-react";

// types
import { type AddDDayDialogProps, DDay } from "@/lib/types/calendar";

export function AddDDayDialog({
    isOpen,
    onOpenChange,
    initialDate,
    createDDay,
}: AddDDayDialogProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialDate ? { from: initialDate, to: initialDate } : undefined
    );
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [group, setGroup] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAnnual, setIsAnnual] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialDate) {
            setDateRange({ from: initialDate, to: initialDate });
        }
    }, [initialDate]);

    const handleSubmitAdd = async () => {
        // title is required
        if (!title) {
            return;
        }

        // for button loading state
        setIsSubmitting(true);

        const connectedUsers = connectedEmail ? [connectedEmail] : [];

        const ddayData: Omit<DDay, "id" | "days"> = {
            title,
            group: group || "others",
            description: description || "",
            isAnnual,
            connectedUsers,
            createdBy: "",
        };

        if (dateRange?.from) {
            ddayData.date = dateRange.from;

            if (isMultiDay && dateRange.to && dateRange.to >= dateRange.from) {
                ddayData.endDate = dateRange.to;
            }
        }

        const success = await createDDay(ddayData);

        setIsSubmitting(false);

        if (success) {
            clearFields();
        }
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    const clearFields = () => {
        setTitle("");
        setGroup("");
        setDescription("");
        setIsAnnual(false);
        setConnectedEmail("");
        setDateRange(undefined);
        setIsMultiDay(false);
    };

    const isControlled = isOpen !== undefined && onOpenChange !== undefined;

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

    return (
        <AlertDialog.AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
                                    <Pencil className="h-4 w-4" />
                                    Title:
                                </Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={cn(
                                        "border rounded-md text-sm w-full focus:text-foreground rounded-full px-4",
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
                                    <CircleSmall className="h-4 w-4" />
                                    Group:
                                </Label>
                                <Select.Select
                                    value={group ? group : "others"}
                                    onValueChange={setGroup}
                                >
                                    <Select.SelectTrigger className="w-full text-sm rounded-full px-4">
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
                                    <SquareChevronRight className="h-4 w-4" />
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
                                        "border rounded-md text-sm w-full focus:text-foreground rounded-full px-4",
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
                                    <CalendarIcon className="h-4 w-4" />
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
                                                "justify-start text-left font-normal w-full text-foreground rounded-full px-4",
                                                !dateRange?.from &&
                                                    "text-muted-foreground"
                                            )}
                                        >
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
                                                "justify-start text-left font-normal w-full text-foreground rounded-full px-4",
                                                !dateRange?.from &&
                                                    "text-muted-foreground"
                                            )}
                                        >
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
                                    <Settings className="h-4 w-4" />
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
                <AlertDialog.AlertDialogFooter className="flex flex-row gap-2 justify-end">
                    <AlertDialog.AlertDialogCancel
                        onClick={clearFields}
                        className="rounded-full"
                    >
                        Cancel
                    </AlertDialog.AlertDialogCancel>
                    <AlertDialog.AlertDialogAction
                        onClick={handleSubmitAdd}
                        disabled={isSubmitting || !title}
                        className="rounded-full"
                    >
                        {isSubmitting ? "Adding..." : "Add"}
                    </AlertDialog.AlertDialogAction>
                </AlertDialog.AlertDialogFooter>
            </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
    );
}
