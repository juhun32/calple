import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";

import { NavBar } from "@/components/navbar";
import { TokenHandler } from "@/components/token-handler";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Calple",
    description: "For your healthier dating life",
};

async function getAuthStatus() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("calple_session");

    if (!sessionCookie) return { isAuthenticated: false, user: null };

    try {
        const headers = new Headers();
        headers.append(
            "Cookie",
            `${sessionCookie.name}=${sessionCookie.value}`
        );
        headers.append("Content-Type", "application/json");

        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
            headers,
            cache: "no-store",
        });

        if (!response.ok) {
            return { isAuthenticated: false, user: null };
        }

        const data = await response.json();
        return {
            isAuthenticated: data.authenticated,
            user: data.user,
        };
    } catch {
        return { isAuthenticated: false, user: null };
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const initialAuthState = await getAuthStatus();

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <AuthProvider initialState={initialAuthState}>
                        <TokenHandler />
                        <NavBar />
                        {children}
                        <div className="fixed bottom-0 left-0 w-full flex justify-center z-50 border-t border-dashed px-8">
                            <div className="container flex">
                                <div className="flex flex-col px-6 py-2 container text-muted-foreground text-xs">
                                    J&E &copy; 2025
                                </div>
                                <div className="flex justify-end gap-2 px-6 py-2 container text-muted-foreground text-xs">
                                    <a
                                        href="/privacy"
                                        className="text-muted-foreground hover:text-stone-500 underline"
                                    >
                                        [Privacy]
                                    </a>
                                    <a
                                        href="/terms"
                                        className="text-muted-foreground hover:text-stone-500 underline"
                                    >
                                        [Terms]
                                    </a>
                                </div>
                            </div>
                        </div>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
