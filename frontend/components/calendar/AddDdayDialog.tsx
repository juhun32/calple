"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

// utils
import { cn } from "@/lib/utils";

// components
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";

// icons
import { Plus, Calendar as CalendarIcon } from "lucide-react";

// types
import { type AddDDayDialogProps } from "@/lib/types/calendar";

export function AddDDayDialog({
    isOpen,
    onOpenChange,
    initialDate,
    createDDay,
}: AddDDayDialogProps) {
    const [date, setDate] = useState<Date>(initialDate || new Date());
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAnnual, setIsAnnual] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
        }
    }, [initialDate]);

    const handleSubmitAdd = async () => {
        if (!title || !date) {
            return;
        }

        // for button loading state
        setIsSubmitting(true);

        const connectedUsers = connectedEmail ? [connectedEmail] : [];

        const success = await createDDay({
            title,
            date,
            description,
            isAnnual,
            connectedUsers,
        });

        setIsSubmitting(false);

        if (success) {
            setTitle("");
            setDescription("");
            setIsAnnual(false);
            setConnectedEmail("");
        }
        if (onOpenChange) {
            onOpenChange(false);
        }
    };

    const isControlled = isOpen !== undefined && onOpenChange !== undefined;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            {!isControlled && (
                <AlertDialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="sm:w-24 h-8 flex items-center gap-2 hover:cursor-pointer"
                    >
                        <Plus className="h-6" />
                        <span className="hidden sm:flex">Create</span>
                    </Button>
                </AlertDialogTrigger>
            )}
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
                                    className="border border-gray-300 rounded-md py-1 px- text-sm w-full"
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmitAdd}
                        disabled={isSubmitting || !title || !date}
                    >
                        {isSubmitting ? "Adding..." : "Add"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
