import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://python-775764204316.us-east4.run.app";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function login() {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/oauth/login`;
}

export async function logout() {
    const token = localStorage.getItem("auth_token");
    localStorage.removeItem("auth_token");

    try {
        await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/google/oauth/logout`,
            {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {},
            }
        );
        window.location.href = "/";
    } catch (error) {
        console.error("Error during logout:", error);
    }
}
