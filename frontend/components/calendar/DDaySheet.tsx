// componetns
import * as Sheet from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import * as Table from "@/components/ui/table";

// icons
import { Calendar1 } from "lucide-react";

// types
import { type DDay } from "@/lib/types/calendar";

type DDaySheetProps = {
    ddays: DDay[];
};

export function DDaySheet({ ddays }: DDaySheetProps) {
    const sortedDdays = [...ddays].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
    );

    return (
        <div>
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
                        <Sheet.SheetHeader className="px-8">
                            <Sheet.SheetTitle>D-Days</Sheet.SheetTitle>
                            <Sheet.SheetDescription>
                                Days until or since, and the date of the event.
                            </Sheet.SheetDescription>
                        </Sheet.SheetHeader>
                        <div className="grid gap-4">
                            <div className="px-6">
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
                                        {sortedDdays.map((day, i) => (
                                            <Table.TableRow key={day.id || i}>
                                                <Table.TableCell className="truncate max-w-[75%]">
                                                    {day.title}
                                                </Table.TableCell>
                                                <Table.TableCell className="text-muted-foreground">
                                                    {day.date.toLocaleDateString()}
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
                        <Sheet.SheetFooter className="max-w-screen flex flex-row px-8 justify-center">
                            <Button
                                variant="outline"
                                className="w-1/2 hover:cursor-pointer"
                                onClick={() => {
                                    // Handle edit action
                                }}
                                disabled
                            >
                                Edit
                            </Button>
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

            <div className="hidden lg:flex flex-col h-full">
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
                        {sortedDdays.map((day, i) => (
                            <Table.TableRow key={day.id || i}>
                                <Table.TableCell className="truncate max-w-[75%]">
                                    {day.title}
                                </Table.TableCell>
                                <Table.TableCell className="text-muted-foreground">
                                    {day.date.toLocaleDateString()}
                                </Table.TableCell>
                                <Table.TableCell>{day.days}</Table.TableCell>
                            </Table.TableRow>
                        ))}
                    </Table.TableBody>
                </Table.Table>
            </div>
        </div>
    );
}
