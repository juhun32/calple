import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { selectGroups } from "@/lib/constants/calendar";

export const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.calple.date";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function logout() {
    window.location.href = `${BACKEND_URL}/google/oauth/logout`;
}

export function login() {
    console.log("BACKEND_URL:", BACKEND_URL);
    window.location.href = `${BACKEND_URL}/google/oauth/login`;
}

export function getColorFromGroup(groupValue: string): string {
    if (!groupValue) {
        return "";
    }
    const groupInfo = selectGroups.find((group) => group.value === groupValue);
    return groupInfo ? groupInfo.color : "";
}

export function getBorderColorFromGroup(groupValue: string): string {
    if (!groupValue) {
        return "";
    }
    const groupInfo = selectGroups.find((group) => group.value === groupValue);
    return groupInfo ? groupInfo.borderColor : "";
}
