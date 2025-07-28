"use client";

import dynamic from "next/dynamic";

// dynamically import leaflet map component
// this is needed to prevent server side rendering issues cause leftlet relies on the DOM
// and nextjs tries to render components on the server side
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
    ssr: false,
});

export default function MapPage() {
    return (
        <div className="flex-1 relative h-screen">
            <LeafletMap />
        </div>
    );
}
