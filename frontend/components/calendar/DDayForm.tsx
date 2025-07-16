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
    Loader2,
} from "lucide-react";

// types
import { DDay, DDayFormData, DDayFormProps } from "@/lib/types/calendar";
import Image from "next/image";

// shared form component for creating and editing calendar events
export function DDayForm({
    initialData,
    onSubmit,
    onCancel,
    onDelete,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    deleteLabel = "Delete",
    isSubmitting = false,
    isDeleting = false,
}: DDayFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [group, setGroup] = useState(initialData?.group || "");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isAnnual, setIsAnnual] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState(
        initialData?.connectedUsers?.[0] || ""
    );
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // update form when initialData changes (for edit mode) - called when editing existing events
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setGroup(initialData.group || "");
            setDescription(initialData.description || "");
            setImageUrl(initialData.imageUrl || "");
            setIsAnnual(initialData.isAnnual || false);
            setConnectedEmail(initialData.connectedUsers?.[0] || "");

            if (initialData.date) {
                const fromDate = new Date(initialData.date);
                const toDate = initialData.endDate
                    ? new Date(initialData.endDate)
                    : fromDate;
                setDateRange({ from: fromDate, to: toDate });

                const shouldBeMultiDay =
                    fromDate.getTime() !== toDate.getTime();
                setIsMultiDay(shouldBeMultiDay);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    // handle file input change - uploads file to server and sets image URL state
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get the presigned URL from our backend
            const res = await fetch("/api/ddays/upload-url", {
                method: "POST",
            });
            if (!res.ok) throw new Error("Failed to get upload URL.");
            const { uploadUrl, publicUrl } = await res.json();

            // 2. Upload the file directly to R2
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });
            if (!uploadRes.ok) throw new Error("Upload failed.");

            // 3. Set the public URL to state for preview and submission
            setImageUrl(publicUrl);
        } catch (error) {
            console.error("Error uploading file:", error);
            // You can add a user-facing error message here (e.g., using a toast)
        } finally {
            setIsUploading(false);
        }
    };

    // handle form submission - called by parent dialog (AddDdayDialog or EditDdayDialog)
    const handleSubmit = async () => {
        if (!title) return;

        // prepare connected users array - used for user connections
        const connectedUsers = connectedEmail ? [connectedEmail] : [];
        const formData: DDayFormData = {
            title,
            group: group || "others",
            description,
            imageUrl,
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
            setImageUrl("");
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
        <div className="space-y-4">
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
                        key={`calendar-${isMultiDay ? "range" : "single"}`}
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
                        <Button
                            type="button"
                            variant={isMultiDay ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                console.log(
                                    "Multi-day button clicked, current state:",
                                    isMultiDay
                                );
                                const newIsMultiDay = !isMultiDay;
                                console.log(
                                    "Setting isMultiDay to:",
                                    newIsMultiDay
                                );
                                setIsMultiDay(newIsMultiDay);

                                if (dateRange?.from) {
                                    if (newIsMultiDay) {
                                        // When enabling multi-day, set the end date to the same as start date initially
                                        setDateRange({
                                            from: dateRange.from,
                                            to: dateRange.from,
                                        });
                                    } else {
                                        // When disabling multi-day, keep only the start date
                                        setDateRange({
                                            from: dateRange.from,
                                            to: dateRange.from,
                                        });
                                    }
                                }
                            }}
                            className="h-6 px-2 text-xs"
                        >
                            Multi-day {isMultiDay ? "✓" : ""}
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={isAnnual ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                console.log(
                                    "Annual button clicked, current state:",
                                    isAnnual
                                );
                                setIsAnnual(!isAnnual);
                            }}
                            className="h-6 px-2 text-xs"
                        >
                            Annual {isAnnual ? "✓" : ""}
                        </Button>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="event-image" className="text-sm font-medium">
                    Event Image
                </label>
                {isUploading ? (
                    <div className="flex items-center justify-center w-full h-32 mt-1 border-2 border-dashed rounded-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : imageUrl ? (
                    <div className="mt-2 relative w-full h-40">
                        <Image
                            src={imageUrl}
                            alt="Event image"
                            layout="fill"
                            objectFit="cover"
                            className="rounded-lg"
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImageUrl("")}
                        >
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="mt-1">
                        <Input
                            id="event-image"
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center gap-2 pt-4">
                <div>
                    {onDelete && (
                        <Button
                            variant="destructive"
                            onClick={onDelete}
                            disabled={isDeleting || isSubmitting}
                            className="rounded-full"
                        >
                            {isDeleting ? "Deleting..." : deleteLabel}
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    {onCancel && (
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={isDeleting || isSubmitting}
                            className="rounded-full"
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        onClick={handleSubmit}
                        disabled={isDeleting || isSubmitting || !title}
                        className="rounded-full"
                    >
                        {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
