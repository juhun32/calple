"use client";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";

// types
import { type DDay } from "@/lib/types/calendar";

// constants
import { CircleSmall, EllipsisVertical } from "lucide-react";
import { getColorFromGroup } from "@/lib/utils";
import { Button } from "../ui/button";
import { DDayIndicator } from "./DDayIndicator";

type ShowAllEventsProps = {
    ddays: DDay[];
    updateDDay: (
        id: string,
        updates: Partial<Omit<any, "id" | "days">>
    ) => Promise<boolean>;
    deleteDDay: (id: string) => Promise<boolean>;
};

export function ShowAllEvents({
    ddays = [],
    updateDDay,
    deleteDDay,
}: ShowAllEventsProps) {
    return (
        <AlertDialog.AlertDialog>
            <AlertDialog.AlertDialogTrigger asChild>
                <div className="h-5 w-full flex items-center justify-center gap-1 px-1 rounded-full text-xs font-normal border hover:cursor-pointer">
                    <EllipsisVertical className="h-3 w-3" />
                </div>
            </AlertDialog.AlertDialogTrigger>
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle className="flex gap-2 items-baseline">
                        <p className="text-sm text-muted-foreground">
                            All Events for
                        </p>

                        {ddays[0]?.date?.toLocaleDateString("default", {
                            month: "long",
                            day: "numeric",
                        })}
                    </AlertDialog.AlertDialogTitle>
                </AlertDialog.AlertDialogHeader>
                <AlertDialog.AlertDialogDescription asChild>
                    <div>
                        {ddays.length > 0
                            ? ddays.map((individualDday, idx) => (
                                  <div
                                      key={`dday-dialog-${
                                          individualDday.id || idx
                                      }`}
                                      className="flex gap-2 items-center p-2 border-b text-foreground"
                                  >
                                      <DDayIndicator
                                          dday={individualDday}
                                          updateDDay={updateDDay}
                                          deleteDDay={deleteDDay}
                                      />
                                  </div>
                              ))
                            : null}
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
