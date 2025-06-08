"use client";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";

// types
import { type DDay } from "@/lib/types/calendar";

// constants
import { selectGroups } from "@/lib/constants/calendar";
import { CircleSmall } from "lucide-react";

type ShowAllEventsProps = {
    ddays: DDay[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ShowAllEvents({
    ddays = [],
    isOpen,
    onOpenChange,
}: ShowAllEventsProps) {
    const getGroupColor = (groupValue: string | undefined) => {
        if (!groupValue) return "";
        const groupInfo = selectGroups.find(
            (group) => group.value === groupValue
        );
        return groupInfo ? groupInfo.color : "";
    };

    return (
        <AlertDialog.AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle>
                        All Events for {}
                        {/* not implemented yet */}
                    </AlertDialog.AlertDialogTitle>
                </AlertDialog.AlertDialogHeader>
                <AlertDialog.AlertDialogDescription asChild>
                    <div className="flex flex-col gap-2">
                        {ddays.length > 0 ? (
                            ddays.map((individualDday, idx) => (
                                <div
                                    key={`dday-dialog-${
                                        individualDday.id || idx
                                    }`}
                                    className="flex justify-between items-center p-2 border-b"
                                >
                                    <div className="flex items-center gap-2">
                                        <CircleSmall
                                            className={`h-4 w-4 ${getGroupColor(
                                                individualDday.group
                                            )}`}
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-sm font-medium">
                                            {individualDday.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {individualDday.days}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No events to display for this day.
                            </p>
                        )}
                    </div>
                </AlertDialog.AlertDialogDescription>

                <AlertDialog.AlertDialogFooter>
                    <AlertDialog.AlertDialogCancel>
                        Close
                    </AlertDialog.AlertDialogCancel>
                </AlertDialog.AlertDialogFooter>
            </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
    );
}
