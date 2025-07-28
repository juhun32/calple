import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { DatePin } from "@/lib/types/map";

export function ViewPinDialog({
    selectedPin,
    isEditing,
    setSelectedPin,
    editPin,
    deletePin,
}: {
    selectedPin: DatePin | null;
    isEditing: boolean;
    setSelectedPin: (pin: DatePin | null) => void;
    editPin: (pin: DatePin) => void;
    deletePin: (id: string) => void;
}) {
    return (
        <Dialog
            open={!!selectedPin && !isEditing}
            onOpenChange={(open) => {
                if (!open) setSelectedPin(null);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedPin?.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-2">
                    <p className="text-sm text-muted-foreground">
                        {selectedPin?.location}
                    </p>
                    <p className="text-sm">{selectedPin?.description}</p>
                    <p className="text-xs text-muted-foreground">
                        {selectedPin && format(selectedPin.date, "PPP")}
                    </p>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectedPin && editPin(selectedPin)}
                    >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => selectedPin && deletePin(selectedPin.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function EditPinDialog({
    isEditing,
    setIsEditing,
    setAddingPin,
    selectedPin,
    formData,
    setFormData,
    savePin,
}: {
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    setAddingPin: (v: boolean) => void;
    selectedPin: DatePin | null;
    formData: any;
    setFormData: (f: any) => void;
    savePin: () => void;
}) {
    return (
        <Dialog
            open={isEditing}
            onOpenChange={(open) => {
                setIsEditing(open);
                if (!open) setAddingPin(false);
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {selectedPin ? "Edit Pin" : "New Pin"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData((f: any) => ({
                                ...f,
                                title: e.target.value,
                            }))
                        }
                    />
                    <Input
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData((f: any) => ({
                                ...f,
                                location: e.target.value,
                            }))
                        }
                    />
                    <Textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((f: any) => ({
                                ...f,
                                description: e.target.value,
                            }))
                        }
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(formData.date, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(d) =>
                                    d &&
                                    setFormData((f: any) => ({
                                        ...f,
                                        date: d,
                                    }))
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter className="flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={savePin}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
