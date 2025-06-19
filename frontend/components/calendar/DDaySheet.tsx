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
        opacity: isDragging ? 0 : 1,
    };

    return (
        <Table.TableRow ref={setNodeRef} style={style}>
            <Table.TableCell
                className="flex items-center gap-1"
                {...attributes}
                {...listeners}
            >
                <div className="border rounded-full w-full">
                    <DDayIndicator
                        dday={dday}
                        updateDDay={updateDDay}
                        deleteDDay={deleteDDay}
                    />
                </div>
            </Table.TableCell>
            <Table.TableCell className="text-muted-foreground">
                {dday.date ? dday.date.toLocaleDateString() : "(Unscheduled)"}
            </Table.TableCell>
            <Table.TableCell className="text-right">
                {dday.date ? dday.days : "-"}
            </Table.TableCell>
        </Table.TableRow>
    );
}

export function DDaySheet({ ddays, updateDDay, deleteDDay }: DDaySheetProps) {
    const allDdays = [...ddays].sort((a, b) => {
        if (!a.date && b.date) return -1;
        if (a.date && !b.date) return 1;
        if (a.date && b.date) {
            return a.date.getTime() - b.date.getTime();
        }
        return 0;
    });

    const renderTable = () => (
        <div className="overflow-y-auto border rounded-lg">
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
                    {allDdays.map((day) => (
                        <DraggableDDayItem
                            key={day.id}
                            dday={day}
                            updateDDay={updateDDay}
                            deleteDDay={deleteDDay}
                        />
                    ))}
                </Table.TableBody>
            </Table.Table>
        </div>
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
                        <div className="flex-1 overflow-y-auto px-4">
                            {renderTable()}
                        </div>
                        <Sheet.SheetFooter className="max-w-screen flex flex-row px-8 justify-center">
                            <Sheet.SheetClose asChild>
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="w-1/2 hover:cursor-pointer rounded-full"
                                >
                                    Close
                                </Button>
                            </Sheet.SheetClose>
                        </Sheet.SheetFooter>
                    </Sheet.SheetContent>
                </Sheet.Sheet>
            </div>

            <div className="hidden lg:flex flex-col h-full gap-4">
                {allDdays.length > 0 ? (
                    renderTable()
                ) : (
                    <div className="border border-dashed rounded-lg flex flex-col gap-2 items-center justify-center h-full p-4">
                        <p className="text-sm text-muted-foreground">
                            Add your first event!
                        </p>
                    </div>
                )}
            </div>

            <div className="hidden lg:grid grid-cols-3 gap-1">
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
