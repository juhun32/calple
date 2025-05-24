import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_URL =
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
