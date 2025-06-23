import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// internal components
import { EditDdayDialog } from "./EditDdayDialog";
import { cn, getColorFromGroup } from "@/lib/utils";

// types
import { type DDayIndicatorProps } from "@/lib/types/calendar";
import { CircleSmall } from "lucide-react";

export function DDayIndicator({
    dday,
    updateDDay,
    deleteDDay,
    context = "grid",
    length = "short",
    position = "single",
    dayIndex,
    droppableId,
}: DDayIndicatorProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const draggableId = droppableId
        ? `${dday.id}-${droppableId}`
        : `${dday.id}-${context}`;

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: draggableId,
        data: { dday, context, position },
    });

    const handleEditClick = () => {
        setIsDetailsOpen(false);

        setTimeout(() => {
            setIsEditDialogOpen(true);
        }, 200);
    };

    const getBorderStyles = () => {
        switch (position) {
            case "start":
                return "ml-1 rounded-l-full rounded-r-none border-r-0";
            case "middle":
                return "rounded-none border-l-0 border-r-0";
            case "end":
                return "mr-1 rounded-l-none rounded-r-full border-l-0";
            case "single":
            default:
                return "rounded-full mx-1";
        }
    };

    const isStartOfWeek = dayIndex !== undefined && dayIndex % 7 === 0;
    const showTitle =
        position === "start" || position === "single" || isStartOfWeek;

    return (
        <div className={`border border-dashed ${getBorderStyles()} text-sm`}>
            <AlertDialog.AlertDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            >
                <AlertDialog.AlertDialogTrigger asChild>
                    <div
                        ref={setNodeRef}
                        {...attributes}
                        {...listeners}
                        className="flex items-center sm:gap-1 w-full h-full px-1 font-normal hover:cursor-pointer"
                        title={`${dday.title} (${dday.days})`}
                    >
                        {showTitle ? (
                            <>
                                <CircleSmall
                                    className={`h-4 w-4 ${getColorFromGroup(
                                        dday.group
                                    )}`}
                                    strokeWidth={1.5}
                                />
                                <p
                                    className={cn(
                                        "w-full",
                                        length === "long"
                                            ? "truncate max-w-[20rem]"
                                            : "truncate max-w-[7rem]"
                                    )}
                                    title={dday.title}
                                >
                                    {dday.title}
                                </p>
                            </>
                        ) : (
                            <>&nbsp;</>
                        )}
                    </div>
                </AlertDialog.AlertDialogTrigger>

                <AlertDialog.AlertDialogContent>
                    <AlertDialog.AlertDialogHeader>
                        <AlertDialog.AlertDialogTitle>
                            <div className="flex justify-between items-baseline gap-2">
                                <div className="flex items-baseline gap-2">
                                    {dday.title}
                                    {dday.date && (
                                        <span className="text-xs text-gray-500">
                                            [{dday.date.toLocaleDateString()}]
                                        </span>
                                    )}
                                </div>
                                {dday.days}
                            </div>
                        </AlertDialog.AlertDialogTitle>
                        <AlertDialog.AlertDialogDescription className="text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CircleSmall
                                    className={`h-4 w-4 ${getColorFromGroup(
                                        dday.group
                                    )}`}
                                    strokeWidth={1.5}
                                />
                                {dday.group}
                            </span>
                        </AlertDialog.AlertDialogDescription>
                        {dday.description ? (
                            <AlertDialog.AlertDialogDescription className="text-sm text-muted-foreground p-2 border rounded-lg">
                                {dday.description}
                            </AlertDialog.AlertDialogDescription>
                        ) : null}
                    </AlertDialog.AlertDialogHeader>

                    <AlertDialog.AlertDialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="sm:mr-2 rounded-full w-20"
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                        <AlertDialog.AlertDialogCancel className="rounded-full w-20">
                            Close
                        </AlertDialog.AlertDialogCancel>
                    </AlertDialog.AlertDialogFooter>
                </AlertDialog.AlertDialogContent>
            </AlertDialog.AlertDialog>

            <EditDdayDialog
                dday={dday}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                updateDDay={updateDDay}
                deleteDDay={deleteDDay}
            />
        </div>
    );
}
