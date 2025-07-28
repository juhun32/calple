import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { toast } from "sonner";

export function MapHeader({
    addingPin,
    setAddingPin,
}: {
    addingPin: boolean;
    setAddingPin: (v: boolean) => void;
}) {
    useEffect(() => {
        if (addingPin) {
            toast.info("Click on the map to place your pin");
        }
    }, [addingPin]);

    return (
        <div className="flex justify-between items-center h-fit">
            <Button
                onClick={() => setAddingPin(!addingPin)}
                size="sm"
                variant={"outline"}
            >
                {addingPin ? "Cancel" : "Click to add pin"}
            </Button>
        </div>
    );
}
