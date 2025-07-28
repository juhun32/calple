import { DatePin } from "@/lib/types/map";
import { BACKEND_URL } from "@/lib/utils";

export async function fetchPins(): Promise<DatePin[]> {
    const res = await fetch(`${BACKEND_URL}/api/pins`, {
        credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch pins");

    const { pins: userPins, partnerPins } = await res.json();

    const checkUserPins = Array.isArray(userPins) ? userPins : [];
    const checkPartnerPins = Array.isArray(partnerPins) ? partnerPins : [];

    return [
        ...checkUserPins.map((p: any) => ({ ...p, date: new Date(p.date) })),
        ...(checkPartnerPins ?? []).map((p: any) => ({
            ...p,
            date: new Date(p.date),
        })),
    ];
}

export async function savePin(payload: any, selectedPin?: DatePin) {
    const url = `${BACKEND_URL}/api/pins`;
    const body = selectedPin
        ? JSON.stringify({ ...payload, id: selectedPin.id })
        : JSON.stringify(payload);

    await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body,
    });
}

export async function deletePin(id: string) {
    await fetch(`${BACKEND_URL}/api/pins/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
}
