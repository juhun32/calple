"use client";

import { MapHeader } from "@/components/map/MapHeader";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";
import { useState } from "react";

// dynamically import leaflet map component
// this is needed to prevent server side rendering issues cause leftlet relies on the DOM
// and nextjs tries to render components on the server side
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
    ssr: false,
});

export default function MapPage() {
    const [addingPin, setAddingPin] = useState(false);

    return (
        <div className="flex-1 relative h-screen grid grid-cols-[2fr_1fr] px-8 pt-20 pb-16 container mx-auto gap-8">
            <LeafletMap addingPin={addingPin} setAddingPin={setAddingPin} />
            <div className="flex flex-col">
                <MapHeader addingPin={addingPin} setAddingPin={setAddingPin} />

                <Separator orientation="horizontal" className="my-4" />
            </div>
        </div>
    );
}
