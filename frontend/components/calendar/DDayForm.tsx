"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// utils
import { cn } from "@/lib/utils";
import { selectGroups } from "@/lib/constants/calendar";

// components
import * as Popover from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import * as Select from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// icons
import {
    Calendar as CalendarIcon,
    CircleSmall,
    Pencil,
    SquareChevronRight,
    Settings,
} from "lucide-react";

// types
import { DDay, DDayFormData, DDayFormProps } from "@/lib/types/calendar";

// shared form component for creating and editing calendar events
export function DDayForm({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    isSubmitting = false,
}: DDayFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [group, setGroup] = useState(initialData?.group || "");
    const [description, setDescription] = useState(
        initialData?.description || ""
    );
    const [isAnnual, setIsAnnual] = useState(initialData?.isAnnual || false);
    const [connectedEmail, setConnectedEmail] = useState(
        initialData?.connectedUsers?.[0] || ""
    );
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialData?.date
            ? {
                  from: initialData.date,
                  to: initialData.endDate || initialData.date,
              }
            : undefined
    );

    // update form when initialData changes (for edit mode) - called when editing existing events
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setGroup(initialData.group || "");
            setDescription(initialData.description || "");
            setIsAnnual(initialData.isAnnual || false);
            setConnectedEmail(initialData.connectedUsers?.[0] || "");

            if (initialData.date) {
                setDateRange({
                    from: initialData.date,
                    to: initialData.endDate || initialData.date,
                });
                setIsMultiDay(
                    !!(
                        initialData.endDate &&
                        initialData.date.getTime() !==
                            initialData.endDate.getTime()
                    )
                );
            }
        }
    }, [initialData]);

    // handle form submission - called by parent dialog (AddDdayDialog or EditDdayDialog)
    const handleSubmit = async () => {
        if (!title) return;

        // prepare connected users array - used for user connections
        const connectedUsers = connectedEmail ? [connectedEmail] : [];
        const formData: DDayFormData = {
            title,
            group: group || "others",
            description: description || "",
            isAnnual,
            connectedUsers,
        };

        // add date information if available - used by calendar grid and date calculations
        if (dateRange?.from) {
            formData.date = dateRange.from;
            if (isMultiDay && dateRange.to && dateRange.to >= dateRange.from) {
                formData.endDate = dateRange.to;
            }
        }

        // submit form data - calls parent dialog's onSubmit function
        const success = await onSubmit(formData);
        if (success) {
            // reset form on successful submission - clears form for next use
            setTitle("");
            setGroup("");
            setDescription("");
            setIsAnnual(false);
            setConnectedEmail("");
            setDateRange(undefined);
            setIsMultiDay(false);
        }
    };

    // format date display for the date picker button - responsive formatting for different screen sizes
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
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_4fr] gap-2 items-center">
                <Label
                    className={cn(
                        "text-sm font-medium",
                        !title ? "text-muted-foreground" : "text-foreground"
                    )}
                >
                    <Pencil className="h-4 w-4" />
                    Title:
                </Label>
                <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(
                        "rounded-md text-sm w-full focus:text-foreground rounded-full px-4",
                        !title ? "text-muted-foreground" : "text-foreground"
                    )}
                    placeholder="Title"
                />

                <Label
                    className={cn(
                        "text-sm font-medium",
                        !group ? "text-muted-foreground" : "text-foreground"
                    )}
                >
                    <CircleSmall className="h-4 w-4" />
                    Group:
                </Label>
                <Select.Select
                    value={group || "others"}
                    onValueChange={setGroup}
                >
                    <Select.SelectTrigger className="border-none inset-shadow-sm w-full text-sm rounded-full px-4">
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
                                        className={selectGroup.color}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={cn(
                        "rounded-md text-sm w-full focus:text-foreground rounded-full px-4",
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
                    <Popover.PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "border-none inset-shadow-sm justify-start text-left font-normal w-full text-foreground rounded-full px-4",
                                !dateRange?.from && "text-muted-foreground"
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
                                            ? { from: date, to: date }
                                            : undefined
                                    )
                                }
                                className="pointer-events-auto"
                                numberOfMonths={1}
                            />
                        )}
                    </Popover.PopoverContent>
                </Popover.Popover>

                <Label className="text-sm font-medium text-foreground">
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

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="rounded-full"
                    >
                        {cancelLabel}
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title}
                    className="rounded-full"
                >
                    {isSubmitting ? "Saving..." : submitLabel}
                </Button>
            </div>
        </div>
    );
}
