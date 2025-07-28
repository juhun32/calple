import { Button } from "@/components/ui/button";

export function MapHeader({
    addingPin,
    setAddingPin,
}: {
    addingPin: boolean;
    setAddingPin: (v: boolean) => void;
}) {
    return (
        <div className="py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Map</h1>
            {addingPin && (
                <div className="absolute left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded-lg inset-shadow-sm text-sm">
                    *Click on the map to place your pin
                </div>
            )}
            <Button onClick={() => setAddingPin(!addingPin)} size="sm">
                {addingPin ? "View mode" : "Add mode"}
            </Button>
        </div>
    );
}
