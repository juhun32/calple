"use client";

// components
import * as AlertDialog from "@/components/ui/alert-dialog";

// types
import { ShowAllEventsProps, type DDay } from "@/lib/types/calendar";

// constants
import { MoreHorizontal } from "lucide-react";
import { DDayIndicator } from "./DDayIndicator";
import * as Table from "../ui/table";

// dialog component for showing all events when there are more than 3 events on a day - used by CalendarGrid
export function ShowAllEvents({
    ddays = [],
    updateDDay,
    deleteDDay,
}: ShowAllEventsProps) {
    return (
        <AlertDialog.AlertDialog>
            {/* trigger button - shows "more events" indicator - clicked when there are 4+ events on a day */}
            <AlertDialog.AlertDialogTrigger asChild>
                <div className="h-5 w-full flex items-center justify-center gap-1 px-1 rounded-full text-xs font-normal border border-dashed hover:cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1} />
                </div>
            </AlertDialog.AlertDialogTrigger>
            <AlertDialog.AlertDialogContent>
                <AlertDialog.AlertDialogHeader>
                    <AlertDialog.AlertDialogTitle className="flex gap-2 items-baseline">
                        <p className="text-sm text-muted-foreground">
                            All Events for
                        </p>

                        {/* display the date for all events - formatted date from first event */}
                        {ddays[0]?.date?.toLocaleDateString("default", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </AlertDialog.AlertDialogTitle>
                </AlertDialog.AlertDialogHeader>
                <AlertDialog.AlertDialogDescription asChild>
                    <div>
                        {ddays.length > 0 ? (
                            <Table.Table>
                                <Table.TableHeader>
                                    <Table.TableRow>
                                        <Table.TableHead className="w-3/5 text-xs">
                                            Event
                                        </Table.TableHead>
                                        <Table.TableHead className="text-xs">
                                            Date
                                        </Table.TableHead>
                                        <Table.TableHead className="text-right text-xs">
                                            Count
                                        </Table.TableHead>
                                    </Table.TableRow>
                                </Table.TableHeader>
                                <Table.TableBody>
                                    {/* render each event in a table row - uses DDayIndicator for consistent display */}
                                    {ddays.map((day) => (
                                        <Table.TableRow key={day.id}>
                                            <Table.TableCell>
                                                <DDayIndicator
                                                    dday={day}
                                                    length="long"
                                                    updateDDay={updateDDay}
                                                    deleteDDay={deleteDDay}
                                                />
                                            </Table.TableCell>
                                            <Table.TableCell className="text-muted-foreground">
                                                {day.date
                                                    ? day.date.toLocaleDateString()
                                                    : "(Unscheduled)"}
                                            </Table.TableCell>
                                            <Table.TableCell className="text-right">
                                                {day.date ? day.days : "-"}
                                            </Table.TableCell>
                                        </Table.TableRow>
                                    ))}
                                </Table.TableBody>
                            </Table.Table>
                        ) : null}
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
