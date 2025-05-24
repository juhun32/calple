import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { type DDay } from "@/hooks/useDDays";

type DDayIndicatorProps = {
    dday: DDay;
};

export function DDayIndicator({ dday }: DDayIndicatorProps) {
    return (
        <Drawer>
            <DrawerTrigger
                className="w-full flex justify-center"
                title={`${dday.title} (${dday.days})`}
            >
                <div className="flex justify-center sm:hidden w-full rounded-full text-xs border hover:cursor-pointer">
                    &nbsp;
                </div>
                <div className="hidden sm:flex justify-center w-full sm:py-1 px-2 rounded text-xs font-normal border hover:cursor-pointer">
                    <p className="truncate justify-start">{dday.title}</p>
                </div>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>
                        <div className="flex justify-between items-baseline gap-2 px-4">
                            <div className="flex items-baseline gap-2">
                                {dday.title}
                                <span className="text-xs text-gray-500">
                                    [{dday.date.toLocaleDateString()}]
                                </span>
                            </div>
                            {dday.days}
                        </div>
                    </DrawerTitle>
                </DrawerHeader>
                <DrawerClose asChild>
                    <Button
                        className="m-6 hover:cursor-pointer"
                        variant="outline"
                    >
                        Close
                    </Button>
                </DrawerClose>
            </DrawerContent>
        </Drawer>
    );
}
