import { useState } from "react";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// internal components
import { EditDdayDialog } from "./EditDdayDialog";

// types
import { type DDayIndicatorProps } from "@/lib/types/calendar";
import { CircleSmall } from "lucide-react";

// constants
import { selectGroups } from "@/lib/constants/calendar";

export function DDayIndicator({
    dday,
    updateDDay,
    deleteDDay,
}: DDayIndicatorProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleEditClick = () => {
        setIsDetailsOpen(false);

        setTimeout(() => {
            setIsEditDialogOpen(true);
        }, 200);
    };

    const groupClass = selectGroups.find((group) => group.value === dday.group);
    const groupColor = groupClass ? groupClass.color : "";

    return (
        <>
            <AlertDialog.AlertDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            >
                <AlertDialog.AlertDialogTrigger asChild>
                    <div
                        className="flex justify-center cursor-pointer"
                        title={`${dday.title} (${dday.days})`}
                    >
                        <div className="h-5 flex justify-center items-center gap-1 w-full px-1 rounded-full text-xs font-normal border hover:cursor-pointer">
                            <CircleSmall
                                className={`${groupColor} h-4 w-4`}
                                strokeWidth={1.5}
                            />
                            <p
                                className="truncate w-full h-4 flex items-center "
                                title={dday.title}
                            >
                                {dday.title}
                            </p>
                        </div>
                    </div>
                </AlertDialog.AlertDialogTrigger>

                <AlertDialog.AlertDialogContent>
                    <AlertDialog.AlertDialogHeader>
                        <AlertDialog.AlertDialogTitle>
                            <div className="flex justify-between items-baseline gap-2">
                                <div className="flex items-baseline gap-2">
                                    {dday.title}
                                    <span className="text-xs text-gray-500">
                                        [{dday.date.toLocaleDateString()}]
                                    </span>
                                </div>
                                {dday.days}
                            </div>
                        </AlertDialog.AlertDialogTitle>

                        {dday.description ? (
                            <AlertDialog.AlertDialogDescription className="text-sm text-muted-foreground pt-2">
                                {dday.description}
                            </AlertDialog.AlertDialogDescription>
                        ) : null}
                    </AlertDialog.AlertDialogHeader>

                    <AlertDialog.AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="flex-1 sm:mr-2"
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                        <AlertDialog.AlertDialogCancel className="flex-1">
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
        </>
    );
}
