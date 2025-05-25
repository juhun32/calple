import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

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
import { Button } from "@/components/ui/button";
import { useDDays, type DDay } from "@/hooks/useDDays";
import { EditDdayDialog } from "./EditDdayDialog";

type DDayIndicatorProps = {
    dday: DDay;
};

export function DDayIndicator({ dday }: DDayIndicatorProps) {
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
                        className="flex justify-center cursor-pointer my-1"
                        title={`${dday.title} (${dday.days})`}
                    >
                        <div className="flex justify-center sm:hidden w-full rounded-full text-xs border hover:cursor-pointer">
                            &nbsp;
                        </div>
                        <div className="hidden sm:flex justify-center w-full sm:py-1 px-2 rounded text-xs font-normal border hover:cursor-pointer">
                            <p className="truncate justify-start">
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
            />
        </>
    );
}
