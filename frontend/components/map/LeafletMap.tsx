"use client";

import { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

const LucideIcon = L.divIcon({
    // remove leaflets default .leaflet-div-icon styles
    className: "",
    html: renderToStaticMarkup(<MapPin size={32} strokeWidth={2} />),
    iconSize: [32, 32],
    // pins tip at bottom center
    iconAnchor: [16, 32],
});

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Fix Leaflet’s default icon paths once
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});

interface DatePin {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    location: string;
    date: Date;
}

export default function LeafletMap() {
    const [pins, setPins] = useState<DatePin[]>([]);
    const [addingPin, setAddingPin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPin, setSelectedPin] = useState<DatePin | null>(null);

    const [formData, setFormData] = useState<Omit<DatePin, "id">>({
        lat: 0,
        lng: 0,
        title: "",
        description: "",
        location: "",
        date: new Date(),
    });

    // load/save from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("datePins");
        if (stored) {
            setPins(
                JSON.parse(stored).map((p: any) => ({
                    ...p,
                    date: new Date(p.date),
                }))
            );
        }
    }, []);
    useEffect(() => {
        localStorage.setItem("datePins", JSON.stringify(pins));
    }, [pins]);

    // attach click handler inside the map
    function MapClickHandler() {
        useMapEvents({
            click(e) {
                if (!addingPin) return;
                setFormData({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    title: "",
                    description: "",
                    location: "",
                    date: new Date(),
                });
                setAddingPin(false);
                setIsEditing(true); // this opens dialog
                setSelectedPin(null);
            },
        });
        return null;
    }

    function savePin() {
        if (selectedPin && isEditing) {
            setPins(
                pins.map((p) =>
                    p.id === selectedPin.id
                        ? { ...formData, id: selectedPin.id }
                        : p
                )
            );
        } else {
            setPins([...pins, { ...formData, id: Date.now().toString() }]);
        }
        setIsEditing(false);
        setSelectedPin(null);
    }

    function deletePin(id: string) {
        setPins(pins.filter((p) => p.id !== id));
        setSelectedPin(null);
        setIsEditing(false);
    }

    function editPin(pin: DatePin) {
        setFormData({
            lat: pin.lat,
            lng: pin.lng,
            title: pin.title,
            description: pin.description,
            location: pin.location,
            date: pin.date,
        });
        setSelectedPin(pin);
        setIsEditing(true);
    }

    return (
        <div className="h-full w-full flex flex-col px-8 pt-20 pb-16 container mx-auto">
            <div className="py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Map</h1>
                {addingPin && (
                    <div className="absolute left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded-lg inset-shadow-sm text-sm">
                        *Click on the map to place your pin
                    </div>
                )}
                <Button onClick={() => setAddingPin((a) => !a)} size={"sm"}>
                    {addingPin ? "View mode" : "Add mode"}
                </Button>
            </div>

            <div className="flex-1 relative">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                    className="rounded-lg border z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler />

                    {pins.map((pin) => (
                        <Marker
                            key={pin.id}
                            position={[pin.lat, pin.lng]}
                            icon={LucideIcon}
                            eventHandlers={{
                                click: () => {
                                    setSelectedPin(pin);
                                    setIsEditing(false);
                                },
                            }}
                        />
                    ))}

                    <Dialog
                        open={!!selectedPin && !isEditing}
                        onOpenChange={(open) => {
                            if (!open) setSelectedPin(null);
                        }}
                    >
                        <DialogContent className="">
                            <DialogHeader>
                                <DialogTitle>{selectedPin?.title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2 py-2">
                                <p className="text-sm text-muted-foreground">
                                    {selectedPin?.location}
                                </p>
                                <p className="text-sm">
                                    {selectedPin?.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedPin &&
                                        format(selectedPin.date, "PPP")}
                                </p>
                            </div>

                            <DialogFooter className="flex justify-between">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        selectedPin && editPin(selectedPin)
                                    }
                                >
                                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                        selectedPin && deletePin(selectedPin.id)
                                    }
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </MapContainer>
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
                                    setFormData((f) => ({
                                        ...f,
                                        title: e.target.value,
                                    }))
                                }
                            />

                            <Input
                                placeholder="Location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData((f) => ({
                                        ...f,
                                        location: e.target.value,
                                    }))
                                }
                            />

                            <Textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((f) => ({
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
                                            setFormData((f) => ({
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
            </div>
        </div>
    );
}
