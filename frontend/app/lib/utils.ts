import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function checkAuthStatus() {
  try {
    const response = await fetch("http://localhost:5000/api/auth/status", {
      credentials: "include",
    });

    if (!response.ok) {
      return { isAuthenticated: false, user: null };
    }

    const data = await response.json();
    return {
      isAuthenticated: data.authenticated,
      user: data.user,
    };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { isAuthenticated: false, user: null };
  }
}

export function logout() {
  window.location.href = "http://localhost:5000/google/oauth/logout";
}

export function login() {
  window.location.href = "http://localhost:5000/google/oauth/login";
}
