import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_URL = process.env.BACKEND_URL;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function logout() {
    window.location.href = `${BACKEND_URL}/google/oauth/logout`;
}

export function login() {
    window.location.href = `${BACKEND_URL}/google/oauth/login`;
}
