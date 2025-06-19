// drag & drop
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// componetns
import * as Sheet from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import * as Table from "@/components/ui/table";

// icons
import { Calendar1, CircleSmall, GripVertical } from "lucide-react";

// types
import { type DDay } from "@/lib/types/calendar";

// utils
import { cn, getColorFromGroup } from "@/lib/utils";

// constants
import { selectGroups } from "@/lib/constants/calendar";
import { DDayIndicator } from "./DDayIndicator";

type DDaySheetProps = {
    ddays: DDay[];
    updateDDay: (
        id: string,
        updates: Partial<Omit<any, "id" | "days">>
    ) => Promise<boolean>;
    deleteDDay: (id: string) => Promise<boolean>;
};

function DraggableDDayItem({
    dday,
    updateDDay,
    deleteDDay,
}: {
    dday: DDay;
    updateDDay: DDaySheetProps["updateDDay"];
    deleteDDay: DDaySheetProps["deleteDDay"];
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: dday.id,
        });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: "none",
    };

    return (
        <Table.TableCell
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center rounded-md",
                isDragging ? "border border-dashed w-fit" : ""
            )}
        >
            <DDayIndicator
                dday={dday}
                updateDDay={updateDDay}
                deleteDDay={deleteDDay}
            />
        </Table.TableCell>
    );
}

export function DDaySheet({ ddays, updateDDay, deleteDDay }: DDaySheetProps) {
    const datedDdays = ddays.filter((d) => d.date);
    const datelessDdays = ddays.filter((d) => !d.date);

    const sortedDdays = [...datedDdays].sort(
        (a, b) => a.date!.getTime() - b.date!.getTime()
    );

    return (
        <>
            <div className="flex lg:hidden">
                <Sheet.Sheet>
                    <Sheet.SheetTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full h-8 w-8 sm:w-fit"
                        >
                            <Calendar1 className="h-6" />
                            <p className="hidden sm:flex">D-Days</p>
                        </Button>
                    </Sheet.SheetTrigger>
                    <Sheet.SheetContent side="top">
                        <Sheet.SheetHeader className="px-4">
                            <Sheet.SheetTitle>D-Days</Sheet.SheetTitle>
                            <Sheet.SheetDescription>
                                Days until or since, and the date of the event.
                            </Sheet.SheetDescription>
                        </Sheet.SheetHeader>
                        <div className="flex-1 overflow-y-auto px-4 space-y-4">
                            {datelessDdays.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-xs mb-2">
                                        Unscheduled
                                    </h4>
                                    <div className="overflow-y-auto border rounded-md">
                                        <Table.Table>
                                            <Table.TableHeader>
                                                <Table.TableRow>
                                                    <Table.TableHead className="w-full">
                                                        Event
                                                    </Table.TableHead>
                                                </Table.TableRow>
                                            </Table.TableHeader>
                                            <Table.TableBody>
                                                {datelessDdays.map((day) => (
                                                    <Table.TableRow
                                                        key={day.id}
                                                    >
                                                        <DraggableDDayItem
                                                            dday={day}
                                                            updateDDay={
                                                                updateDDay
                                                            }
                                                            deleteDDay={
                                                                deleteDDay
                                                            }
                                                        />
                                                    </Table.TableRow>
                                                ))}
                                            </Table.TableBody>
                                        </Table.Table>
                                    </div>
                                </div>
                            )}
                            {sortedDdays.length > 0 && (
                                <div>
                                    <h4 className="font-medium text-xs mb-2">
                                        Scheduled
                                    </h4>
                                    <div className="overflow-y-auto border rounded-md">
                                        <Table.Table>
                                            <Table.TableHeader>
                                                <Table.TableRow>
                                                    <Table.TableHead className="w-4/5">
                                                        Event
                                                    </Table.TableHead>
                                                    <Table.TableHead>
                                                        Date
                                                    </Table.TableHead>
                                                    <Table.TableHead className="text-right">
                                                        Count
                                                    </Table.TableHead>
                                                </Table.TableRow>
                                            </Table.TableHeader>
                                            <Table.TableBody>
                                                {sortedDdays.map((day) => (
                                                    <Table.TableRow
                                                        key={day.id}
                                                    >
                                                        <DraggableDDayItem
                                                            dday={day}
                                                            updateDDay={
                                                                updateDDay
                                                            }
                                                            deleteDDay={
                                                                deleteDDay
                                                            }
                                                        />
                                                        <Table.TableCell className="text-muted-foreground">
                                                            {day.date!.toLocaleDateString()}
                                                        </Table.TableCell>
                                                        <Table.TableCell className="text-right">
                                                            {day.days}
                                                        </Table.TableCell>
                                                    </Table.TableRow>
                                                ))}
                                            </Table.TableBody>
                                        </Table.Table>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Sheet.SheetFooter className="max-w-screen flex flex-row px-8 justify-center">
                            <Sheet.SheetClose asChild>
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="w-1/2 hover:cursor-pointer"
                                >
                                    Close
                                </Button>
                            </Sheet.SheetClose>
                        </Sheet.SheetFooter>
                    </Sheet.SheetContent>
                </Sheet.Sheet>
            </div>

            <div className="hidden lg:flex flex-col h-full gap-4">
                {datelessDdays.length > 0 && (
                    <div>
                        <h4 className="font-medium text-xs">Unscheduled</h4>
                        <div className="overflow-y-auto border rounded-md">
                            <Table.Table>
                                <Table.TableHeader>
                                    <Table.TableRow>
                                        <Table.TableHead className="w-full">
                                            Event
                                        </Table.TableHead>
                                    </Table.TableRow>
                                </Table.TableHeader>
                                <Table.TableBody>
                                    {datelessDdays.map((day) => (
                                        <Table.TableRow key={day.id}>
                                            <DraggableDDayItem
                                                dday={day}
                                                updateDDay={updateDDay}
                                                deleteDDay={deleteDDay}
                                            />
                                        </Table.TableRow>
                                    ))}
                                </Table.TableBody>
                            </Table.Table>
                        </div>
                    </div>
                )}
                <div>
                    <h4 className="font-medium text-xs">Scheduled</h4>
                    <div className="overflow-y-auto border rounded-md">
                        <Table.Table>
                            <Table.TableHeader>
                                <Table.TableRow>
                                    <Table.TableHead className="w-full">
                                        Event
                                    </Table.TableHead>
                                    <Table.TableHead>Date</Table.TableHead>
                                    <Table.TableHead>Count</Table.TableHead>
                                </Table.TableRow>
                            </Table.TableHeader>
                            <Table.TableBody>
                                {sortedDdays.map((day) => (
                                    <Table.TableRow key={day.id}>
                                        <DraggableDDayItem
                                            dday={day}
                                            updateDDay={updateDDay}
                                            deleteDDay={deleteDDay}
                                        />
                                        <Table.TableCell className="text-muted-foreground">
                                            {day.date!.toLocaleDateString()}
                                        </Table.TableCell>
                                        <Table.TableCell>
                                            {day.days}
                                        </Table.TableCell>
                                    </Table.TableRow>
                                ))}
                            </Table.TableBody>
                        </Table.Table>
                    </div>
                </div>
            </div>
            <div className="hidden lg:flex flex-col gap-1">
                {selectGroups.map((group, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                        <CircleSmall
                            className={`h-4 w-4 ${group.color}`}
                            strokeWidth={1.5}
                        />
                        <span className="text-xs font-medium">
                            {group.label}
                        </span>
                    </div>
                ))}
            </div>
        </>
    );
}
