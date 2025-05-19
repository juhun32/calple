import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://python-775764204316.us-east4.run.app";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function logout() {
    window.location.href = `${BACKEND_URL}/google/oauth/logout`;
}

export function login() {
    window.location.href = `${BACKEND_URL}/google/oauth/login`;
}
