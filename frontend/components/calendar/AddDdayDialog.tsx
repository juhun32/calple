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

// icons
import { Plus, Calendar as CalendarIcon, CircleSmall } from "lucide-react";

// types
import { type AddDDayDialogProps, DDay } from "@/lib/types/calendar";
import { clear } from "console";

export function AddDDayDialog({
    isOpen,
    onOpenChange,
    initialDate,
    createDDay,
}: AddDDayDialogProps) {
    const [date, setDate] = useState<Date | undefined>(
        initialDate || undefined
    );
    const [group, setGroup] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAnnual, setIsAnnual] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setDate(initialDate || undefined);
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

        if (date) {
            ddayData.date = date;
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
        setDate(undefined);
    };

    const isControlled = isOpen !== undefined && onOpenChange !== undefined;

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
                                        !date
                                            ? "text-muted-foreground"
                                            : "text-foreground"
                                    )}
                                >
                                    Date:
                                </Label>
                                <div className="flex">
                                    <Popover.Popover>
                                        <Popover.PopoverTrigger
                                            asChild
                                            className="flex sm:hidden"
                                        >
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "justify-start text-left font-normal w-3/5 text-foreground rounded-full gap-1",
                                                    !date &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon
                                                    className="h-4 w-4"
                                                    strokeWidth={1.3}
                                                />
                                                {date ? (
                                                    format(date, "M/d/yy")
                                                ) : (
                                                    <span>(Optional)</span>
                                                )}
                                            </Button>
                                        </Popover.PopoverTrigger>
                                        <Popover.PopoverTrigger
                                            asChild
                                            className="hidden sm:flex"
                                        >
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "justify-start text-left font-normal w-3/5 sm:w-3/4 text-foreground rounded-full gap-1",
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
                                                    <span>(Optional)</span>
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
                                                onSelect={setDate}
                                                className="pointer-events-auto"
                                            />
                                        </Popover.PopoverContent>
                                    </Popover.Popover>
                                    <div className="flex items-center text-sm justify-end sm:px-2 w-2/5 sm:w-1/4 gap-1">
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
