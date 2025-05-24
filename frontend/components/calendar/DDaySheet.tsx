import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar1 } from "lucide-react";
import { type DDay } from "@/hooks/useDDays";

type DDaySheetProps = {
    ddays: DDay[];
};

export function DDaySheet({ ddays }: DDaySheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-8">
                    <Calendar1 className="h-6" />
                    <p className="hidden sm:flex">View D-Days</p>
                </Button>
            </SheetTrigger>
            <SheetContent side="top">
                <SheetHeader>
                    <SheetTitle>D-Days</SheetTitle>
                    <SheetDescription>
                        Days until or since, and the date of the event.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4">
                    <div className="px-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-4/5">
                                        Event
                                    </TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">
                                        Count
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ddays.map((day, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="truncate max-w-3/4">
                                            {day.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {day.date.toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {day.days}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <SheetFooter className="max-w-screen flex flex-row px-5 justify-center">
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
                    <SheetClose asChild>
                        <Button
                            variant="outline"
                            type="submit"
                            className="w-1/2 hover:cursor-pointer"
                        >
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
