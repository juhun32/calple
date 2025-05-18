import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function logout() {
    window.location.href = "http://localhost:5000/google/oauth/logout";
}

export function login() {
    window.location.href = "http://localhost:5000/google/oauth/login";
}
