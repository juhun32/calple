import { useState } from "react";

// components
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// internal components
import { EditDdayDialog } from "./EditDdayDialog";

// types
import { type DDayIndicatorProps } from "@/lib/types/calendar";

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

    return (
        <>
            <AlertDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <AlertDialogTrigger asChild>
                    <div
                        className="flex justify-center cursor-pointer"
                        title={`${dday.title} (${dday.days})`}
                    >
                        <div className="flex justify-center sm:hidden w-full rounded-full text-xs border hover:cursor-pointer">
                            &nbsp;
                        </div>
                        <div className="hidden sm:flex justify-center w-full h-6 px-2 rounded text-xs font-normal border hover:cursor-pointer">
                            <p
                                className="truncate w-full h-full flex items-center "
                                title={dday.title}
                            >
                                {dday.title}
                            </p>
                        </div>
                    </div>
                </AlertDialogTrigger>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            <div className="flex justify-between items-baseline gap-2">
                                <div className="flex items-baseline gap-2">
                                    {dday.title}
                                    <span className="text-xs text-gray-500">
                                        [{dday.date.toLocaleDateString()}]
                                    </span>
                                </div>
                                {dday.days}
                            </div>
                        </AlertDialogTitle>

                        {dday.description ? (
                            <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
                                {dday.description}
                            </AlertDialogDescription>
                        ) : (
                            <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
                                No description
                            </AlertDialogDescription>
                        )}
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="flex-1 sm:mr-2"
                            onClick={handleEditClick}
                        >
                            Edit
                        </Button>
                        <AlertDialogCancel className="flex-1">
                            Close
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
