"use client";

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapHeader } from "./MapHeader";
import { MapPins } from "./MapPins";
import { ViewPinDialog, EditPinDialog } from "./PinDialogs";
import { DatePin } from "@/lib/types/map";
import { fetchPins, savePin, deletePin } from "@/lib/api/map";

// fix leaflets default icon paths
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
});

interface RecenterProps {
    latlng: [number, number];
    zoom?: number;
}

function Recenter({ latlng, zoom = 13 }: RecenterProps) {
    const map = useMap();
    useEffect(() => {
        map.setView(latlng, zoom);
    }, [latlng.join(","), zoom, map]);
    return null;
}

export default function LeafletMap({
    addingPin,
    setAddingPin,
}: {
    addingPin: boolean;
    setAddingPin: (v: boolean) => void;
}) {
    const [pins, setPins] = useState<DatePin[]>([]);

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

    const [userPosition, setUserPosition] = useState<[number, number] | null>(
        null
    );

    useEffect(() => {
        // ask for permission and fetch once
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    setUserPosition([coords.latitude, coords.longitude]);
                },
                (err) => {
                    console.warn("Geolocation failed or denied:", err);
                    // leave userPosition as null → fallback center
                }
            );
        }
    }, []);

    console.log("userPosition", userPosition);

    const fetchPinsCallback = useCallback(async () => {
        try {
            const all = await fetchPins();
            setPins(all);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchPinsCallback();
    }, [fetchPinsCallback]);

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
                setIsEditing(true); // open dialog
                setSelectedPin(null);
            },
        });
        return null;
    }

    async function handleSavePin() {
        const payload = {
            lat: formData.lat,
            lng: formData.lng,
            title: formData.title,
            description: formData.description,
            location: formData.location,
            date: formData.date.toISOString().split("T")[0],
        };

        try {
            await savePin(payload, selectedPin ?? undefined);
            setIsEditing(false);
            setSelectedPin(null);
            fetchPinsCallback();
        } catch (err) {
            console.error("savePin error", err);
        }
    }

    async function handleDeletePin(id: string) {
        try {
            await deletePin(id);
            setSelectedPin(null);
            setIsEditing(false);
            fetchPinsCallback();
        } catch (err) {
            console.error("deletePin error", err);
        }
    }

    // this is also add
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
        <div className="h-full w-full flex flex-col">
            <div className="flex-1 relative inset-shadow-sm rounded-lg">
                <MapContainer
                    // key is for forcing remount only when userPosition changes
                    // it was causing appendChild issues when remounts the map with same DOM node
                    // this is a workaround for a known issue with leaflet
                    key={userPosition ? userPosition.join(",") : "default"}
                    center={userPosition ?? [20, 0]}
                    zoom={userPosition ? 7 : 2}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                    className="rounded-lg border z-0"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* locate user and recenter map */}
                    {userPosition && (
                        <Recenter latlng={userPosition} zoom={13} />
                    )}

                    <MapClickHandler />
                    <MapPins
                        pins={pins}
                        setSelectedPin={setSelectedPin}
                        setIsEditing={setIsEditing}
                    />
                    <ViewPinDialog
                        selectedPin={selectedPin}
                        isEditing={isEditing}
                        setSelectedPin={setSelectedPin}
                        editPin={editPin}
                        deletePin={handleDeletePin}
                    />
                    <EditPinDialog
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        setAddingPin={setAddingPin}
                        selectedPin={selectedPin}
                        formData={formData}
                        setFormData={setFormData}
                        savePin={handleSavePin}
                    />
                </MapContainer>
            </div>
        </div>
    );
}
